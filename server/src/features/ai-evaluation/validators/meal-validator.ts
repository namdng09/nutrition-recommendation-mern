import {
  ValidationContext,
  ValidationReport,
  ValidationResult,
  ValidationRule
} from './types';

const extractJsonObject = (text: string): Record<string, unknown> | null => {
  const trimmed = text.trim();
  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    try {
      return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1));
    } catch {
      return null;
    }
  }
  return null;
};

const jsonSchemaValid = (output: string): ValidationResult => {
  const parsed = extractJsonObject(output);
  if (!parsed) {
    return {
      type: 'hard',
      passed: false,
      score: 0,
      message: 'Invalid JSON output'
    };
  }
  const meals = (parsed as Record<string, unknown>).meals;
  if (!Array.isArray(meals)) {
    return {
      type: 'hard',
      passed: false,
      score: 0,
      message: 'Missing meals array'
    };
  }
  for (const meal of meals) {
    if (typeof meal !== 'object' || meal === null) {
      return {
        type: 'hard',
        passed: false,
        score: 0,
        message: 'Invalid meal structure'
      };
    }
    const mealObj = meal as Record<string, unknown>;
    if (typeof mealObj.mealType !== 'string') {
      return {
        type: 'hard',
        passed: false,
        score: 0,
        message: 'Missing mealType'
      };
    }
    if (!Array.isArray(mealObj.dishes)) {
      return {
        type: 'hard',
        passed: false,
        score: 0,
        message: 'Missing dishes array'
      };
    }
  }
  return {
    type: 'hard',
    passed: true,
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
      type: 'hard',
      passed: false,
      score: 0,
      message: `Missing dish IDs: ${[...new Set(missing)].join(', ')}`,
      details: { missingIds: [...new Set(missing)] }
    };
  }
  return {
    type: 'hard',
    passed: true,
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
      type: 'hard',
      passed: true,
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
      type: 'hard',
      passed: false,
      score: 0,
      message: `Allergen violations: ${violations.join('; ')}`,
      details: { violations }
    };
  }
  return {
    type: 'hard',
    passed: true,
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
      type: 'hard',
      passed: false,
      score: 0,
      message: `Servings out of range (1-5): ${invalid.map(i => `${i.dishId}=${i.servings}`).join(', ')}`,
      details: { invalid }
    };
  }
  return {
    type: 'hard',
    passed: true,
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
      type: 'hard',
      passed: false,
      score: 0,
      message: `Duplicate dishes: ${[...new Set(duplicates)].join(', ')}`,
      details: { duplicates: [...new Set(duplicates)] }
    };
  }
  return {
    type: 'hard',
    passed: true,
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
      type: 'hard',
      passed: false,
      score: 0,
      message: `Meal type mismatches: ${mismatches.join('; ')}`,
      details: { mismatches }
    };
  }
  return {
    type: 'hard',
    passed: true,
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
      type: 'hard',
      passed: false,
      score: Math.max(0, 100 - Math.abs(meals.length - slotCount) * 20),
      message: `Expected ${slotCount} meals, got ${meals.length}`
    };
  }
  return {
    type: 'hard',
    passed: true,
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
    type: 'soft',
    weight: 0.35,
    passed: inRange,
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
    type: 'soft',
    weight: 0.25,
    passed: dishCount >= 3,
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
    type: 'soft',
    weight: 0.15,
    passed: feasible,
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
    type: 'soft',
    weight: 0.25,
    passed: score >= 70,
    score,
    message: `Constraint satisfaction score: ${score}`,
    details: { totalDishes }
  };
};

export const mealValidationRules: ValidationRule[] = [
  {
    id: 'json_schema_valid',
    name: 'JSON Schema Valid',
    type: 'hard',
    check: async output => jsonSchemaValid(JSON.stringify(output))
  },
  {
    id: 'all_dish_ids_exist',
    name: 'All Dish IDs Exist',
    type: 'hard',
    check: async (output, ctx) => allDishIdsExist(output, ctx)
  },
  {
    id: 'no_allergen_dishes',
    name: 'No Allergen Dishes',
    type: 'hard',
    check: async (output, ctx) => noAllergenDishes(output, ctx)
  },
  {
    id: 'servings_in_range',
    name: 'Servings In Range (1-5)',
    type: 'hard',
    check: async output => servingsInRange(output)
  },
  {
    id: 'no_duplicate_dishes',
    name: 'No Duplicate Dishes',
    type: 'hard',
    check: async output => noDuplicateDishes(output)
  },
  {
    id: 'meal_type_match',
    name: 'Meal Type Matches Slot',
    type: 'hard',
    check: async (output, ctx) => mealTypeMatch(output, ctx)
  },
  {
    id: 'meal_count_match',
    name: 'Meal Count Matches Slots',
    type: 'hard',
    check: async (output, ctx) => mealCountMatch(output, ctx)
  },
  {
    id: 'macro_target_met',
    name: 'Macro Target Met (±15%)',
    type: 'soft',
    weight: 0.35,
    check: async (output, ctx) => macroTargetMet(output, ctx)
  },
  {
    id: 'nutrition_variety',
    name: 'Nutrition Variety',
    type: 'soft',
    weight: 0.25,
    check: async output => nutritionVariety(output)
  },
  {
    id: 'cooking_time_feasibility',
    name: 'Cooking Time Feasibility',
    type: 'soft',
    weight: 0.15,
    check: async output => cookingTimeFeasibility(output)
  },
  {
    id: 'constraint_satisfaction',
    name: 'Constraint Satisfaction',
    type: 'soft',
    weight: 0.25,
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
        overall_score: 0,
        hard_checks: [
          { type: 'hard', passed: false, score: 0, message: 'Invalid JSON' }
        ],
        soft_checks: [],
        passed: false
      };
    }

    const results = await Promise.all(
      this.rules.map(rule => rule.check(parsed, context))
    );

    const hardResults = results.filter(r => r.type === 'hard');
    const softResults = results.filter(r => r.type === 'soft');

    const hardPassed = hardResults.filter(r => r.passed).length;
    const hardScore = (hardPassed / hardResults.length) * 100;

    const softScore = softResults.reduce((sum, r) => {
      const weight = r.weight ?? 1 / softResults.length;
      return sum + r.score * weight;
    }, 0);

    const overall = hardScore * 0.6 + softScore * 0.4;

    return {
      overall_score: Math.round(overall),
      hard_checks: hardResults,
      soft_checks: softResults,
      passed: hardResults.every(r => r.passed)
    };
  }
}
