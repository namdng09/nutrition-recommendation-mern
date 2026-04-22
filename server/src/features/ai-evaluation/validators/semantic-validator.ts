import { AiService } from '~/features/ai/ai-service';

export interface SemanticScore {
  nutritionBalance: number;
  mealVariety: number;
  constraintSatisfaction: number;
  cookingTimeFeasibility: number;
  overallScore: number;
}

const RULE_WEIGHTS = {
  nutritionBalance: 1,
  mealVariety: 0.8,
  constraintSatisfaction: 0.7,
  cookingTimeFeasibility: 0.3
} as const;

const SEMANTIC_EVALUATION_PROMPT = `You are a nutrition expert. Rate this meal plan on 0-100 scale:

1. NUTRITION_BALANCE: Macro balance across meals
2. MEAL_VARIETY: Dish diversity, cooking methods
3. CONSTRAINT_SATISFACTION: Meets goal, diet, calories, allergy requirements
4. COOKING_TIME_FEASIBILITY: Reasonability of dish choices and preparation

Context:
- User goal: {goal}
- Diet: {diet}
- Calories target: {calories}
- Allergies: {allergies}
- Meal plan to evaluate: {mealPlan}

Respond ONLY with valid JSON:
{"nutrition_balance": 0-100, "meal_variety": 0-100, "constraint_satisfaction": 0-100, "cooking_time_feasibility": 0-100}`;

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

export class SemanticValidator {
  async evaluate(context: {
    goal: string;
    diet: string;
    calories: number;
    allergies: string[];
    mealPlanJson?: string;
  }): Promise<SemanticScore> {
    const prompt = SEMANTIC_EVALUATION_PROMPT.replace('{goal}', context.goal)
      .replace('{diet}', context.diet)
      .replace('{calories}', String(context.calories))
      .replace('{allergies}', context.allergies.join(', ') || 'none')
      .replace('{mealPlan}', context.mealPlanJson ?? 'N/A');

    try {
      const result = await AiService.runEvaluationPrompt(prompt);
      const parsed = extractJsonObject(result.response);

      if (!parsed) {
        return this.defaultScore('Invalid JSON response from LLM');
      }

      const nutritionBalance = Number(parsed.nutrition_balance);
      const mealVariety = Number(parsed.meal_variety);
      const constraintSatisfaction = Number(parsed.constraint_satisfaction);
      const cookingTimeFeasibility = Number(parsed.cooking_time_feasibility);

      const semanticScore =
        nutritionBalance * RULE_WEIGHTS.nutritionBalance +
        mealVariety * RULE_WEIGHTS.mealVariety +
        constraintSatisfaction * RULE_WEIGHTS.constraintSatisfaction +
        cookingTimeFeasibility * RULE_WEIGHTS.cookingTimeFeasibility;

      const totalScoreCanBeAchieved =
        100 * Object.values(RULE_WEIGHTS).reduce((a, b) => a + b, 0);

      const overallScore = Math.round(
        (semanticScore / totalScoreCanBeAchieved) * 100
      );

      return {
        nutritionBalance,
        mealVariety,
        constraintSatisfaction,
        cookingTimeFeasibility,
        overallScore
      };
    } catch (error) {
      console.warn('[SemanticValidator] LLM evaluation failed:', error);
      return this.defaultScore(
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  private defaultScore(reason: string): SemanticScore {
    return {
      nutritionBalance: 50,
      mealVariety: 50,
      constraintSatisfaction: 50,
      cookingTimeFeasibility: 50,
      overallScore: 50
    };
  }
}
