import { afterEach, describe, expect, it, vi } from 'vitest';

import { FeedbackService } from '~/features/feedback/feedback-service';
import { ROLE } from '~/shared/constants/role';
import { FeedbackModel } from '~/shared/database/models';
import { buildPaginateOptions } from '~/shared/utils';

vi.mock('~/shared/database/models', () => ({
  FeedbackModel: {
    paginate: vi.fn()
  },
  UserModel: {
    findById: vi.fn()
  }
}));

vi.mock('~/shared/utils', async importOriginal => {
  const actual = await importOriginal<typeof import('~/shared/utils')>();
  return {
    ...actual,
    buildPaginateOptions: vi.fn(),
    sendMail: vi.fn(),
    validateObjectId: vi.fn()
  };
});

const mockPaginate = vi.mocked(FeedbackModel.paginate);
const mockBuildPaginateOptions = vi.mocked(buildPaginateOptions);

describe('FeedbackService.viewFeedbacks (UC91)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return feedback list successfully', async () => {
    const parsed = { filter: { type: 'Nội dung' }, limit: 10, page: 1 } as any;
    const options = { limit: 10, page: 1 };

    mockBuildPaginateOptions.mockReturnValue(options as any);
    mockPaginate.mockResolvedValue({
      docs: [{ _id: 'fb-1' }],
      totalDocs: 1
    } as any);

    const result = await FeedbackService.viewFeedbacks(parsed);

    expect(mockBuildPaginateOptions).toHaveBeenCalledWith(parsed);
    expect(mockPaginate).toHaveBeenCalledWith(
      {
        type: 'Nội dung',
        'user.role': ROLE.USER
      },
      options
    );
    expect(result.docs).toHaveLength(1);
  });
});
