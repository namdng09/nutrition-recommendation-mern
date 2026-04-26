import { AiService } from '~/features/ai/ai-service';

import { MealPresetKey, MealPresetOptions, mealPresets } from '../fixtures';

export interface SemanticScore {
  nutritionBalance: number;
  mealVariety: number;
  constraintSatisfaction: number;
  cookingTimeFeasibility: number;
  overallScore: number;
  reason?: string;
}

const RULE_WEIGHTS = {
  nutritionBalance: 1,
  mealVariety: 0.8,
  constraintSatisfaction: 0.7,
  cookingTimeFeasibility: 0.3
} as const;

const SEMANTIC_EVALUATION_PROMPT = `You are a nutrition expert. Rate this meal plan on 0-100 scale.

Context:
- User goal: {goal}
- Diet: {diet}
- Calories target: {calories}
- Allergies: {allergies}

{presetContext}
Meal plan JSON: {mealPlan}

Rate these aspects:
1. NUTRITION_BALANCE: Macro balance across meals (protein, carbs, fats distribution)
2. MEAL_VARIETY: Different meal types, dish count variety
3. CONSTRAINT_SATISFACTION: Matches goal/diet/calories/allergies
4. COOKING_TIME_FEASIBILITY: Reasonable portions and serving counts

IMPORTANT: Respond ONLY with valid JSON - no text, no explanations, no questions. If you cannot evaluate, still return JSON scores.
{"nutrition_balance": 0-100, "meal_variety": 0-100, "constraint_satisfaction": 0-100, "cooking_time_feasibility": 0-100}`;

const extractJsonObject = (text: string): Record<string, unknown> | null => {
  const cleaned = text
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace >= 0 && lastBrace > firstBrace) {
      try {
        return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
};

export class SemanticValidator {
  async evaluate(context: {
    goal: string;
    diet: string;
    calories: number;
    allergies: string[];
    mealPlanJson?: string;
    preset?: string;
  }): Promise<SemanticScore | null> {
    // Resolve preset data
    const presetKey = context.preset as MealPresetKey;
    const presetData =
      presetKey && mealPresets[presetKey] ? mealPresets[presetKey] : null;

    const presetContext = presetData
      ? `
USER PROFILE:
- Age: ${presetData.userProfile.age}
- Gender: ${presetData.userProfile.gender}
- Weight: ${presetData.userProfile.weight}kg
- Height: ${presetData.userProfile.height}cm

DISH CATALOG:
${presetData.dishCatalog.map(d => `- ${d.name} (${d.calories} cal, P:${d.protein}g C:${d.carbs}g F:${d.fat}g)`).join('\n')}

MEAL SLOTS:
${presetData.mealSlots.map(s => `- ${s.mealType}: ${s.dishCount} dishes`).join('\n')}
`
      : '';

    const prompt = SEMANTIC_EVALUATION_PROMPT.replace('{goal}', context.goal)
      .replace('{diet}', context.diet)
      .replace('{calories}', String(context.calories))
      .replace('{allergies}', context.allergies.join(', ') || 'none')
      .replace('{presetContext}', presetContext)
      .replace('{mealPlan}', context.mealPlanJson ?? 'N/A');

    try {
      const result = await AiService.runEvaluationPrompt(prompt);
      const parsed = extractJsonObject(result.response);

      if (!parsed) {
        console.warn(
          '[SemanticValidator] Failed to parse JSON from LLM response. Raw:',
          result.response.slice(0, 300)
        );
        return null;
      }

      console.log('[SemanticValidator] Parsed scores:', parsed);

      const nutritionBalance = Number(parsed.nutrition_balance);
      const mealVariety = Number(parsed.meal_variety);
      const constraintSatisfaction = Number(parsed.constraint_satisfaction);
      const cookingTimeFeasibility = Number(parsed.cooking_time_feasibility);

      // Handle all zeros case
      if (
        nutritionBalance === 0 &&
        mealVariety === 0 &&
        constraintSatisfaction === 0 &&
        cookingTimeFeasibility === 0
      ) {
        console.warn(
          '[SemanticValidator] All zeros from LLM — returning null to avoid fake data'
        );
        return null;
      }

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
        overallScore,
        reason: `N=${nutritionBalance}, V=${mealVariety}, C=${constraintSatisfaction}, T=${cookingTimeFeasibility}`
      };
    } catch (error) {
      console.warn('[SemanticValidator] LLM evaluation failed:', error);
      return null;
    }
  }
}
