import { z } from 'zod';

export const askAgentRequestSchema = z.object({
  message: z.string('Tin nhắn là bắt buộc').min(1, 'Tin nhắn là bắt buộc'),
  provider: z.enum(['openai', 'gemini']).optional(),
  model: z.string().min(1, 'Model không hợp lệ').optional(),
  temperature: z
    .number()
    .min(0, 'Temperature không hợp lệ')
    .max(2, 'Temperature không hợp lệ')
    .optional(),
  maxTokens: z
    .number()
    .int('maxTokens phải là số nguyên')
    .positive('maxTokens phải lớn hơn 0')
    .optional(),
  systemPrompt: z.string().min(1, 'System prompt không hợp lệ').optional()
});

export type AskAgentRequest = z.infer<typeof askAgentRequestSchema>;

export interface AskAgentResponse {
  provider: 'openai' | 'gemini';
  model: string;
  response: string;
  toolCalls?: Array<{ name: string; args: unknown }>;
}

export const recommendDailyMealsRequestSchema = z.object({
  date: z.coerce.date('Định dạng ngày không hợp lệ')
});

export type RecommendDailyMealsRequest = z.infer<
  typeof recommendDailyMealsRequestSchema
>;

const aiDishPickSchema = z
  .object({
    dishId: z.string().trim().min(1, 'dishId là bắt buộc'),
    servings: z.coerce
      .number()
      .int('servings phải là số nguyên')
      .min(1, 'servings phải lớn hơn hoặc bằng 1')
      .max(5, 'servings phải nhỏ hơn hoặc bằng 5')
      .optional()
  })
  .strict();

const aiMealPickSchema = z
  .object({
    mealType: z.string().trim().min(1, 'mealType là bắt buộc'),
    dishes: z.array(aiDishPickSchema)
  })
  .strict();

export const aiMealRecommendationSchema = z.array(aiMealPickSchema);

type NutritionItemResponse = {
  label?: string | null;
  unit?: string | null;
  value?: number | null;
};

type DishNutritionResponse = {
  nutrients?: NutritionItemResponse[] | null;
  minerals?: NutritionItemResponse[] | null;
  vitamins?: NutritionItemResponse[] | null;
} | null;

export interface DailyMealRecommendationResponse {
  date: string;
  dayOfWeek: string;
  meals: Array<{
    mealType: string;
    dishes: Array<{
      dishId: string;
      name: string;
      servings: number;
      image?: string;
      nutrition: DishNutritionResponse;
    }>;
  }>;
}
