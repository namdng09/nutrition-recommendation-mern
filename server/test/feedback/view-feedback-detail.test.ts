import { afterEach, describe, expect, it, vi } from 'vitest';

import { FeedbackService } from '~/features/feedback/feedback-service';
import { ROLE } from '~/shared/constants/role';
import { FeedbackModel } from '~/shared/database/models';
import { validateObjectId } from '~/shared/utils';

vi.mock('~/shared/database/models', () => ({
  FeedbackModel: {
    findOne: vi.fn()
  },
  UserModel: {
    findById: vi.fn()
  }
}));

vi.mock('~/shared/utils', async importOriginal => {
  const actual = await importOriginal<typeof import('~/shared/utils')>();
  return {
    ...actual,
    validateObjectId: vi.fn(),
    sendMail: vi.fn(),
    buildPaginateOptions: vi.fn()
  };
});

const mockFindOne = vi.mocked(FeedbackModel.findOne);
const mockValidateObjectId = vi.mocked(validateObjectId);

const feedbackId = '507f1f77bcf86cd799439011';

describe('FeedbackService.viewFeedbackDetail (UC91)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should throw 400 when feedback id is invalid', async () => {
    mockValidateObjectId.mockReturnValue(false);

    await expect(
      FeedbackService.viewFeedbackDetail('bad-id')
    ).rejects.toMatchObject({
      status: 400,
      message: 'ID feedback không hợp lệ'
    });
  });

  it('should throw 404 when feedback does not exist', async () => {
    mockValidateObjectId.mockReturnValue(true);
    mockFindOne.mockResolvedValue(null);

    await expect(
      FeedbackService.viewFeedbackDetail(feedbackId)
    ).rejects.toMatchObject({
      status: 404,
      message: 'Không tìm thấy feedback'
    });
  });

  it('should return feedback detail when record exists', async () => {
    mockValidateObjectId.mockReturnValue(true);
    mockFindOne.mockResolvedValue({
      _id: feedbackId,
      user: {
        _id: '507f1f77bcf86cd799439012',
        name: 'User A',
        role: ROLE.USER
      },
      type: 'Hệ thống',
      content: 'Ung dung can them bo loc tim kiem feedback'
    } as any);

    const result = await FeedbackService.viewFeedbackDetail(feedbackId);

    expect(mockFindOne).toHaveBeenCalledWith({
      _id: feedbackId,
      'user.role': ROLE.USER
    });
    expect(result._id).toBe(feedbackId);
  });
});
