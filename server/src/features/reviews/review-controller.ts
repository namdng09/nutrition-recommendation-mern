import type { Request, Response } from 'express';

import { ApiResponse } from '~/shared/utils';
import { parseQuery } from '~/shared/utils/query-parser';

import { ReviewService } from './review-service';

export const ReviewController = {
  submitReview: async (req: Request, res: Response) => {
    const userId = req.user!._id.toString();
    const result = await ReviewService.submitReview(userId, req.body);

    res
      .status(201)
      .json(
        ApiResponse.success(
          'Gửi yêu cầu đánh giá món ăn riêng thành công',
          result
        )
      );
  },

  viewReviews: async (req: Request, res: Response) => {
    const userId = req.user!._id.toString();
    const parsed = parseQuery(req.query);
    const result = await ReviewService.listReviews(parsed, userId);

    res
      .status(200)
      .json(
        ApiResponse.success('Lấy danh sách yêu cầu đánh giá thành công', result)
      );
  },

  viewReviewDetail: async (req: Request, res: Response) => {
    const userId = req.user!._id.toString();
    const result = await ReviewService.viewReviewDetail(req.params.id, userId);

    res
      .status(200)
      .json(
        ApiResponse.success('Lấy chi tiết yêu cầu đánh giá thành công', result)
      );
  },

  evaluateReview: async (req: Request, res: Response) => {
    const userId = req.user!._id.toString();
    const result = await ReviewService.evaluateReview(
      req.params.id,
      userId,
      req.body
    );

    res
      .status(200)
      .json(ApiResponse.success('Đánh giá món ăn thành công', result));
  }
};
