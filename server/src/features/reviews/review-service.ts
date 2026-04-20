import type { QueryOptions } from '@quarks/mongoose-query-parser';
import createHttpError from 'http-errors';
import type { PaginateResult } from 'mongoose';

import { REVIEW_STATUS } from '~/shared/constants/review-status';
import { DishModel, UserModel } from '~/shared/database/models';
import type { Dish } from '~/shared/database/models/dish-model';
import {
  buildPaginateOptions,
  toObjectId,
  validateObjectId
} from '~/shared/utils';

import type { EvaluateReviewRequest, SubmitReviewRequest } from './review-dto';

export const ReviewService = {
  submitReview: async (userId: string, data: SubmitReviewRequest) => {
    if (!validateObjectId(data.dishId)) {
      throw createHttpError(400, 'Định dạng ID món ăn không hợp lệ');
    }

    const dish = await DishModel.findById(data.dishId);
    if (!dish) {
      throw createHttpError(404, 'Không tìm thấy món ăn');
    }

    if (dish.user?._id.toString() !== userId) {
      throw createHttpError(
        403,
        'Bạn chỉ có thể gửi yêu cầu đánh giá món ăn do chính mình tạo'
      );
    }

    if (dish.isPublic) {
      throw createHttpError(400, 'Món ăn công khai không cần đánh giá');
    }

    const status = dish.evaluation?.status;
    if (status === REVIEW_STATUS.EVALUATED) {
      throw createHttpError(400, 'Món ăn này đã được đánh giá');
    }

    dish.evaluation = {
      status: REVIEW_STATUS.PENDING,
      nutritionistId: null,
      rating: null,
      feedback: null,
      evaluatedAt: null
    };

    await dish.save();

    return dish.toObject();
  },

  listReviews: async (
    parsed: QueryOptions,
    nutritionistId: string
  ): Promise<PaginateResult<Dish>> => {
    const options = buildPaginateOptions(parsed);
    const baseFilter = parsed.filter ?? {};

    const dishFilter = {
      ...baseFilter,
      $or: [
        { 'evaluation.status': REVIEW_STATUS.PENDING },
        {
          'evaluation.status': REVIEW_STATUS.EVALUATED,
          'evaluation.nutritionistId': nutritionistId
        }
      ]
    };

    return DishModel.paginate(dishFilter, {
      ...options,
      select: 'name image user evaluation createdAt updatedAt'
    });
  },

  viewReviewDetail: async (dishId: string, nutritionistId: string) => {
    if (!validateObjectId(dishId)) {
      throw createHttpError(400, 'Định dạng ID món ăn không hợp lệ');
    }

    const dish = await DishModel.findById(dishId).select(
      'name image isPublic user evaluation createdAt updatedAt'
    );

    if (!dish) {
      throw createHttpError(404, 'Không tìm thấy món ăn');
    }

    if (!dish.evaluation?.status) {
      throw createHttpError(404, 'Không tìm thấy yêu cầu đánh giá');
    }

    const isOpenForNutritionist =
      dish.evaluation?.status === REVIEW_STATUS.PENDING ||
      (dish.evaluation?.status === REVIEW_STATUS.EVALUATED &&
        String(dish.evaluation?.nutritionistId) === nutritionistId);

    if (!isOpenForNutritionist) {
      throw createHttpError(403, 'Bạn không có quyền xem yêu cầu đánh giá này');
    }

    const nutritionist = await UserModel.findById(
      dish.evaluation.nutritionistId
    )
      .select('name avatar')
      .lean();

    const submitterProfile = await UserModel.findById(dish.user?._id)
      .select(
        'gender dob height bodyfat weightRecord diet activityLevel goal allergens medicalHistory nutritionTarget'
      )
      .lean();

    const dishObj = dish.toObject();

    if (dishObj.evaluation) {
      delete dishObj.evaluation.nutritionistId;
    }

    const user = dishObj.user
      ? {
          ...dishObj.user,
          profile: submitterProfile
        }
      : dishObj.user;

    return {
      ...dishObj,
      user,
      evaluation: {
        ...dishObj.evaluation,
        nutritionist: {
          _id: nutritionist?._id,
          name: nutritionist?.name,
          avatar: nutritionist?.avatar
        }
      }
    };
  },

  evaluateReview: async (
    dishId: string,
    nutritionistId: string,
    data: EvaluateReviewRequest
  ) => {
    if (!validateObjectId(dishId)) {
      throw createHttpError(400, 'Định dạng ID món ăn không hợp lệ');
    }

    const dish = await DishModel.findById(dishId);
    if (!dish) {
      throw createHttpError(404, 'Không tìm thấy món ăn');
    }

    if (!dish.evaluation?.status) {
      throw createHttpError(404, 'Không tìm thấy yêu cầu đánh giá');
    }

    if (dish.evaluation.status !== REVIEW_STATUS.PENDING) {
      throw createHttpError(400, 'Chỉ có thể đánh giá yêu cầu đang được xử lý');
    }

    if (
      dish.evaluation.nutritionistId &&
      String(dish.evaluation.nutritionistId) !== nutritionistId
    ) {
      throw createHttpError(403, 'Yêu cầu đã được xử lý bởi chuyên gia khác');
    }

    if (dish.isActive === false) {
      throw createHttpError(410, 'Món ăn đã được xóa, không thể đánh giá');
    }

    const now = new Date();
    dish.evaluation = {
      status: REVIEW_STATUS.EVALUATED,
      nutritionistId: toObjectId(nutritionistId),
      rating: data.rating,
      feedback: data.feedback,
      evaluatedAt: now
    };

    await dish.save();

    const nutritionist = await UserModel.findById(nutritionistId)
      .select('name avatar')
      .lean();

    const dishObj = dish.toObject();

    if (dishObj.evaluation) {
      delete dishObj.evaluation.nutritionistId;
    }

    return {
      ...dishObj,
      evaluation: {
        ...dishObj.evaluation,
        nutritionist: {
          _id: nutritionist?._id,
          name: nutritionist?.name,
          avatar: nutritionist?.avatar
        }
      }
    };
  }
};
