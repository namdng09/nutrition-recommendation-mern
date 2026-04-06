import type { QueryOptions } from '@quarks/mongoose-query-parser';
import createHttpError from 'http-errors';

import { REVIEW_STATUS } from '~/shared/constants/review-status';
import { ROLE } from '~/shared/constants/role';
import { DishModel, ReviewModel, UserModel } from '~/shared/database/models';
import {
  buildPaginateOptions,
  sendMail,
  validateObjectId
} from '~/shared/utils';

import type {
  AddCommentRequest,
  RejectReviewRequest,
  SubmitReviewRequest
} from './review-dto';

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
        'Món ăn công khai không cần gửi duyệt riêng tư'
      );
    }

    let thread = await ReviewModel.findOne({
      dishId: data.dishId,
      userId
    });

    if (!thread) {
      thread = await ReviewModel.create({
        dishId: data.dishId,
        userId,
        status: REVIEW_STATUS.DRAFT
      });
    }

    const now = new Date();

    if (!thread) {
      throw createHttpError(404, 'Không tìm thấy luồng duyệt món ăn');
    }

    if (thread.status === REVIEW_STATUS.UNDER_REVIEW) {
      throw createHttpError(
        400,
        'Yêu cầu duyệt đang được xem xét, không thể gửi lại'
      );
    }

    if (thread.status === REVIEW_STATUS.APPROVED) {
      throw createHttpError(400, 'Món ăn này đã được duyệt');
    }

    // Validate dish before submitting
    if (!dish.name || !dish.ingredients?.length || !dish.instructions?.length) {
      throw createHttpError(
        400,
        'Món ăn chưa đầy đủ thông tin. Cần có tên, nguyên liệu và hướng dẫn nấu ăn'
      );
    }

    if (thread.status === REVIEW_STATUS.DRAFT) {
      thread.status = REVIEW_STATUS.PENDING;
      thread.submittedAt = now;
    } else if (thread.status === REVIEW_STATUS.REJECTED) {
      thread.status = REVIEW_STATUS.PENDING;
      thread.lastResubmittedAt = now;
      thread.rejectionReason = undefined as any;
      // Keep nutritionistId and pickedAt so the same nutritionist can continue reviewing
      // thread.nutritionistId = undefined as any;
      // thread.pickedAt = undefined as any;
      thread.reviewedAt = undefined as any;
      thread.submittedAt = now;
    } else if (thread.status === REVIEW_STATUS.PENDING) {
      // Already submitted, return as is (idempotent)
    }

    await thread.save();

    return thread;
  },

  listReviews: async (parsed: QueryOptions, userId: string) => {
    const user = await UserModel.findById(userId, 'role').lean();
    if (!user) {
      throw createHttpError(404, 'Người dùng không tồn tại');
    }

    const options = buildPaginateOptions(parsed);
    const baseFilter = parsed.filter ?? {};

    let filter: Record<string, unknown>;

    if (user.role === ROLE.USER) {
      filter = {
        ...baseFilter,
        userId
      };
    } else {
      filter = {
        ...baseFilter,
        $or: [
          { status: REVIEW_STATUS.PENDING },
          {
            status: REVIEW_STATUS.UNDER_REVIEW,
            nutritionistId: userId
          }
        ]
      };
    }

    const result = await ReviewModel.paginate(filter, {
      ...options,
      populate: [
        { path: 'dishId', select: 'name image isPublic user' },
        { path: 'userId', select: 'name email' },
        { path: 'nutritionistId', select: 'name email' }
      ]
    } as any);

    return result;
  },

  viewReviewDetail: async (id: string, userId: string) => {
    if (!validateObjectId(id)) {
      throw createHttpError(400, 'Định dạng ID yêu cầu duyệt không hợp lệ');
    }

    const user = await UserModel.findById(userId, 'role').lean();
    if (!user) {
      throw createHttpError(404, 'Người dùng không tồn tại');
    }

    const review = await ReviewModel.findById(id)
      .populate([
        { path: 'dishId', select: 'name image isPublic user' },
        { path: 'userId', select: 'name email' },
        { path: 'nutritionistId', select: 'name email' }
      ])
      .lean();

    if (!review) {
      throw createHttpError(404, 'Không tìm thấy yêu cầu duyệt');
    }

    const isOwner = String(review.userId?._id ?? review.userId) === userId;
    const isAssignedNutritionist =
      String(review.nutritionistId?._id ?? review.nutritionistId) === userId;
    const isOpenForNutritionist =
      review.status === REVIEW_STATUS.PENDING || isAssignedNutritionist;

    if (user.role === ROLE.USER && !isOwner) {
      throw createHttpError(403, 'Bạn không có quyền xem yêu cầu duyệt này');
    }

    if (user.role === ROLE.NUTRITIONIST && !isOpenForNutritionist) {
      throw createHttpError(403, 'Bạn không có quyền xem yêu cầu duyệt này');
    }

    return review;
  },

  pickUpReview: async (id: string, userId: string) => {
    if (!validateObjectId(id)) {
      throw createHttpError(400, 'Định dạng ID yêu cầu duyệt không hợp lệ');
    }

    const user = await UserModel.findById(userId, 'role').lean();
    if (!user) {
      throw createHttpError(404, 'Người dùng không tồn tại');
    }

    if (user.role !== ROLE.NUTRITIONIST) {
      throw createHttpError(
        403,
        'Chỉ chuyên gia dinh dưỡng mới có thể nhận yêu cầu duyệt'
      );
    }

    const review = await ReviewModel.findOneAndUpdate(
      {
        _id: id,
        status: REVIEW_STATUS.PENDING,
        $or: [{ nutritionistId: { $exists: false } }, { nutritionistId: null }]
      },
      {
        $set: {
          status: REVIEW_STATUS.UNDER_REVIEW,
          nutritionistId: userId,
          pickedAt: new Date()
        }
      },
      { new: true }
    )
      .populate([
        { path: 'dishId', select: 'name image isPublic user' },
        { path: 'userId', select: 'name email' },
        { path: 'nutritionistId', select: 'name email' }
      ])
      .lean();

    if (!review) {
      throw createHttpError(
        409,
        'Yêu cầu duyệt không còn ở trạng thái có thể nhận'
      );
    }

    return review;
  },

  addComment: async (id: string, userId: string, data: AddCommentRequest) => {
    if (!validateObjectId(id)) {
      throw createHttpError(400, 'Định dạng ID yêu cầu duyệt không hợp lệ');
    }

    const user = await UserModel.findById(userId, 'role name').lean();
    if (!user) {
      throw createHttpError(404, 'Người dùng không tồn tại');
    }

    const review = await ReviewModel.findById(id);
    if (!review) {
      throw createHttpError(404, 'Không tìm thấy yêu cầu duyệt');
    }

    const isOwner = String(review.userId) === userId;
    const isAssignedNutritionist = String(review.nutritionistId) === userId;

    if (!isOwner && !isAssignedNutritionist) {
      throw createHttpError(
        403,
        'Bạn không có quyền bình luận cho luồng duyệt này'
      );
    }

    if (
      review.status !== REVIEW_STATUS.UNDER_REVIEW &&
      review.status !== REVIEW_STATUS.APPROVED
    ) {
      throw createHttpError(
        400,
        'Chỉ có thể bình luận khi yêu cầu duyệt đang được xem xét hoặc đã được duyệt'
      );
    }

    review.comments.push({
      author: {
        _id: userId as any,
        name: user.name
      },
      content: data.content,
      createdAt: new Date()
    } as any);

    await review.save();

    return review
      .populate([
        { path: 'dishId', select: 'name image isPublic user' },
        { path: 'userId', select: 'name email' },
        { path: 'nutritionistId', select: 'name email' }
      ])
      .then(doc => doc.toObject());
  },

  approveReview: async (id: string, userId: string) => {
    if (!validateObjectId(id)) {
      throw createHttpError(400, 'Định dạng ID yêu cầu duyệt không hợp lệ');
    }

    const user = await UserModel.findById(userId, 'role').lean();
    if (!user) {
      throw createHttpError(404, 'Người dùng không tồn tại');
    }

    if (user.role !== ROLE.NUTRITIONIST) {
      throw createHttpError(
        403,
        'Chỉ chuyên gia dinh dưỡng mới có thể phê duyệt yêu cầu'
      );
    }

    const review = await ReviewModel.findById(id);
    if (!review) {
      throw createHttpError(404, 'Không tìm thấy yêu cầu duyệt');
    }

    if (String(review.nutritionistId) !== userId) {
      throw createHttpError(403, 'Bạn không có quyền phê duyệt yêu cầu này');
    }

    if (review.status !== REVIEW_STATUS.UNDER_REVIEW) {
      throw createHttpError(
        400,
        'Chỉ có thể phê duyệt yêu cầu đang được xem xét'
      );
    }

    review.status = REVIEW_STATUS.APPROVED;
    review.reviewedAt = new Date();
    review.rejectionReason = undefined as any;
    await review.save();

    const dish = await DishModel.findById(review.dishId).lean();
    const owner = await UserModel.findById(review.userId).lean();
    if (owner) {
      sendMail({
        to: owner.email,
        subject: 'Món ăn riêng của bạn đã được duyệt',
        template: 'dish-review-approved',
        templateData: {
          name: owner.name,
          dishName: dish?.name || ''
        }
      }).catch(err => {
        console.error('Không thể gửi email duyệt món ăn riêng:', err);
      });
    }

    return review
      .populate([
        { path: 'dishId', select: 'name image isPublic user' },
        { path: 'userId', select: 'name email' },
        { path: 'nutritionistId', select: 'name email' }
      ])
      .then(doc => doc.toObject());
  },

  rejectReview: async (
    id: string,
    userId: string,
    data: RejectReviewRequest
  ) => {
    if (!validateObjectId(id)) {
      throw createHttpError(400, 'Định dạng ID yêu cầu duyệt không hợp lệ');
    }

    const user = await UserModel.findById(userId, 'role').lean();
    if (!user) {
      throw createHttpError(404, 'Người dùng không tồn tại');
    }

    if (user.role !== ROLE.NUTRITIONIST) {
      throw createHttpError(
        403,
        'Chỉ chuyên gia dinh dưỡng mới có thể từ chối yêu cầu'
      );
    }

    const review = await ReviewModel.findById(id);
    if (!review) {
      throw createHttpError(404, 'Không tìm thấy yêu cầu duyệt');
    }

    if (String(review.nutritionistId) !== userId) {
      throw createHttpError(403, 'Bạn không có quyền từ chối yêu cầu này');
    }

    if (review.status !== REVIEW_STATUS.UNDER_REVIEW) {
      throw createHttpError(
        400,
        'Chỉ có thể từ chối yêu cầu đang được xem xét'
      );
    }

    review.status = REVIEW_STATUS.REJECTED;
    review.reviewedAt = new Date();
    review.rejectionReason = data.rejectionReason;
    await review.save();

    const dish = await DishModel.findById(review.dishId).lean();
    const owner = await UserModel.findById(review.userId).lean();
    if (owner) {
      sendMail({
        to: owner.email,
        subject: 'Món ăn riêng của bạn bị từ chối',
        template: 'dish-review-rejected',
        templateData: {
          name: owner.name,
          dishName: dish?.name || '',
          rejectionReason: data.rejectionReason
        }
      }).catch(err => {
        console.error('Không thể gửi email từ chối món ăn riêng:', err);
      });
    }

    return review
      .populate([
        { path: 'dishId', select: 'name image isPublic user' },
        { path: 'userId', select: 'name email' },
        { path: 'nutritionistId', select: 'name email' }
      ])
      .then(doc => doc.toObject());
  }
};
