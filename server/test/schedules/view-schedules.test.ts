import { afterEach, describe, expect, it, vi } from 'vitest';

import { ScheduleService } from '~/features/schedules/schedule-service';
import { ROLE } from '~/shared/constants/role';
import { ScheduleModel } from '~/shared/database/models';

vi.mock('~/shared/database/models', () => ({
  ScheduleModel: {
    paginate: vi.fn()
  }
}));

const mockPaginate = vi.mocked(ScheduleModel.paginate);

const VALID_USER_ID = '507f1f77bcf86cd799439011';

describe('ScheduleService.viewSchedules', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return only user own schedules when role is user', async () => {
    const parsed = {
      filter: { dayOfWeek: 'monday' },
      sort: { date: 1 } as any,
      limit: 10,
      page: 1
    } as any;
    const mockedResult = {
      docs: [{ user: { _id: VALID_USER_ID } }],
      totalDocs: 1
    };
    mockPaginate.mockResolvedValue(mockedResult as any);

    const result = await ScheduleService.viewSchedules(
      VALID_USER_ID,
      ROLE.USER,
      parsed
    );

    expect(mockPaginate).toHaveBeenCalledWith(
      {
        dayOfWeek: 'monday',
        'user._id': VALID_USER_ID
      },
      expect.objectContaining({
        sort: { date: 1 },
        limit: 10,
        page: 1
      })
    );
    expect(result).toEqual(mockedResult);
  });

  it('should return all schedules when role is admin', async () => {
    const parsed = {
      filter: { dayOfWeek: 'monday' },
      sort: { date: 1 } as any,
      limit: 100,
      page: 1
    } as any;
    const mockedResult = {
      docs: [{ user: { _id: VALID_USER_ID } }, { user: { _id: 'other' } }],
      totalDocs: 2
    };
    mockPaginate.mockResolvedValue(mockedResult as any);

    const result = await ScheduleService.viewSchedules(
      VALID_USER_ID,
      ROLE.ADMIN,
      parsed
    );

    expect(mockPaginate).toHaveBeenCalledWith(
      { dayOfWeek: 'monday' },
      expect.any(Object)
    );
    expect(result).toEqual(mockedResult);
  });

  it('should throw error when user ID is invalid', async () => {
    const parsed = {
      filter: {},
      sort: { date: 1 } as any,
      limit: 10,
      page: 1
    } as any;

    await expect(
      ScheduleService.viewSchedules('invalid-id', ROLE.USER, parsed)
    ).rejects.toMatchObject({
      status: 400,
      message: 'Định dạng ID người dùng không hợp lệ'
    });
  });
});
