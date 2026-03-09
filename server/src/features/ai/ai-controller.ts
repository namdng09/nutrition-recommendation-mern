import type { Request, Response } from 'express';
import createHttpError from 'http-errors';

import { ApiResponse } from '~/shared/utils';

import type { AskAgentRequest, RecommendDailyMealsRequest } from './ai-dto';
import { AiService } from './ai-service';

export const AiController = {
  askAgent: async (req: Request, res: Response) => {
    const payload = req.body as AskAgentRequest;

    const result = await AiService.askAgent(payload);

    res.status(200).json(ApiResponse.success('Trả lời thành công', result));
  },

  recommendDailyMeals: async (req: Request, res: Response) => {
    const userId = req.user?._id?.toString();
    if (!userId) {
      throw createHttpError(401, 'Unauthorized');
    }

    const payload = req.body as RecommendDailyMealsRequest;
    const result = await AiService.recommendDailyMeals(userId, payload);

    res
      .status(200)
      .json(ApiResponse.success('Tạo gợi ý bữa ăn thành công', result));
  }
};
