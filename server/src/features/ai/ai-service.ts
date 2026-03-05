import createHttpError from 'http-errors';

import { agent, agentConfig } from '~/shared/config/ai-agent';
import { DAY_OF_WEEK } from '~/shared/constants/day-of-week';
import { DISH_CATEGORY } from '~/shared/constants/dish-category';
import { MEAL_SIZE } from '~/shared/constants/meal-size';
import { MEAL_TYPE } from '~/shared/constants/meal-type';
import { NUTRITION_FOCUS } from '~/shared/constants/nutrition-focus';
import { USER_TARGET } from '~/shared/constants/user-target';
import { DishModel, UserModel } from '~/shared/database/models';

import type {
  AskAgentRequest,
  AskAgentResponse,
  DailyMealRecommendationResponse,
  RecommendDailyMealsRequest
} from './ai-dto';
import { aiMealRecommendationSchema } from './ai-dto';
import type { IDishCatalogPromptInput, IInputGenerateMeal } from './ai-type';
import mealRecommendationPrompt, {
  MEAL_RECOMMENDATION_PROMPT_CONFIG
} from './meal-recommendation-prompt';

type NutritionItem = {
  label?: string | null;
  value?: number | null;
  unit?: string | null;
};

type DishNutrition = {
  nutrients?: NutritionItem[] | null;
  minerals?: NutritionItem[] | null;
  vitamins?: NutritionItem[] | null;
} | null;

type DishCandidate = {
  _id: string;
  name: string;
  image?: string;
  servings?: number;
  nutrition?: DishNutrition;
  categories: string[];
  nutritionFocus: string[];
  tags: string[];
  preparationTime?: number;
  cookTime?: number;
  ingredients: Array<{
    ingredientId?: string;
    allergens: string[];
  }>;
};

type MealSlot = {
  mealType: string;
  mealSettingName: string;
  dishCount: number;
  preferredTypes: string[];
  mealSize?: string;
  cookingPreference?: string;
  availableTime?: string;
  complexity?: string;
  dishCategories: string[];
};

type UserProfileForRecommendation = {
  _id: string;
  gender?: string;
  dob?: Date;
  height?: number;
  bodyfat?: string;
  diet?: string;
  nutritionTarget?: {
    caloriesTarget?: number;
    macros?: {
      carbs?: { min?: number; max?: number };
      protein?: { min?: number; max?: number };
      fat?: { min?: number; max?: number };
    };
  } | null;
  mealSettings: Array<{
    name?: string;
    mealSize?: string;
    preferredTypes?: string[];
    cookingPreference?: string;
    availableTime?: string;
    complexity?: string;
    dishCategories?: string[];
  }>;
  favoriteDishes: string[];
  blockDishes: string[];
  blockIngredients: string[];
  weightRecord: Array<{ weight?: number; date?: Date }>;
  goal?: {
    target?: string;
    weightGoal?: number;
    targetWeightChange?: number;
  } | null;
  allergens: string[];
  activityLevel?: string;
  medicalHistory: string[];
};

const DEFAULT_MEAL_TYPE_ORDER = [
  MEAL_TYPE.BREAKFAST,
  MEAL_TYPE.LUNCH,
  MEAL_TYPE.DINNER,
  MEAL_TYPE.SNACK
];

const AVAILABLE_TIME_LIMITS: Record<string, number> = {
  'Không có thời gian (<5 phút)': 5,
  'Ít thời gian (<15 phút)': 15,
  'Có thời gian (<30 phút)': 30,
  'Nhiều thời gian (<60 phút)': 60,
  'Rất nhiều thời gian (<90 phút)': 90
};

const DISH_COUNT_BY_MEAL_SIZE: Record<string, number> = {
  [MEAL_SIZE.TINY]: 1,
  [MEAL_SIZE.SMALL]: 1,
  [MEAL_SIZE.NORMAL]: 2,
  [MEAL_SIZE.BIG]: 2,
  [MEAL_SIZE.HUGE]: 3
};

const MEAL_TYPE_CATEGORY_HINTS: Record<string, string[]> = {
  [MEAL_TYPE.BREAKFAST]: [DISH_CATEGORY.BREAKFAST, DISH_CATEGORY.SNACK],
  [MEAL_TYPE.LUNCH]: [
    DISH_CATEGORY.MAIN_COURSE,
    DISH_CATEGORY.SIDE_DISH,
    DISH_CATEGORY.SOUP,
    DISH_CATEGORY.SALAD
  ],
  [MEAL_TYPE.DINNER]: [
    DISH_CATEGORY.MAIN_COURSE,
    DISH_CATEGORY.SIDE_DISH,
    DISH_CATEGORY.SOUP,
    DISH_CATEGORY.SALAD
  ],
  [MEAL_TYPE.SNACK]: [DISH_CATEGORY.SNACK, DISH_CATEGORY.BEVERAGE],
  [MEAL_TYPE.DESSERT]: [DISH_CATEGORY.DESSERT]
};

const dayOfWeekByIndex: Record<number, string> = {
  0: DAY_OF_WEEK.SUNDAY,
  1: DAY_OF_WEEK.MONDAY,
  2: DAY_OF_WEEK.TUESDAY,
  3: DAY_OF_WEEK.WEDNESDAY,
  4: DAY_OF_WEEK.THURSDAY,
  5: DAY_OF_WEEK.FRIDAY,
  6: DAY_OF_WEEK.SATURDAY
};

export const AiService = {
  askAgent: async (payload: AskAgentRequest): Promise<AskAgentResponse> => {
    const { message } = payload;

    const result = await agent.invoke({
      messages: [{ role: 'user', content: message }]
    });

    const lastMessage = result.messages?.[result.messages.length - 1];
    const response = normalizeContent(lastMessage?.content);

    return {
      provider: agentConfig.provider,
      model: agentConfig.model,
      response
    };
  },

  recommendDailyMeals: async (
    userId: string,
    payload: RecommendDailyMealsRequest
  ): Promise<DailyMealRecommendationResponse> => {
    const user = await getUserProfileForRecommendation(userId);

    const targetDate = payload.date;
    const dayOfWeek = getDayOfWeek(targetDate);
    const mealSlots = buildMealSlots(user.mealSettings);
    const candidateDishes = await getCandidateDishes(user);

    if (!candidateDishes.length) {
      throw createHttpError(
        404,
        'Không có món ăn phù hợp với hồ sơ người dùng hiện tại'
      );
    }

    const dishesById = new Map(candidateDishes.map(dish => [dish._id, dish]));
    const candidatesByMealType = new Map<string, DishCandidate[]>();
    mealSlots.forEach(slot => {
      candidatesByMealType.set(
        slot.mealType,
        pickCandidatesForMeal(slot, candidateDishes, user)
      );
    });

    const dishCatalog = buildPromptCatalog(
      mealSlots,
      candidatesByMealType,
      dishesById
    );

    const inputForPrompt = buildPromptInput(user);
    const retrievalSummary = buildRetrievalSummary(
      candidateDishes.length,
      mealSlots,
      candidatesByMealType
    );
    const prompt = mealRecommendationPrompt(inputForPrompt, {
      dateISO: targetDate.toISOString(),
      dayOfWeek,
      mealSlots,
      dishCatalog,
      retrievalSummary
    });

    const aiText = await invokeAi(prompt);
    const aiSelection = parseAiSelection(aiText);

    const meals = materializeMeals({
      mealSlots,
      aiSelection,
      dishesById,
      candidatesByMealType
    });

    return {
      date: targetDate.toISOString(),
      dayOfWeek,
      meals
    };
  }
};

const getUserProfileForRecommendation = async (
  userId: string
): Promise<UserProfileForRecommendation> => {
  const user = await UserModel.findById(userId).lean();

  if (!user) {
    throw createHttpError(404, 'Không tìm thấy người dùng');
  }

  if (!user.isActive) {
    throw createHttpError(403, 'Tài khoản người dùng đang bị vô hiệu hóa');
  }

  return {
    _id: user._id.toString(),
    gender: user.gender ?? undefined,
    dob: user.dob ?? undefined,
    height: user.height ?? undefined,
    bodyfat: user.bodyfat ?? undefined,
    diet: user.diet ?? undefined,
    nutritionTarget: toNutritionTarget(user.nutritionTarget),
    mealSettings: (user.mealSettings ?? []).map(setting => ({
      name: setting.name,
      mealSize: setting.mealSize,
      preferredTypes: [...(setting.preferredTypes ?? [])],
      cookingPreference: setting.cookingPreference,
      availableTime: setting.availableTime,
      complexity: setting.complexity,
      dishCategories: [...(setting.dishCategories ?? [])]
    })),
    favoriteDishes: (user.favoriteDishes ?? []).map(id => id.toString()),
    blockDishes: (user.blockDishes ?? []).map(id => id.toString()),
    blockIngredients: (user.blockIngredients ?? []).map(id => id.toString()),
    weightRecord: (user.weightRecord ?? []).map(item => ({
      weight: item.weight ?? undefined,
      date: item.date ?? undefined
    })),
    goal: toGoal(user.goal),
    allergens: [...(user.allergens ?? [])],
    activityLevel: user.activityLevel ?? undefined,
    medicalHistory: [...(user.medicalHistory ?? [])]
  };
};

const toMacroRange = (
  range:
    | {
        min?: number | null;
        max?: number | null;
      }
    | null
    | undefined
) => {
  if (!range) return undefined;

  return {
    min: range.min ?? undefined,
    max: range.max ?? undefined
  };
};

const toNutritionTarget = (
  nutritionTarget:
    | {
        caloriesTarget?: number | null;
        macros?: {
          carbs?: { min?: number | null; max?: number | null } | null;
          protein?: { min?: number | null; max?: number | null } | null;
          fat?: { min?: number | null; max?: number | null } | null;
        } | null;
      }
    | null
    | undefined
) => {
  if (!nutritionTarget) return null;

  return {
    caloriesTarget: nutritionTarget.caloriesTarget ?? undefined,
    macros: nutritionTarget.macros
      ? {
          carbs: toMacroRange(nutritionTarget.macros.carbs),
          protein: toMacroRange(nutritionTarget.macros.protein),
          fat: toMacroRange(nutritionTarget.macros.fat)
        }
      : undefined
  };
};

const toGoal = (
  goal:
    | {
        target?: string | null;
        weightGoal?: number | null;
        targetWeightChange?: number | null;
      }
    | null
    | undefined
) => {
  if (!goal) return null;

  return {
    target: goal.target ?? undefined,
    weightGoal: goal.weightGoal ?? undefined,
    targetWeightChange: goal.targetWeightChange ?? undefined
  };
};

const getCandidateDishes = async (
  user: UserProfileForRecommendation
): Promise<DishCandidate[]> => {
  const blockedDishSet = new Set(user.blockDishes);
  const blockedIngredientSet = new Set(user.blockIngredients);
  const allergenSet = new Set(user.allergens);

  const dishes = await DishModel.find({
    isActive: true,
    $or: [{ isPublic: true }, { 'user._id': user._id }]
  })
    .select(
      'name image servings nutrition categories nutritionFocus tags preparationTime cookTime ingredients'
    )
    .lean();

  return dishes
    .map(dish => ({
      _id: dish._id.toString(),
      name: dish.name,
      image: dish.image ?? undefined,
      servings: dish.servings ?? 1,
      nutrition: dish.nutrition ?? null,
      categories: [...(dish.categories ?? [])],
      nutritionFocus: [...(dish.nutritionFocus ?? [])],
      tags: [...(dish.tags ?? [])],
      preparationTime: dish.preparationTime ?? undefined,
      cookTime: dish.cookTime ?? undefined,
      ingredients: (dish.ingredients ?? []).map(ingredient => ({
        ingredientId: ingredient.ingredientId?.toString(),
        allergens: [...(ingredient.allergens ?? [])]
      }))
    }))
    .filter(dish => !blockedDishSet.has(dish._id))
    .filter(
      dish =>
        !dish.ingredients.some(ingredient =>
          ingredient.ingredientId
            ? blockedIngredientSet.has(ingredient.ingredientId)
            : false
        )
    )
    .filter(
      dish =>
        !dish.ingredients.some(ingredient =>
          ingredient.allergens.some(allergen => allergenSet.has(allergen))
        )
    );
};

const getDayOfWeek = (date: Date): string =>
  dayOfWeekByIndex[date.getUTCDay()] ?? DAY_OF_WEEK.MONDAY;

const buildMealSlots = (
  mealSettings: UserProfileForRecommendation['mealSettings']
): MealSlot[] => {
  if (!mealSettings.length) {
    return DEFAULT_MEAL_TYPE_ORDER.map(mealType => ({
      mealType,
      mealSettingName: mealType,
      dishCount: 2,
      preferredTypes: [mealType],
      dishCategories: []
    }));
  }

  return mealSettings.map((setting, index) => {
    const preferredTypes = (setting.preferredTypes ?? []).filter(
      type => type !== MEAL_TYPE.ALL
    );
    const mealType = resolveMealType(setting.name, preferredTypes, index);
    const dishCount = toDishCount(setting.mealSize);

    return {
      mealType,
      mealSettingName: setting.name ?? mealType,
      dishCount,
      preferredTypes,
      mealSize: setting.mealSize,
      cookingPreference: setting.cookingPreference,
      availableTime: setting.availableTime,
      complexity: setting.complexity,
      dishCategories: setting.dishCategories ?? []
    };
  });
};

const resolveMealType = (
  name: string | undefined,
  preferredTypes: string[],
  index: number
) => {
  if (preferredTypes.length > 0) {
    return preferredTypes[0];
  }

  const mealTypeValues = Object.values(MEAL_TYPE);
  if (
    name &&
    mealTypeValues.includes(name as (typeof MEAL_TYPE)[keyof typeof MEAL_TYPE])
  ) {
    return name;
  }

  return DEFAULT_MEAL_TYPE_ORDER[index % DEFAULT_MEAL_TYPE_ORDER.length];
};

const toDishCount = (mealSize?: string) => {
  if (!mealSize) return 2;

  return DISH_COUNT_BY_MEAL_SIZE[mealSize] ?? 2;
};

const getDishTotalTime = (dish: DishCandidate) =>
  (dish.preparationTime ?? 0) + (dish.cookTime ?? 0);

const filterByMealTypeHint = (mealType: string, dishes: DishCandidate[]) => {
  const hints = MEAL_TYPE_CATEGORY_HINTS[mealType] ?? [];
  if (!hints.length) return dishes;

  const matched = dishes.filter(dish =>
    dish.categories.some(category => hints.includes(category))
  );

  return matched.length > 0 ? matched : dishes;
};

const pickCandidatesForMeal = (
  slot: MealSlot,
  candidateDishes: DishCandidate[],
  user: UserProfileForRecommendation
) => {
  let scoped = candidateDishes;

  if (slot.dishCategories.length > 0) {
    const byCategories = scoped.filter(dish =>
      dish.categories.some(category => slot.dishCategories.includes(category))
    );
    if (byCategories.length > 0) {
      scoped = byCategories;
    }
  }

  if (
    slot.availableTime &&
    AVAILABLE_TIME_LIMITS[slot.availableTime] !== undefined
  ) {
    const maxMinutes = AVAILABLE_TIME_LIMITS[slot.availableTime];
    const byTime = scoped.filter(dish => getDishTotalTime(dish) <= maxMinutes);
    if (byTime.length > 0) {
      scoped = byTime;
    }
  }

  scoped = filterByMealTypeHint(slot.mealType, scoped);

  const favoriteSet = new Set(user.favoriteDishes);

  return [...scoped].sort(
    (left, right) =>
      scoreDishForMeal(right, slot, user, favoriteSet) -
      scoreDishForMeal(left, slot, user, favoriteSet)
  );
};

const scoreDishForMeal = (
  dish: DishCandidate,
  slot: MealSlot,
  user: UserProfileForRecommendation,
  favoriteSet: Set<string>
) => {
  let score = 0;

  if (favoriteSet.has(dish._id)) {
    score += 20;
  }

  if (
    slot.dishCategories.some(category => dish.categories.includes(category))
  ) {
    score += 8;
  }

  if (dish.nutritionFocus.includes(NUTRITION_FOCUS.HIGH_PROTEIN)) {
    score += user.goal?.target === USER_TARGET.BUILD_MUSCLE ? 8 : 2;
  }

  if (
    dish.nutritionFocus.includes(NUTRITION_FOCUS.LOW_FAT) ||
    dish.nutritionFocus.includes(NUTRITION_FOCUS.LOW_CARB)
  ) {
    score += user.goal?.target === USER_TARGET.LOSE_FAT ? 8 : 2;
  }

  if (
    slot.availableTime &&
    AVAILABLE_TIME_LIMITS[slot.availableTime] !== undefined
  ) {
    const timeLimit = AVAILABLE_TIME_LIMITS[slot.availableTime];
    if (getDishTotalTime(dish) <= timeLimit) {
      score += 4;
    }
  }

  if (slot.mealType === MEAL_TYPE.BREAKFAST) {
    if (dish.categories.includes(DISH_CATEGORY.BREAKFAST)) {
      score += 6;
    }
  }

  return score;
};

const buildPromptCatalog = (
  mealSlots: MealSlot[],
  candidatesByMealType: Map<string, DishCandidate[]>,
  dishesById: Map<string, DishCandidate>
): IDishCatalogPromptInput[] => {
  const catalogByDishId = new Map<string, IDishCatalogPromptInput>();
  const mealTypesByDishId = new Map<string, Set<string>>();

  mealSlots.forEach(slot => {
    const candidates = candidatesByMealType.get(slot.mealType) ?? [];
    candidates.slice(0, 30).forEach(dish => {
      if (!mealTypesByDishId.has(dish._id)) {
        mealTypesByDishId.set(dish._id, new Set());
      }
      mealTypesByDishId.get(dish._id)?.add(slot.mealType);
    });
  });

  for (const [dishId, mealTypes] of mealTypesByDishId.entries()) {
    const dish = dishesById.get(dishId);
    if (!dish) continue;

    catalogByDishId.set(dishId, {
      id: dishId,
      name: dish.name,
      categories: dish.categories,
      nutritionFocus: dish.nutritionFocus,
      tags: dish.tags,
      totalTimeMinutes: getDishTotalTime(dish),
      defaultServings: dish.servings ?? 1,
      blockedByAllergen: false,
      nutrients: (dish.nutrition?.nutrients ?? [])
        .filter(
          item =>
            typeof item.label === 'string' &&
            typeof item.unit === 'string' &&
            typeof item.value === 'number'
        )
        .map(item => ({
          label: item.label as string,
          unit: item.unit as string,
          value: item.value as number
        })),
      suggestedMealTypes: Array.from(mealTypes)
    });

    if (
      catalogByDishId.size >= MEAL_RECOMMENDATION_PROMPT_CONFIG.maxCatalogItems
    ) {
      break;
    }
  }

  return Array.from(catalogByDishId.values());
};

const getAge = (dob?: Date) => {
  if (!dob) return undefined;

  const now = new Date();
  let age = now.getUTCFullYear() - dob.getUTCFullYear();
  const monthDiff = now.getUTCMonth() - dob.getUTCMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && now.getUTCDate() < dob.getUTCDate())
  ) {
    age -= 1;
  }

  return age >= 0 ? age : undefined;
};

const getLatestWeight = (
  weightRecord: Array<{ weight?: number; date?: Date }>
): number | undefined => {
  if (!weightRecord.length) return undefined;

  const sorted = [...weightRecord]
    .filter(
      item => typeof item.weight === 'number' && item.date instanceof Date
    )
    .sort((left, right) => right.date!.getTime() - left.date!.getTime());

  return sorted[0]?.weight;
};

const buildPromptInput = (
  user: UserProfileForRecommendation
): IInputGenerateMeal => ({
  gender: user.gender,
  age: getAge(user.dob),
  height: user.height,
  weight: getLatestWeight(user.weightRecord),
  targetWeight: user.goal?.weightGoal,
  fitnessGoal: user.goal?.target,
  diet: user.diet,
  activityLevel: user.activityLevel,
  bodyfat: user.bodyfat,
  allergens: user.allergens,
  medicalHistory: user.medicalHistory,
  caloriesTarget: user.nutritionTarget?.caloriesTarget,
  macroTargets: user.nutritionTarget?.macros
});

const buildRetrievalSummary = (
  totalCandidates: number,
  mealSlots: MealSlot[],
  candidatesByMealType: Map<string, DishCandidate[]>
) => {
  const detail = mealSlots
    .map(slot => {
      const count = candidatesByMealType.get(slot.mealType)?.length ?? 0;
      return `- ${slot.mealType}: ${count} candidate dishes`;
    })
    .join('\n');

  return [
    'Current retrieval mode: direct MongoDB filtering (RAG not enabled yet).',
    `Total candidates after hard filters: ${totalCandidates}.`,
    'Per-meal candidates:',
    detail
  ].join('\n');
};

const invokeAi = async (prompt: string) => {
  const result = await agent.invoke({
    messages: [{ role: 'user', content: prompt }]
  });
  const lastMessage = result.messages?.[result.messages.length - 1];
  return normalizeContent(lastMessage?.content);
};

const parseAiSelection = (aiText: string) => {
  const parsedJson = extractJson(aiText);
  if (!parsedJson) {
    return null;
  }

  const parsed = aiMealRecommendationSchema.safeParse(parsedJson);
  if (!parsed.success) {
    return null;
  }

  return parsed.data;
};

const extractJson = (value: string): unknown => {
  const cleaned = value
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```/i, '')
    .replace(/```$/i, '')
    .trim();

  const direct = tryParseJson(cleaned);
  if (direct !== null) return direct;

  const startIndex = cleaned.indexOf('[');
  const endIndex = cleaned.lastIndexOf(']');
  if (startIndex < 0 || endIndex < 0 || endIndex <= startIndex) {
    return null;
  }

  const extracted = cleaned.slice(startIndex, endIndex + 1);
  return tryParseJson(extracted);
};

const tryParseJson = (value: string): unknown => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const materializeMeals = ({
  mealSlots,
  aiSelection,
  dishesById,
  candidatesByMealType
}: {
  mealSlots: MealSlot[];
  aiSelection: Array<{
    mealType: string;
    dishes: Array<{ dishId: string; servings?: number }>;
  }> | null;
  dishesById: Map<string, DishCandidate>;
  candidatesByMealType: Map<string, DishCandidate[]>;
}) => {
  const usedDishIds = new Set<string>();

  return mealSlots.map((slot, index) => {
    const aiMeal = pickAiMeal(aiSelection, slot.mealType, index);
    const dishCount = Math.min(
      slot.dishCount,
      MEAL_RECOMMENDATION_PROMPT_CONFIG.maxDishesPerMeal
    );
    const selectedDishRows: Array<{
      dishId: string;
      name: string;
      servings: number;
      image?: string;
      nutrition: DishNutrition;
    }> = [];

    if (aiMeal) {
      const seenInMeal = new Set<string>();
      for (const item of aiMeal.dishes) {
        if (selectedDishRows.length >= dishCount) break;
        if (seenInMeal.has(item.dishId)) continue;

        const dish = dishesById.get(item.dishId);
        if (!dish) continue;

        const servings = normalizeServings(item.servings, dish.servings);
        seenInMeal.add(item.dishId);
        usedDishIds.add(item.dishId);
        selectedDishRows.push(toDishResponse(dish, servings));
      }
    }

    if (selectedDishRows.length < dishCount) {
      const fallbackCandidates = candidatesByMealType.get(slot.mealType) ?? [];

      for (const dish of fallbackCandidates) {
        if (selectedDishRows.length >= dishCount) break;
        if (selectedDishRows.some(item => item.dishId === dish._id)) continue;
        if (
          usedDishIds.has(dish._id) &&
          fallbackCandidates.length > dishCount
        ) {
          continue;
        }
        usedDishIds.add(dish._id);
        selectedDishRows.push(
          toDishResponse(dish, normalizeServings(1, dish.servings))
        );
      }
    }

    return {
      mealType: slot.mealType,
      dishes: selectedDishRows
    };
  });
};

const pickAiMeal = (
  aiSelection: Array<{
    mealType: string;
    dishes: Array<{ dishId: string; servings?: number }>;
  }> | null,
  mealType: string,
  index: number
) => {
  if (!aiSelection?.length) return null;

  const byIndex = aiSelection[index];
  if (byIndex && byIndex.mealType === mealType) {
    return byIndex;
  }

  return aiSelection.find(meal => meal.mealType === mealType) ?? null;
};

const normalizeServings = (
  requestedServings: number | undefined,
  defaultServings: number | undefined
) => {
  const fallback = defaultServings && defaultServings > 0 ? defaultServings : 1;
  const raw = requestedServings ?? fallback;
  const normalized = Number.isFinite(raw) ? Math.round(raw) : 1;

  return Math.max(
    MEAL_RECOMMENDATION_PROMPT_CONFIG.minServings,
    Math.min(MEAL_RECOMMENDATION_PROMPT_CONFIG.maxServings, normalized)
  );
};

const normalizeNutrition = (nutrition?: DishNutrition): DishNutrition => ({
  nutrients: nutrition?.nutrients ?? [],
  minerals: nutrition?.minerals ?? [],
  vitamins: nutrition?.vitamins ?? []
});

const toDishResponse = (dish: DishCandidate, servings: number) => ({
  dishId: dish._id,
  name: dish.name,
  servings,
  image: dish.image,
  nutrition: normalizeNutrition(dish.nutrition)
});

const normalizeContent = (content: unknown): string => {
  if (typeof content === 'string') {
    return content;
  }

  if (Array.isArray(content)) {
    const textParts = content
      .map(part => {
        if (typeof part === 'string') {
          return part;
        }
        if (part && typeof part === 'object' && 'text' in part) {
          return String((part as { text?: unknown }).text ?? '');
        }
        return '';
      })
      .filter(Boolean);
    if (textParts.length > 0) {
      return textParts.join(' ');
    }
  }

  if (content == null) {
    return '';
  }

  return String(content);
};
