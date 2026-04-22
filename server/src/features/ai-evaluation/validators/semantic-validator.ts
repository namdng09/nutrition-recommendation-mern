import { AiService } from '~/features/ai/ai-service';

export interface SemanticScore {
  nutritionBalance: number;
  mealVariety: number;
  constraintSatisfaction: number;
  cookingTimeFeasibility: number;
  overallScore: number;
}

const SEMANTIC_EVALUATION_PROMPT = `Bạn là chuyên gia dinh dưỡng. Đánh giá gợi ý bữa ăn bằng thang 0-100 theo:

1. NUTRITION_BALANCE (35%): Cân bằng macros giữa các bữa
2. MEAL_VARIETY (30%): Đa dạng món ăn, phương pháp nấu
3. CONSTRAINT_SATISFACTION (25%): Thỏa mãn các yêu cầu về mục tiêu, chế độ ăn, calo, dị ứng
4. COOKING_TIME_FEASIBILITY (10%): Lý do lựa chọn món ăn, cách chế biến phù hợp

Context:
- User goal: {goal}
- Diet: {diet}
- Calories target: {calories}
- Allergies: {allergies}
- Meal plan JSON: {mealPlan}

Output JSON only:
{
  "nutrition_balance": 85,
  "meal_variety": 70,
  "constraint_satisfaction": 90,
  "cooking_time_feasibility": 80,
}`;

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

      const nutritionBalance = Number(parsed.nutrition_balance) || 50;
      const mealVariety = Number(parsed.meal_variety) || 50;
      const constraintSatisfaction =
        Number(parsed.constraint_satisfaction) || 50;
      const cookingTimeFeasibility =
        Number(parsed.cooking_time_feasibility) || 50;

      const overallScore = Math.round(
        nutritionBalance * 0.35 +
          mealVariety * 0.3 +
          constraintSatisfaction * 0.25 +
          cookingTimeFeasibility * 0.1
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
