import type { Request, Response } from 'express';

import { ApiResponse } from '~/shared/utils';

import { AchievementService } from './achievement-service';

export const AchievementController = {
  getAllDefinitions: (_req: Request, res: Response) => {
    const result = AchievementService.getAllDefinitions();
    res
      .status(200)
      .json(ApiResponse.success('Lấy danh sách thành tựu thành công', result));
  },

  getUserAchievements: async (req: Request, res: Response) => {
    const userId = req.user!._id.toString();
    const result = await AchievementService.getUserAchievements(userId);
    res
      .status(200)
      .json(
        ApiResponse.success('Lấy thành tựu của người dùng thành công', result)
      );
  }
};
