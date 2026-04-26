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

const jsonSchemaValid = (output: string): ValidationResult => {
  const parsed = extractJsonObject(output);
  if (!parsed) {
    return {
      id: 'json_schema_valid',
      score: 0,
      message: 'Invalid JSON output'
    };
  }
  const meals = (parsed as Record<string, unknown>).meals;
  if (!Array.isArray(meals)) {
    return {
      id: 'json_schema_valid',
      score: 0,
      message: 'Missing meals array'
    };
  }
  for (const meal of meals) {
    if (typeof meal !== 'object' || meal === null) {
      return {
        id: 'json_schema_valid',
        score: 0,
        message: 'Invalid meal structure'
      };
    }
    const mealObj = meal as Record<string, unknown>;
    if (typeof mealObj.mealType !== 'string') {
      return {
        id: 'json_schema_valid',
        score: 0,
        message: 'Missing mealType'
      };
    }
    if (!Array.isArray(mealObj.dishes)) {
      return {
        id: 'json_schema_valid',
        score: 0,
        message: 'Missing dishes array'
      };
    }
  }
  return {
    id: 'json_schema_valid',
    score: 1,
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
      id: 'all_dish_ids_exist',
      score: 0,
      message: `Missing dish IDs: ${[...new Set(missing)].join(', ')}`,
      details: { missingIds: [...new Set(missing)] }
    };
  }
  return {
    id: 'all_dish_ids_exist',
    score: 1,
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
      id: 'no_allergen_dishes',
      score: 1,
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
      id: 'no_allergen_dishes',
      score: 0,
      message: `Allergen violations: ${violations.join('; ')}`,
      details: { violations }
    };
  }
  return {
    id: 'no_allergen_dishes',
    score: 1,
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
      id: 'servings_in_range',
      score: 0,
      message: `Servings out of range (1-5): ${invalid.map(i => `${i.dishId}=${i.servings}`).join(', ')}`,
      details: { invalid }
    };
  }
  return {
    id: 'servings_in_range',
    score: 1,
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
      id: 'no_duplicate_dishes',
      score: 0,
      message: `Duplicate dishes: ${[...new Set(duplicates)].join(', ')}`,
      details: { duplicates: [...new Set(duplicates)] }
    };
  }
  return {
    id: 'no_duplicate_dishes',
    score: 1,
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
      id: 'meal_type_match',
      score: 0,
      message: `Meal type mismatches: ${mismatches.join('; ')}`,
      details: { mismatches }
    };
  }
  return {
    id: 'meal_type_match',
    score: 1,
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
      id: 'meal_count_match',
      score: 0,
      message: `Expected ${slotCount} meals, got ${meals.length}`
    };
  }
  return {
    id: 'meal_count_match',
    score: 1,
    message: 'Meal count matches'
  };
};

export const mealValidationRules: ValidationRule[] = [
  {
    id: 'json_schema_valid',
    name: 'JSON Schema Valid',
    check: async output => jsonSchemaValid(JSON.stringify(output))
  },
  {
    id: 'all_dish_ids_exist',
    name: 'All Dish IDs Exist',
    check: async (output, ctx) => allDishIdsExist(output, ctx)
  },
  {
    id: 'no_allergen_dishes',
    name: 'No Allergen Dishes',
    check: async (output, ctx) => noAllergenDishes(output, ctx)
  },
  {
    id: 'servings_in_range',
    name: 'Servings In Range (1-5)',
    check: async output => servingsInRange(output)
  },
  {
    id: 'no_duplicate_dishes',
    name: 'No Duplicate Dishes',
    check: async output => noDuplicateDishes(output)
  },
  {
    id: 'meal_type_match',
    name: 'Meal Type Matches Slot',
    check: async (output, ctx) => mealTypeMatch(output, ctx)
  },
  {
    id: 'meal_count_match',
    name: 'Meal Count Matches Slots',
    check: async (output, ctx) => mealCountMatch(output, ctx)
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
            id: 'Invalid JSON',
            score: 0,
            message: 'Response is not valid JSON'
          }
        ]
      };
    }

    const checks = await Promise.all(
      this.rules.map(async rule => {
        return await rule.check(parsed, context);
      })
    );

    const totalRules = checks.length;
    const passedRules = checks.filter(c => c.score >= 1).length;
    const overall = totalRules > 0 ? passedRules / totalRules : 0;

    return {
      overallScore: Math.round(overall * 100),
      checks
    };
  }
}
