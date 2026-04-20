import { MEAL_TYPE } from '~/shared/constants/meal-type';

import {
  IDishCatalogPromptInput,
  IInputGenerateMeal,
  IMealSlotPromptInput
} from './ai-type';

const MEAL_TYPES = Object.values(MEAL_TYPE);
const MEAL_TYPES_LIST = MEAL_TYPES.map(value => `"${value}"`).join(', ');

export const MEAL_RECOMMENDATION_PROMPT_CONFIG = {
  maxDishesPerMeal: 3,
  minServings: 1,
  maxServings: 5,
  maxCatalogItems: 120
} as const;

type MealRecommendationPromptConfig = {
  dateISO: string;
  dayOfWeek: string;
  mealSlots: IMealSlotPromptInput[];
  dishCatalog: IDishCatalogPromptInput[];
  retrievalSummary?: string;
};

const formatMealSlots = (mealSlots: IMealSlotPromptInput[]) =>
  mealSlots
    .map((slot, index) => {
      const dishCategories =
        slot.dishCategories.length > 0 ? slot.dishCategories.join(', ') : 'N/A';
      const preferredTypes =
        slot.preferredTypes.length > 0 ? slot.preferredTypes.join(', ') : 'N/A';

      return [
        `       ${index + 1}. mealType: "${slot.mealType}"`,
        `          - mealSettingName: "${slot.mealSettingName}"`,
        `          - targetDishCount: ${slot.dishCount}`,
        `          - preferredTypes: ${preferredTypes}`,
        `          - mealSize: ${slot.mealSize ?? 'N/A'}`,
        `          - cookingPreference: ${slot.cookingPreference ?? 'N/A'}`,
        `          - availableTime: ${slot.availableTime ?? 'N/A'}`,
        `          - complexity: ${slot.complexity ?? 'N/A'}`,
        `          - dishCategories: ${dishCategories}`
      ].join('\n');
    })
    .join('\n');

const formatDishCatalog = (dishCatalog: IDishCatalogPromptInput[]) =>
  dishCatalog
    .map((dish, index) => {
      const nutrientSummary = dish.nutrients
        .slice(0, 6)
        .map(item => `${item.label}: ${item.value}${item.unit}`)
        .join(', ');

      return [
        `       ${index + 1}. id: "${dish.id}"`,
        `          - name: "${dish.name}"`,
        `          - suggestedMealTypes: ${
          dish.suggestedMealTypes.length > 0
            ? dish.suggestedMealTypes.join(', ')
            : 'N/A'
        }`,
        `          - categories: ${
          dish.categories.length > 0 ? dish.categories.join(', ') : 'N/A'
        }`,
        `          - nutritionFocus: ${
          dish.nutritionFocus.length > 0
            ? dish.nutritionFocus.join(', ')
            : 'N/A'
        }`,
        `          - tags: ${dish.tags.length > 0 ? dish.tags.join(', ') : 'N/A'}`,
        `          - totalTimeMinutes: ${dish.totalTimeMinutes}`,
        `          - defaultServings: ${dish.defaultServings}`,
        `          - nutrients: ${nutrientSummary || 'N/A'}`
      ].join('\n');
    })
    .join('\n');

const formatMacroTargets = (input: IInputGenerateMeal) => {
  const macroTargets = input.macroTargets;

  if (!macroTargets) return 'N/A';

  const toRangeText = (value?: { min?: number; max?: number }) => {
    if (!value) return 'N/A';
    if (typeof value.min === 'number' && typeof value.max === 'number') {
      return `${value.min}-${value.max}g`;
    }
    if (typeof value.min === 'number') return `>=${value.min}g`;
    if (typeof value.max === 'number') return `<=${value.max}g`;
    return 'N/A';
  };

  return `Carbs: ${toRangeText(macroTargets.carbs)}, Protein: ${toRangeText(
    macroTargets.protein
  )}, Fat: ${toRangeText(macroTargets.fat)}`;
};

const mealRecommendationPrompt = (
  input: IInputGenerateMeal,
  {
    dateISO,
    dayOfWeek,
    mealSlots,
    dishCatalog,
    retrievalSummary
  }: MealRecommendationPromptConfig
) => {
  const mealSlotsBlock = formatMealSlots(mealSlots);
  const dishCatalogBlock = formatDishCatalog(dishCatalog);
  const retrievalBlock = retrievalSummary
    ? `     
     Retrieval notes:
${retrievalSummary}
`
    : '';

  return `You are an experienced nutrition coach creating a daily meal recommendation from an existing dish catalog.
     
     USER PROFILE:
     - Gender: ${input.gender ?? 'N/A'}
     - Age: ${input.age ?? 'N/A'}
     - Height (cm): ${input.height ?? 'N/A'}
     - Current weight (kg): ${input.weight ?? 'N/A'}
     - Target weight (kg): ${input.targetWeight ?? 'N/A'}
     - Goal: ${input.fitnessGoal ?? 'N/A'}
     - Diet: ${input.diet ?? 'N/A'}
     - Activity level: ${input.activityLevel ?? 'N/A'}
     - Body fat: ${input.bodyfat ?? 'N/A'}
     - Allergens: ${
       input.allergens && input.allergens.length > 0
         ? input.allergens.join(', ')
         : 'N/A'
     }
     - Medical history: ${
       input.medicalHistory && input.medicalHistory.length > 0
         ? input.medicalHistory.join(', ')
         : 'N/A'
     }
     - Calories target: ${input.caloriesTarget ?? 'N/A'}
     - Macro targets: ${formatMacroTargets(input)}
${retrievalBlock}
     SCHEDULE INFORMATION:
     - date: ${dateISO}
     - dayOfWeek: ${dayOfWeek}
     - meal slots (${mealSlots.length}):
${mealSlotsBlock}

     DISH CATALOG (ONLY choose from this list, by exact id):
${dishCatalogBlock}

     STRICT REQUIREMENTS:
     - You MUST return EXACTLY ${mealSlots.length} meal objects, in the same order as meal slots.
     - "mealType" MUST match each slot's mealType exactly.
     - For each meal, pick up to ${
       MEAL_RECOMMENDATION_PROMPT_CONFIG.maxDishesPerMeal
     } dishes and do not exceed the slot targetDishCount.
     - Dish IDs MUST come from the provided catalog only.
     - servings must be integer between ${
       MEAL_RECOMMENDATION_PROMPT_CONFIG.minServings
     } and ${MEAL_RECOMMENDATION_PROMPT_CONFIG.maxServings}.
     - Do not repeat the same dishId across different meals in the same day unless there are not enough unique dishes.
     - Use retrieval notes to reduce repeating dishes from recent days when alternatives exist.
     - Respect allergens, meal constraints, user goal, and nutrition balance.
     - Do NOT invent new fields.
     
     OUTPUT JSON SCHEMA (no markdown, no explanation text):
     [
       {
         "mealType": "Bữa sáng",
         "dishes": [
           {
             "dishId": "68de1eca0ac8cfd1a7f68780",
             "servings": 1
           }
         ]
       }
     ]`;
};

export default mealRecommendationPrompt;
