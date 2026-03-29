import type { QueryOptions } from '@quarks/mongoose-query-parser';
import createHttpError from 'http-errors';
import type { PaginateResult } from 'mongoose';

import { ROLE } from '~/shared/constants/role';
import {
  type Feedback,
  FeedbackModel,
  UserModel
} from '~/shared/database/models';
import {
  buildPaginateOptions,
  sendMail,
  validateObjectId
} from '~/shared/utils';

import type { CreateFeedbackRequest } from './feedback-dto';

export const FeedbackService = {
  createFeedback: async (
    userId: string,
    userName: string,
    userRole: string,
    data: CreateFeedbackRequest
  ) => {
    if (userRole !== ROLE.USER) {
      throw createHttpError(403, 'Chỉ người dùng mới có thể gửi feedback');
    }

    const feedback = await FeedbackModel.create({
      user: {
        _id: userId,
        name: userName,
        role: userRole
      },
      type: data.type,
      content: data.content
    });

    const user = await UserModel.findById(userId, 'email name').lean();
    if (user?.email) {
      sendMail({
        to: user.email,
        subject: 'Cảm ơn bạn đã gửi feedback',
        template: 'feedback-thank-you',
        templateData: {
          name: user.name || userName,
          feedbackType: data.type,
          feedbackContent: data.content
        }
      }).catch(err => {
        console.error('Không thể gửi email cảm ơn feedback:', err);
      });
    }

    return feedback;
  },

  viewFeedbacks: async (
    parsed: QueryOptions
  ): Promise<PaginateResult<Feedback>> => {
    const options = buildPaginateOptions(parsed);
    const filter = {
      ...parsed.filter,
      'user.role': ROLE.USER
    };

    const result = await FeedbackModel.paginate(filter, options);

    return result;
  },

  viewFeedbackDetail: async (id: string) => {
    if (!validateObjectId(id)) {
      throw createHttpError(400, 'ID feedback không hợp lệ');
    }

    const feedback = await FeedbackModel.findOne({
      _id: id,
      'user.role': ROLE.USER
    });

    if (!feedback) {
      throw createHttpError(404, 'Không tìm thấy feedback');
    }

    return feedback;
  }
};
