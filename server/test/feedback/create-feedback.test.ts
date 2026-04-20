import { afterEach, describe, expect, it, vi } from 'vitest';

import { createFeedbackRequestSchema } from '~/features/feedback/feedback-dto';
import { FeedbackService } from '~/features/feedback/feedback-service';
import { FEEDBACK_TYPE } from '~/shared/constants/feedback-type';
import { ROLE } from '~/shared/constants/role';
import { FeedbackModel, UserModel } from '~/shared/database/models';
import { sendMail } from '~/shared/utils';

vi.mock('~/shared/database/models', () => ({
  FeedbackModel: {
    create: vi.fn()
  },
  UserModel: {
    findById: vi.fn()
  }
}));

vi.mock('~/shared/utils', async importOriginal => {
  const actual = await importOriginal<typeof import('~/shared/utils')>();
  return {
    ...actual,
    sendMail: vi.fn()
  };
});

const mockCreateFeedback = vi.mocked(FeedbackModel.create);
const mockFindUser = vi.mocked(UserModel.findById);
const mockSendMail = vi.mocked(sendMail);

const userId = '507f1f77bcf86cd799439011';
const userName = 'Test User';

const validData = {
  type: FEEDBACK_TYPE.SYSTEM,
  content: 'Ung dung rat huu ich cho viec theo doi dinh duong'
};

describe('FeedbackService.createFeedback (UC90)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('validation', () => {
    it('should fail when feedback type is invalid', () => {
      const result = createFeedbackRequestSchema.safeParse({
        ...validData,
        type: 'INVALID_TYPE'
      });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe(
        'Loại feedback không hợp lệ'
      );
    });

    it('should fail when feedback content is shorter than 2 characters', () => {
      const result = createFeedbackRequestSchema.safeParse({
        ...validData,
        content: 'a'
      });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe(
        'Nội dung feedback phải có ít nhất 2 ký tự'
      );
    });
  });

  describe('business logic', () => {
    it('should throw 403 when actor is not user role', async () => {
      await expect(
        FeedbackService.createFeedback(userId, userName, ROLE.ADMIN, validData)
      ).rejects.toMatchObject({
        status: 403,
        message: 'Chỉ người dùng mới có thể gửi feedback'
      });
    });

    it('should create feedback and skip mail when user email not found', async () => {
      const createdFeedback = {
        _id: 'feedback-1',
        user: { _id: userId, name: userName, role: ROLE.USER },
        ...validData
      };

      mockCreateFeedback.mockResolvedValue(createdFeedback as any);
      mockFindUser.mockReturnValue({
        lean: vi.fn().mockResolvedValue(null)
      } as any);

      const result = await FeedbackService.createFeedback(
        userId,
        userName,
        ROLE.USER,
        validData
      );

      expect(mockCreateFeedback).toHaveBeenCalledWith({
        user: {
          _id: userId,
          name: userName,
          role: ROLE.USER
        },
        type: validData.type,
        content: validData.content
      });
      expect(mockSendMail).not.toHaveBeenCalled();
      expect(result._id).toBe('feedback-1');
    });

    it('should create feedback and send thank-you email when user email exists', async () => {
      const createdFeedback = {
        _id: 'feedback-2',
        user: { _id: userId, name: userName, role: ROLE.USER },
        ...validData
      };

      mockCreateFeedback.mockResolvedValue(createdFeedback as any);
      mockFindUser.mockReturnValue({
        lean: vi.fn().mockResolvedValue({
          email: 'user@test.com',
          name: 'Nguyen Van A'
        })
      } as any);
      mockSendMail.mockResolvedValue({} as any);

      const result = await FeedbackService.createFeedback(
        userId,
        userName,
        ROLE.USER,
        validData
      );

      expect(mockSendMail).toHaveBeenCalledWith({
        to: 'user@test.com',
        subject: 'Cảm ơn bạn đã gửi feedback',
        template: 'feedback-thank-you',
        templateData: {
          name: 'Nguyen Van A',
          feedbackType: validData.type,
          feedbackContent: validData.content
        }
      });
      expect(result._id).toBe('feedback-2');
    });
  });
});
