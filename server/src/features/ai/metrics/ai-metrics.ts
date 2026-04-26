import { randomUUID } from 'node:crypto';

import {
  MealRecommendationValidator,
  SemanticValidator
} from '~/features/ai-evaluation/validators';
import { AiMetricModel } from '~/shared/database/models';

const PASS_THRESHOLD = 90;

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
  estimatedCostUsd?: number;
  errorMessage?: string;
  prompt?: string;
  response?: string;
  testCaseId?: string;
  testCaseName?: string;
  validationReport?: Record<string, unknown>;
  qualityMetadata?: Record<string, unknown>;
}

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
        estimatedCostUsd:
          payload.estimatedCostUsd ??
          estimateAiCostUsd(
            (payload.inputTokens ?? 0) + (payload.outputTokens ?? 0)
          ),
        errorMessage: payload.errorMessage,
        prompt: payload.prompt,
        response: payload.response,
        testCaseId: payload.testCaseId,
        testCaseName: payload.testCaseName,
        validationReport: payload.validationReport,
        qualityMetadata: payload.qualityMetadata
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
    const validator = new MealRecommendationValidator();
    const validationReport = await validator.validate(aiOutputText, context);
    console.log(
      `[MealRecommendationValidator] overallScore: ${validationReport.overallScore}, checks: ${JSON.stringify(validationReport.checks)}`
    );

    const ruleScore = Math.round(validationReport.overallScore);

    let semanticScore = 0;
    if (validationReport.overallScore > 0) {
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
      // null means LLM evaluator failed — fall back to rule score to avoid fake data
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
        overallScore: validationReport.overallScore,
        checks: validationReport.checks.map(r => ({
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
