import {
  ValidationContext,
  ValidationReport,
  ValidationResult,
  ValidationRule
} from './types';

const extractJsonObject = (text: string): Record<string, unknown> | null => {
  const cleaned = text
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```/i, '')
    .replace(/```$/i, '')
    .trim();
  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) return { meals: parsed };
    if (typeof parsed === 'object' && parsed !== null)
      return parsed as Record<string, unknown>;
  } catch {
    /* empty */
  }

  const firstBracket = cleaned.indexOf('[');
  const lastBracket = cleaned.lastIndexOf(']');
  if (firstBracket >= 0 && lastBracket > firstBracket) {
    try {
      const parsed = JSON.parse(cleaned.slice(firstBracket, lastBracket + 1));
      if (Array.isArray(parsed)) return { meals: parsed };
    } catch {
      /* empty */
    }
  }

  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    try {
      const parsed = JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
      if (typeof parsed === 'object' && parsed !== null)
        return parsed as Record<string, unknown>;
    } catch {
      /* empty */
    }
  }

  return null;
};

const RULE_WEIGHTS = {
  jsonSchemaValid: 1,
  allDishIdsExist: 1,
  noAllergenDishes: 1,
  servingsInRange: 1,
  noDuplicateDishes: 1,
  mealTypeMatch: 1,
  mealCountMatch: 1,
  macroTargetMet: 0.35,
  nutritionVariety: 0.25,
  cookingTimeFeasibility: 0.15,
  constraintSatisfaction: 0.25
} as const;

const jsonSchemaValid = (output: string): ValidationResult => {
  const parsed = extractJsonObject(output);
  if (!parsed) {
    return {
      weight: RULE_WEIGHTS.jsonSchemaValid,
      score: 0,
      message: 'Invalid JSON output'
    };
  }
  const meals = (parsed as Record<string, unknown>).meals;
  if (!Array.isArray(meals)) {
    return {
      weight: RULE_WEIGHTS.jsonSchemaValid,
      score: 0,
      message: 'Missing meals array'
    };
  }
  for (const meal of meals) {
    if (typeof meal !== 'object' || meal === null) {
      return {
        weight: RULE_WEIGHTS.jsonSchemaValid,
        score: 0,
        message: 'Invalid meal structure'
      };
    }
    const mealObj = meal as Record<string, unknown>;
    if (typeof mealObj.mealType !== 'string') {
      return {
        weight: RULE_WEIGHTS.jsonSchemaValid,
        score: 0,
        message: 'Missing mealType'
      };
    }
    if (!Array.isArray(mealObj.dishes)) {
      return {
        weight: RULE_WEIGHTS.jsonSchemaValid,
        score: 0,
        message: 'Missing dishes array'
      };
    }
  }
  return {
    weight: RULE_WEIGHTS.jsonSchemaValid,
    score: 100,
    message: 'JSON schema valid'
  };
};

const allDishIdsExist = (
  output: Record<string, unknown>,
  context: ValidationContext
): ValidationResult => {
  const meals = (output.meals ?? []) as Array<Record<string, unknown>>;
  const catalogIds = new Set(context.dishCatalog.map(d => String(d.dishId)));
  const allDishes = meals.flatMap(
    m => (m.dishes ?? []) as Array<Record<string, unknown>>
  );
  const missing = allDishes
    .map(d => String((d as Record<string, unknown>).dishId))
    .filter(id => !catalogIds.has(id));
  if (missing.length > 0) {
    return {
      weight: RULE_WEIGHTS.allDishIdsExist,
      score: 0,
      message: `Missing dish IDs: ${[...new Set(missing)].join(', ')}`,
      details: { missingIds: [...new Set(missing)] }
    };
  }
  return {
    weight: RULE_WEIGHTS.allDishIdsExist,
    score: 100,
    message: 'All dish IDs exist'
  };
};

const noAllergenDishes = (
  output: Record<string, unknown>,
  context: ValidationContext
): ValidationResult => {
  const meals = (output.meals ?? []) as Array<Record<string, unknown>>;
  const userAllergies = new Set(
    context.userProfile.allergies.map(a => a.toLowerCase())
  );
  if (userAllergies.size === 0) {
    return {
      weight: RULE_WEIGHTS.noAllergenDishes,
      score: 100,
      message: 'No allergies to check'
    };
  }
  const allDishes = meals.flatMap(
    m => (m.dishes ?? []) as Array<Record<string, unknown>>
  );
  const dishIds = allDishes.map(d =>
    String((d as Record<string, unknown>).dishId)
  );
  const dishMap = new Map(context.dishCatalog.map(d => [String(d.dishId), d]));
  const violations: string[] = [];
  for (const dishId of dishIds) {
    const dish = dishMap.get(dishId);
    if (!dish) continue;
    const dishAllergens = new Set(
      (dish.allergens ?? []).map((a: string) => a.toLowerCase())
    );
    const found = [...userAllergies].filter(a => dishAllergens.has(a));
    if (found.length > 0) {
      violations.push(`${dishId}: ${found.join(', ')}`);
    }
  }
  if (violations.length > 0) {
    return {
      weight: RULE_WEIGHTS.noAllergenDishes,
      score: 0,
      message: `Allergen violations: ${violations.join('; ')}`,
      details: { violations }
    };
  }
  return {
    weight: RULE_WEIGHTS.noAllergenDishes,
    score: 100,
    message: 'No allergen dishes'
  };
};

const servingsInRange = (output: Record<string, unknown>): ValidationResult => {
  const meals = (output.meals ?? []) as Array<Record<string, unknown>>;
  const invalid: Array<{ dishId: string; servings: unknown }> = [];
  for (const meal of meals) {
    const dishes = (meal.dishes ?? []) as Array<Record<string, unknown>>;
    for (const dish of dishes) {
      const servings = (dish as Record<string, unknown>).servings;
      if (typeof servings !== 'number' || servings < 1 || servings > 5) {
        invalid.push({
          dishId: String((dish as Record<string, unknown>).dishId),
          servings
        });
      }
    }
  }
  if (invalid.length > 0) {
    return {
      weight: RULE_WEIGHTS.servingsInRange,
      score: 0,
      message: `Servings out of range (1-5): ${invalid.map(i => `${i.dishId}=${i.servings}`).join(', ')}`,
      details: { invalid }
    };
  }
  return {
    weight: RULE_WEIGHTS.servingsInRange,
    score: 100,
    message: 'All servings in range'
  };
};

const noDuplicateDishes = (
  output: Record<string, unknown>
): ValidationResult => {
  const meals = (output.meals ?? []) as Array<Record<string, unknown>>;
  const allDishes = meals.flatMap(
    m => (m.dishes ?? []) as Array<Record<string, unknown>>
  );
  const dishIds = allDishes.map(d =>
    String((d as Record<string, unknown>).dishId)
  );
  const seen = new Set<string>();
  const duplicates: string[] = [];
  for (const id of dishIds) {
    if (seen.has(id)) {
      duplicates.push(id);
    }
    seen.add(id);
  }
  if (duplicates.length > 0) {
    return {
      weight: RULE_WEIGHTS.noDuplicateDishes,
      score: 0,
      message: `Duplicate dishes: ${[...new Set(duplicates)].join(', ')}`,
      details: { duplicates: [...new Set(duplicates)] }
    };
  }
  return {
    weight: RULE_WEIGHTS.noDuplicateDishes,
    score: 100,
    message: 'No duplicate dishes'
  };
};

const mealTypeMatch = (
  output: Record<string, unknown>,
  context: ValidationContext
): ValidationResult => {
  const meals = (output.meals ?? []) as Array<Record<string, unknown>>;
  const slotMap = new Map(
    context.mealSlots.map(s => [s.mealType.toLowerCase(), s.mealType])
  );
  const mismatches: string[] = [];
  for (const meal of meals) {
    const mealType = String(
      (meal as Record<string, unknown>).mealType
    ).toLowerCase();
    if (!slotMap.has(mealType)) {
      mismatches.push(`${mealType} not in slots`);
    }
  }
  if (mismatches.length > 0) {
    return {
      weight: RULE_WEIGHTS.mealTypeMatch,
      score: 0,
      message: `Meal type mismatches: ${mismatches.join('; ')}`,
      details: { mismatches }
    };
  }
  return {
    weight: RULE_WEIGHTS.mealTypeMatch,
    score: 100,
    message: 'Meal types match slots'
  };
};

const mealCountMatch = (
  output: Record<string, unknown>,
  context: ValidationContext
): ValidationResult => {
  const meals = (output.meals ?? []) as Array<Record<string, unknown>>;
  const slotCount = context.mealSlots.length;
  if (meals.length !== slotCount) {
    return {
      weight: RULE_WEIGHTS.mealCountMatch,
      score: Math.max(0, 100 - Math.abs(meals.length - slotCount) * 20),
      message: `Expected ${slotCount} meals, got ${meals.length}`
    };
  }
  return {
    weight: RULE_WEIGHTS.mealCountMatch,
    score: 100,
    message: 'Meal count matches'
  };
};

const macroTargetMet = (
  output: Record<string, unknown>,
  context: ValidationContext
): ValidationResult => {
  const meals = (output.meals ?? []) as Array<Record<string, unknown>>;
  const target = context.userProfile.calorieTarget;
  const tolerance = 0.15;
  let totalCalories = 0;
  const dishMap = new Map(context.dishCatalog.map(d => [String(d.dishId), d]));
  for (const meal of meals) {
    const dishes = (meal.dishes ?? []) as Array<Record<string, unknown>>;
    for (const dish of dishes) {
      const dishId = String((dish as Record<string, unknown>).dishId);
      const servings = Number((dish as Record<string, unknown>).servings) || 1;
      const cat = dishMap.get(dishId);
      if (cat) {
        totalCalories += (cat.calories ?? 0) * servings;
      }
    }
  }
  const min = target * (1 - tolerance);
  const max = target * (1 + tolerance);
  const inRange = totalCalories >= min && totalCalories <= max;
  const score = inRange
    ? 100
    : Math.max(0, 100 - (Math.abs(totalCalories - target) / target) * 100);
  return {
    weight: RULE_WEIGHTS.macroTargetMet,
    score: Math.round(score),
    message: `Total ${Math.round(totalCalories)} cal (target ${target}, range ${Math.round(min)}-${Math.round(max)})`,
    details: { totalCalories, target, inRange }
  };
};

const nutritionVariety = (
  output: Record<string, unknown>
): ValidationResult => {
  const meals = (output.meals ?? []) as Array<Record<string, unknown>>;
  const dishes = meals.flatMap(
    m => (m.dishes ?? []) as Array<Record<string, unknown>>
  );
  const dishCount = dishes.length;
  const score = Math.min(100, dishCount * 20);
  return {
    weight: RULE_WEIGHTS.nutritionVariety,
    score,
    message: `${dishCount} dishes, variety score ${score}`,
    details: { dishCount }
  };
};

const cookingTimeFeasibility = (
  output: Record<string, unknown>
): ValidationResult => {
  const meals = (output.meals ?? []) as Array<Record<string, unknown>>;
  const maxPerMeal = 3;
  const feasible = meals.every(
    m => ((m.dishes ?? []) as Array<unknown>).length <= maxPerMeal
  );
  return {
    weight: RULE_WEIGHTS.cookingTimeFeasibility,
    score: feasible ? 100 : 60,
    message: feasible ? 'Cooking time feasible' : 'Too many dishes per meal',
    details: {
      dishesPerMeal: meals.map(m => ((m.dishes ?? []) as Array<unknown>).length)
    }
  };
};

const constraintSatisfaction = (
  output: Record<string, unknown>,
  context: ValidationContext
): ValidationResult => {
  const meals = (output.meals ?? []) as Array<Record<string, unknown>>;
  const totalDishes = meals.reduce(
    (sum, m) => sum + ((m.dishes ?? []) as Array<unknown>).length,
    0
  );
  const score = totalDishes >= 3 ? 100 : totalDishes * 30;
  return {
    weight: RULE_WEIGHTS.constraintSatisfaction,
    score,
    message: `Constraint satisfaction score: ${score}`,
    details: { totalDishes }
  };
};

export const mealValidationRules: ValidationRule[] = [
  {
    id: 'json_schema_valid',
    name: 'JSON Schema Valid',
    weight: RULE_WEIGHTS.jsonSchemaValid,
    check: async output => jsonSchemaValid(JSON.stringify(output))
  },
  {
    id: 'all_dish_ids_exist',
    name: 'All Dish IDs Exist',
    weight: RULE_WEIGHTS.allDishIdsExist,
    check: async (output, ctx) => allDishIdsExist(output, ctx)
  },
  {
    id: 'no_allergen_dishes',
    name: 'No Allergen Dishes',
    weight: RULE_WEIGHTS.noAllergenDishes,
    check: async (output, ctx) => noAllergenDishes(output, ctx)
  },
  {
    id: 'servings_in_range',
    name: 'Servings In Range (1-5)',
    weight: RULE_WEIGHTS.servingsInRange,
    check: async output => servingsInRange(output)
  },
  {
    id: 'no_duplicate_dishes',
    name: 'No Duplicate Dishes',
    weight: RULE_WEIGHTS.noDuplicateDishes,
    check: async output => noDuplicateDishes(output)
  },
  {
    id: 'meal_type_match',
    name: 'Meal Type Matches Slot',
    weight: RULE_WEIGHTS.mealTypeMatch,
    check: async (output, ctx) => mealTypeMatch(output, ctx)
  },
  {
    id: 'meal_count_match',
    name: 'Meal Count Matches Slots',
    weight: RULE_WEIGHTS.mealCountMatch,
    check: async (output, ctx) => mealCountMatch(output, ctx)
  },
  {
    id: 'macro_target_met',
    name: 'Macro Target Met (±15%)',
    weight: RULE_WEIGHTS.macroTargetMet,
    check: async (output, ctx) => macroTargetMet(output, ctx)
  },
  {
    id: 'nutrition_variety',
    name: 'Nutrition Variety',
    weight: RULE_WEIGHTS.nutritionVariety,
    check: async output => nutritionVariety(output)
  },
  {
    id: 'cooking_time_feasibility',
    name: 'Cooking Time Feasibility',
    weight: RULE_WEIGHTS.cookingTimeFeasibility,
    check: async output => cookingTimeFeasibility(output)
  },
  {
    id: 'constraint_satisfaction',
    name: 'Constraint Satisfaction',
    weight: RULE_WEIGHTS.constraintSatisfaction,
    check: async (output, ctx) => constraintSatisfaction(output, ctx)
  }
];

export class MealRecommendationValidator {
  rules = mealValidationRules;

  async validate(
    output: string,
    context: ValidationContext
  ): Promise<ValidationReport> {
    const parsed = extractJsonObject(output);
    if (!parsed) {
      return {
        overallScore: 0,
        checks: [
          {
            weight: RULE_WEIGHTS.jsonSchemaValid,
            score: 0,
            message: 'Invalid JSON'
          }
        ]
      };
    }

    const checks = await Promise.all(
      this.rules.map(async rule => {
        const result = await rule.check(parsed, context);
        return {
          ...result,
          weight: rule.weight
        };
      })
    );

    const achievedScore = checks.reduce(
      (sum, check) => sum + check.score * check.weight,
      0
    );

    const totalScoreCanBeAchieved = checks.reduce(
      (sum, check) => sum + 100 * check.weight,
      0
    );

    const overall =
      totalScoreCanBeAchieved > 0
        ? (achievedScore / totalScoreCanBeAchieved) * 100
        : 0;

    return {
      overallScore: Math.round(overall),
      checks
    };
  }
}
