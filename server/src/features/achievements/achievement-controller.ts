import type { Request, Response } from 'express';

import { ApiResponse } from '~/shared/utils';

import { AchievementService } from './achievement-service';
import {
  registerAchievementSseClient,
  removeAchievementSseClient,
  sendAchievementSseEvent
} from './achievement-sse';

export const AchievementController = {
  subscribe: (req: Request, res: Response) => {
    const userId = req.user!._id.toString();

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    registerAchievementSseClient(userId, res);

    sendAchievementSseEvent(userId, {
      type: 'connected'
    });

    req.on('close', () => {
      removeAchievementSseClient(userId);
    });
  },

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
