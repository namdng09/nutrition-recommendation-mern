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
        ApiResponse.success('Gửi yêu cầu duyệt món ăn riêng thành công', result)
      );
  },

  viewReviews: async (req: Request, res: Response) => {
    const userId = req.user!._id.toString();
    const parsed = parseQuery(req.query);
    const result = await ReviewService.listReviews(parsed, userId);

    res
      .status(200)
      .json(
        ApiResponse.success('Lấy danh sách yêu cầu duyệt thành công', result)
      );
  },

  viewReviewDetail: async (req: Request, res: Response) => {
    const userId = req.user!._id.toString();
    const result = await ReviewService.viewReviewDetail(req.params.id, userId);

    res
      .status(200)
      .json(
        ApiResponse.success('Lấy chi tiết yêu cầu duyệt thành công', result)
      );
  },

  pickUpReview: async (req: Request, res: Response) => {
    const userId = req.user!._id.toString();
    const result = await ReviewService.pickUpReview(req.params.id, userId);

    res
      .status(200)
      .json(ApiResponse.success('Nhận yêu cầu duyệt thành công', result));
  },

  addComment: async (req: Request, res: Response) => {
    const userId = req.user!._id.toString();
    const result = await ReviewService.addComment(
      req.params.id,
      userId,
      req.body
    );

    res
      .status(200)
      .json(
        ApiResponse.success(
          'Thêm bình luận cho yêu cầu duyệt thành công',
          result
        )
      );
  },

  approveReview: async (req: Request, res: Response) => {
    const userId = req.user!._id.toString();
    const result = await ReviewService.approveReview(req.params.id, userId);

    res
      .status(200)
      .json(ApiResponse.success('Phê duyệt yêu cầu duyệt thành công', result));
  },

  rejectReview: async (req: Request, res: Response) => {
    const userId = req.user!._id.toString();
    const result = await ReviewService.rejectReview(
      req.params.id,
      userId,
      req.body
    );

    res
      .status(200)
      .json(ApiResponse.success('Từ chối yêu cầu duyệt thành công', result));
  }
};
