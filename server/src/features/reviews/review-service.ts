import type { QueryOptions } from '@quarks/mongoose-query-parser';
import createHttpError from 'http-errors';

import { REVIEW_STATUS } from '~/shared/constants/review-status';
import { ROLE } from '~/shared/constants/role';
import { DishModel, UserModel } from '~/shared/database/models';
import { buildPaginateOptions, validateObjectId } from '~/shared/utils';

import type { EvaluateReviewRequest, SubmitReviewRequest } from './review-dto';

export const ReviewService = {
  submitReview: async (userId: string, data: SubmitReviewRequest) => {
    if (!validateObjectId(data.dishId)) {
      throw createHttpError(400, 'Định dạng ID món ăn không hợp lệ');
    }

    const user = await UserModel.findById(userId).lean();
    if (!user) {
      throw createHttpError(404, 'Người dùng không tồn tại');
    }

    const dish = await DishModel.findById(data.dishId);
    if (!dish) {
      throw createHttpError(404, 'Không tìm thấy món ăn');
    }

    if (dish.user?._id.toString() !== userId) {
      throw createHttpError(
        403,
        'Bạn chỉ có thể submit món ăn do chính mình tạo'
      );
    }

    if (dish.isPublic) {
      throw createHttpError(
        400,
        'Món ăn công khai không cần gửi đánh giá riêng tư'
      );
    }

    const status = dish.evaluation?.status;
    if (status === REVIEW_STATUS.EVALUATED) {
      throw createHttpError(400, 'Món ăn này đã được đánh giá');
    }

    dish.evaluation = {
      ...(dish.evaluation ?? {}),
      status: REVIEW_STATUS.PENDING,
      nutritionistId: undefined,
      rating: undefined,
      feedback: undefined,
      evaluatedAt: undefined
    } as any;

    await dish.save();

    return dish.toObject();
  },

  listReviews: async (parsed: QueryOptions, userId: string) => {
    const user = await UserModel.findById(userId, 'role').lean();
    if (!user) {
      throw createHttpError(404, 'Người dùng không tồn tại');
    }

    const options = buildPaginateOptions(parsed);
    const baseFilter = parsed.filter ?? {};

    const dishFilter =
      user.role === ROLE.USER
        ? {
            ...baseFilter,
            'user._id': userId,
            'evaluation.status': { $exists: true }
          }
        : {
            ...baseFilter,
            'evaluation.status': REVIEW_STATUS.PENDING
          };

    const result = await DishModel.paginate(dishFilter, {
      ...options,
      select: 'name image user evaluation createdAt updatedAt'
    } as any);

    return result;
  },

  viewReviewDetail: async (id: string, userId: string) => {
    if (!validateObjectId(id)) {
      throw createHttpError(400, 'Định dạng ID yêu cầu đánh giá không hợp lệ');
    }

    const user = await UserModel.findById(userId, 'role').lean();
    if (!user) {
      throw createHttpError(404, 'Người dùng không tồn tại');
    }

    const dish = await DishModel.findById(id)
      .select('name image isPublic user evaluation createdAt updatedAt')
      .lean();

    if (!dish || !dish.evaluation?.status) {
      throw createHttpError(404, 'Không tìm thấy yêu cầu đánh giá');
    }

    const isOwner = String(dish.user?._id) === userId;
    const isOpenForNutritionist =
      dish.evaluation?.status === REVIEW_STATUS.PENDING;

    if (user.role === ROLE.USER && !isOwner) {
      throw createHttpError(403, 'Bạn không có quyền xem yêu cầu đánh giá này');
    }

    if (user.role === ROLE.NUTRITIONIST && !isOpenForNutritionist) {
      throw createHttpError(403, 'Bạn không có quyền xem yêu cầu đánh giá này');
    }

    return dish;
  },

  evaluateReview: async (
    id: string,
    userId: string,
    data: EvaluateReviewRequest
  ) => {
    if (!validateObjectId(id)) {
      throw createHttpError(400, 'Định dạng ID yêu cầu đánh giá không hợp lệ');
    }

    const user = await UserModel.findById(userId, 'role').lean();
    if (!user) {
      throw createHttpError(404, 'Người dùng không tồn tại');
    }

    if (user.role !== ROLE.NUTRITIONIST) {
      throw createHttpError(
        403,
        'Chỉ chuyên gia dinh dưỡng mới có thể đánh giá món ăn'
      );
    }

    const dish = await DishModel.findById(id);
    if (!dish) {
      throw createHttpError(404, 'Không tìm thấy yêu cầu đánh giá');
    }

    if (!dish.evaluation?.status) {
      throw createHttpError(404, 'Không tìm thấy yêu cầu đánh giá');
    }

    if (dish.evaluation.status !== REVIEW_STATUS.PENDING) {
      throw createHttpError(400, 'Chỉ có thể đánh giá yêu cầu đang được xử lý');
    }

    if (
      dish.evaluation.nutritionistId &&
      String(dish.evaluation.nutritionistId) !== userId
    ) {
      throw createHttpError(403, 'Yêu cầu đã được xử lý bởi chuyên gia khác');
    }

    if (dish.isActive === false) {
      throw createHttpError(410, 'Món ăn đã được xóa, không thể đánh giá');
    }

    const now = new Date();
    dish.evaluation = {
      ...(dish.evaluation ?? {}),
      status: REVIEW_STATUS.EVALUATED,
      nutritionistId: userId,
      rating: data.rating,
      feedback: data.feedback,
      evaluatedAt: now
    } as any;

    await dish.save();

    return dish.toObject();
  }
};
