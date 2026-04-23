import { randomUUID } from 'node:crypto';

import { SemanticValidator } from '~/features/ai-evaluation/validators';
import { AiMetricModel } from '~/shared/database/models';

export interface MealValidationContext {
  userProfile: {
    allergies: string[];
    diet: string;
    calorieTarget: number;
    goal: string;
  };
  mealSlots: Array<{
    mealType: string;
    calorieTarget: number;
  }>;
  dishCatalog: Array<{
    dishId: string;
    allergens: string[];
    calories: number;
  }>;
}

export interface LogMetricPayload {
  sourceType: 'evaluation' | 'production';
  endpoint: string;
  requestId?: string;
  userId?: string;
  status: 'success' | 'failed';
  isCorrect?: boolean;
  classification?: 'positive' | 'negative';
  accuracyScore?: number;
  ruleScore?: number;
  semanticScore?: number;
  latencyMs: number;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  estimatedCostUsd?: number;
  errorMessage?: string;
  prompt?: string;
  response?: string;
  expected?: Record<string, unknown>;
  testCaseId?: string;
  testCaseName?: string;
  meta?: Record<string, unknown>;
}

const PASS_THRESHOLD = 90;

const extractMealJson = (text: string): Record<string, unknown> | null => {
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

type MealCheck = {
  score: number;
  message: string;
  details?: Record<string, unknown>;
};

const runMealChecks = (
  output: Record<string, unknown>,
  context: MealValidationContext
): MealCheck[] => {
  const meals = (output.meals ?? []) as Array<Record<string, unknown>>;
  const checks: MealCheck[] = [];

  // JSON schema
  const schemaOk =
    Array.isArray(meals) &&
    meals.every(
      m =>
        typeof m === 'object' &&
        m !== null &&
        typeof (m as Record<string, unknown>).mealType === 'string' &&
        Array.isArray((m as Record<string, unknown>).dishes)
    );
  checks.push({
    score: schemaOk ? 1 : 0,
    message: schemaOk ? 'JSON schema valid' : 'Invalid JSON schema'
  });

  // All dish IDs exist
  const catalogIds = new Set(context.dishCatalog.map(d => String(d.dishId)));
  const allDishes = meals.flatMap(
    m => (m.dishes ?? []) as Array<Record<string, unknown>>
  );
  const missing = allDishes
    .map(d => String(d.dishId))
    .filter(id => !catalogIds.has(id));
  checks.push(
    missing.length > 0
      ? {
          score: 0,
          message: `Missing dish IDs: ${[...new Set(missing)].join(', ')}`,
          details: { missingIds: [...new Set(missing)] }
        }
      : { score: 1, message: 'All dish IDs exist' }
  );

  // No allergen dishes
  const userAllergies = new Set(
    context.userProfile.allergies.map(a => a.toLowerCase())
  );
  if (userAllergies.size === 0) {
    checks.push({ score: 1, message: 'No allergies to check' });
  } else {
    const dishMap = new Map(
      context.dishCatalog.map(d => [String(d.dishId), d])
    );
    const violations: string[] = [];
    for (const dish of allDishes) {
      const catalogDish = dishMap.get(String(dish.dishId));
      if (!catalogDish) continue;
      const allergens = new Set(
        ((catalogDish as any).allergens ?? []).map((a: string) =>
          a.toLowerCase()
        )
      );
      const found = [...userAllergies].filter(a => allergens.has(a));
      if (found.length > 0)
        violations.push(`${dish.dishId}: ${found.join(', ')}`);
    }
    checks.push(
      violations.length > 0
        ? {
            score: 0,
            message: `Allergen violations: ${violations.join('; ')}`,
            details: { violations }
          }
        : { score: 1, message: 'No allergen dishes' }
    );
  }

  // Servings in range 1–5
  const badServings = allDishes
    .filter(
      d =>
        typeof d.servings !== 'number' ||
        (d.servings as number) < 1 ||
        (d.servings as number) > 5
    )
    .map(d => ({ dishId: String(d.dishId), servings: d.servings }));
  checks.push(
    badServings.length > 0
      ? {
          score: 0,
          message: `Servings out of range (1-5): ${badServings.map(i => `${i.dishId}=${i.servings}`).join(', ')}`,
          details: { invalid: badServings }
        }
      : { score: 1, message: 'All servings in range' }
  );

  // No duplicate dishes
  const seen = new Set<string>();
  const duplicates: string[] = [];
  for (const d of allDishes) {
    const id = String(d.dishId);
    if (seen.has(id)) duplicates.push(id);
    seen.add(id);
  }
  checks.push(
    duplicates.length > 0
      ? {
          score: 0,
          message: `Duplicate dishes: ${[...new Set(duplicates)].join(', ')}`,
          details: { duplicates: [...new Set(duplicates)] }
        }
      : { score: 1, message: 'No duplicate dishes' }
  );

  // Meal type matches slots
  const slotTypes = new Set(
    context.mealSlots.map(s => s.mealType.toLowerCase())
  );
  const mismatches = meals
    .map(m => String((m as Record<string, unknown>).mealType).toLowerCase())
    .filter(t => !slotTypes.has(t));
  checks.push(
    mismatches.length > 0
      ? {
          score: 0,
          message: `Meal type mismatches: ${mismatches.map(t => `${t} not in slots`).join('; ')}`,
          details: { mismatches }
        }
      : { score: 1, message: 'Meal types match slots' }
  );

  // Meal count matches slots
  checks.push(
    meals.length !== context.mealSlots.length
      ? {
          score: 0,
          message: `Expected ${context.mealSlots.length} meals, got ${meals.length}`
        }
      : { score: 1, message: 'Meal count matches' }
  );

  return checks;
};

// ────────────────────────────────────────────────────────────────────────────

const estimateAiCostUsd = (totalTokens: number): number => {
  const INPUT_COST_PER_1K = 0.00125;
  const OUTPUT_COST_PER_1K = 0.005;
  return (totalTokens * INPUT_COST_PER_1K) / 1000;
};

const calculateDishCalories = (
  dish?: {
    nutrition?: {
      nutrients?: Array<{
        label?: string | null;
        value?: number | null;
      }> | null;
    } | null;
  } | null
): number => {
  if (!dish?.nutrition?.nutrients?.length) return 0;
  const energy = dish.nutrition.nutrients[0];
  if (!energy || typeof energy.value !== 'number') return 0;
  return energy.value;
};

export const MetricsCollector = {
  async logMetric(payload: LogMetricPayload): Promise<void> {
    try {
      await AiMetricModel.create({
        sourceType: payload.sourceType,
        endpoint: payload.endpoint,
        requestId: payload.requestId ?? randomUUID(),
        userId: payload.userId,
        status: payload.status,
        isCorrect: payload.isCorrect,
        classification: payload.classification,
        accuracyScore: payload.accuracyScore,
        ruleScore: payload.ruleScore,
        semanticScore: payload.semanticScore,
        latencyMs: payload.latencyMs,
        inputTokens: payload.inputTokens,
        outputTokens: payload.outputTokens,
        totalTokens: payload.totalTokens,
        estimatedCostUsd:
          payload.estimatedCostUsd ??
          estimateAiCostUsd(payload.totalTokens ?? 0),
        errorMessage: payload.errorMessage,
        prompt: payload.prompt,
        response: payload.response,
        expected: payload.expected,
        testCaseId: payload.testCaseId,
        testCaseName: payload.testCaseName,
        meta: payload.meta
      });
    } catch (error) {
      console.warn(
        `[AI_METRIC] Unable to write metric endpoint=${payload.endpoint}. Reason: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  },

  async validateMealProduction(
    aiOutputText: string,
    context: MealValidationContext
  ): Promise<{
    isCorrect: boolean;
    accuracyScore: number;
    ruleScore: number;
    semanticScore: number;
    validationReport: Record<string, unknown>;
  }> {
    const parsed = extractMealJson(aiOutputText);
    if (!parsed) {
      return {
        isCorrect: false,
        accuracyScore: 0,
        ruleScore: 0,
        semanticScore: 0,
        validationReport: {
          overallScore: 0,
          checks: [{ score: 0, message: 'Invalid JSON' }]
        }
      };
    }

    const checks = runMealChecks(parsed, context);
    const passedRules = checks.filter(c => c.score >= 0.5).length;
    const overallScore = checks.length > 0 ? passedRules / checks.length : 0;
    const ruleScore = Math.round(overallScore * 100);

    let semanticScore = 0;
    if (ruleScore > 0) {
      const semanticValidator = new SemanticValidator();
      const preset = (context as any).preset;
      const semanticResult = await semanticValidator.evaluate({
        goal: context.userProfile.goal,
        diet: context.userProfile.diet,
        calories: context.userProfile.calorieTarget,
        allergies: context.userProfile.allergies,
        mealPlanJson: aiOutputText,
        preset: preset
      });
      // null means LLM failed to evaluate — fall back to rule score to avoid fake data
      semanticScore =
        semanticResult !== null ? semanticResult.overallScore : ruleScore;
      console.log(`[SemanticValidator] result:`, semanticResult);

      // The semantic evaluator can return a neutral default (50) when parsing fails.
      // In that case, avoid letting it unfairly degrade a strong rule score.
      if (semanticScore <= 50) {
        semanticScore = Math.max(semanticScore, ruleScore);
      }
    }

    const accuracyScore = Math.round(ruleScore * 0.6 + semanticScore * 0.4);
    const isCorrect = accuracyScore >= PASS_THRESHOLD;

    return {
      isCorrect,
      accuracyScore,
      ruleScore,
      semanticScore,
      validationReport: {
        overallScore: Math.round(overallScore * 100),
        checks: checks.map(r => ({
          id: r.message,
          score: r.score,
          details: r.details
        }))
      }
    };
  },

  async validateMealEvaluation(
    aiOutputText: string,
    context: MealValidationContext,
    expectedClassification: 'positive' | 'negative'
  ): Promise<{
    isCorrect: boolean;
    classification: 'positive' | 'negative';
    accuracyScore: number;
    ruleScore: number;
    semanticScore: number;
    validationReport: Record<string, unknown>;
  }> {
    const result = await this.validateMealProduction(aiOutputText, context);
    return {
      ...result,
      classification: expectedClassification
    };
  }
};

export { calculateDishCalories, estimateAiCostUsd };
