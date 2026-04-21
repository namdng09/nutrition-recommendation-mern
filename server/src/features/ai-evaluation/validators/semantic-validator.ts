import { AiService } from '~/features/ai/ai-service';

export interface SemanticScore {
  nutrition_balance: number;
  meal_variety: number;
  constraint_satisfaction: number;
  reasoning: string;
  overallScore: number;
}

const SEMANTIC_EVALUATION_PROMPT = `Bạn là chuyên gia dinh dưỡng. Đánh giá meal recommendation 0-100 theo:

1. NUTRITION_BALANCE (35%): Cân bằng macros giữa các bữa
2. MEAL_VARIETY (30%): Đa dạng món ăn, phương pháp nấu
3. CONSTRAINT_SATISFACTION (35%): Đáp ứng mục tiêu/diet người dùng

Context:
- User goal: {goal}
- Diet: {diet}
- Calories target: {calories}
- Allergies: {allergies}

Output JSON only:
{
  "nutrition_balance": 85,
  "meal_variety": 70,
  "constraint_satisfaction": 90,
  "reasoning": "Brief explanation"
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
  async evaluate(
    response: string,
    context: {
      goal: string;
      diet: string;
      calories: number;
      allergies: string[];
    }
  ): Promise<SemanticScore> {
    const prompt = SEMANTIC_EVALUATION_PROMPT.replace('{goal}', context.goal)
      .replace('{diet}', context.diet)
      .replace('{calories}', String(context.calories))
      .replace('{allergies}', context.allergies.join(', ') || 'none');

    try {
      const result = await AiService.runEvaluationPrompt(prompt);
      const parsed = extractJsonObject(result.response);

      if (!parsed) {
        return this.defaultScore('Invalid JSON response from LLM');
      }

      const nutrition_balance = Number(parsed.nutrition_balance) || 50;
      const meal_variety = Number(parsed.meal_variety) || 50;
      const constraint_satisfaction =
        Number(parsed.constraint_satisfaction) || 50;
      const reasoning = String(parsed.reasoning) || '';

      const overallScore = Math.round(
        nutrition_balance * 0.35 +
          meal_variety * 0.3 +
          constraint_satisfaction * 0.35
      );

      return {
        nutrition_balance,
        meal_variety,
        constraint_satisfaction,
        reasoning,
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
      nutrition_balance: 50,
      meal_variety: 50,
      constraint_satisfaction: 50,
      reasoning: `Fallback: ${reason}`,
      overallScore: 50
    };
  }
}
