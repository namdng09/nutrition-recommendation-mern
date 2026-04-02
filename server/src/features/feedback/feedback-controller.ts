import type { Request, Response } from 'express';

import { ApiResponse } from '~/shared/utils';
import { parseQuery } from '~/shared/utils/query-parser';

import { FeedbackService } from './feedback-service';

export const FeedbackController = {
  createFeedback: async (req: Request, res: Response) => {
    const data = req.body;
    const userId = req.user!._id.toString();
    const userName = req.user!.name;
    const userRole = req.user!.role;

    const result = await FeedbackService.createFeedback(
      userId,
      userName,
      userRole,
      data
    );

    res
      .status(201)
      .json(ApiResponse.success('Gửi feedback thành công', result));
  },

  viewFeedbacks: async (req: Request, res: Response) => {
    const parsed = parseQuery(req.query);

    const result = await FeedbackService.viewFeedbacks(parsed);

    res
      .status(200)
      .json(ApiResponse.success('Lấy danh sách feedback thành công', result));
  },

  viewFeedbackDetail: async (req: Request, res: Response) => {
    const id = req.params.id;

    const result = await FeedbackService.viewFeedbackDetail(id);

    res
      .status(200)
      .json(ApiResponse.success('Lấy thông tin feedback thành công', result));
  }
};
