import { afterEach, describe, expect, it, vi } from 'vitest';

import { ScheduleService } from '~/features/schedules/schedule-service';
import { ROLE } from '~/shared/constants/role';
import { ScheduleModel } from '~/shared/database/models';

vi.mock('~/shared/database/models', () => ({
  ScheduleModel: {
    findById: vi.fn(),
    findByIdAndDelete: vi.fn()
  }
}));

const mockFindScheduleById = vi.mocked(ScheduleModel.findById);
const mockFindByIdAndDelete = vi.mocked(ScheduleModel.findByIdAndDelete);

const VALID_SCHEDULE_ID = '507f1f77bcf86cd799439013';
const VALID_USER_ID = '507f1f77bcf86cd799439011';
const VALID_ADMIN_ID = '507f1f77bcf86cd799439012';

describe('ScheduleService.deleteSchedule', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should delete schedule successfully for owner', async () => {
    mockFindScheduleById.mockResolvedValue({
      user: { _id: { toString: () => VALID_USER_ID } }
    } as any);

    await ScheduleService.deleteSchedule(
      VALID_SCHEDULE_ID,
      VALID_USER_ID,
      ROLE.USER
    );

    expect(mockFindByIdAndDelete).toHaveBeenCalledWith(VALID_SCHEDULE_ID);
  });

  it('should allow admin to delete any schedule', async () => {
    mockFindScheduleById.mockResolvedValue({
      user: { _id: { toString: () => VALID_USER_ID } }
    } as any);

    await ScheduleService.deleteSchedule(
      VALID_SCHEDULE_ID,
      VALID_ADMIN_ID,
      ROLE.ADMIN
    );

    expect(mockFindByIdAndDelete).toHaveBeenCalledWith(VALID_SCHEDULE_ID);
  });

  it('should throw error when user tries to delete another user schedule', async () => {
    mockFindScheduleById.mockResolvedValue({
      user: { _id: { toString: () => VALID_USER_ID } }
    } as any);

    await expect(
      ScheduleService.deleteSchedule(
        VALID_SCHEDULE_ID,
        VALID_ADMIN_ID,
        ROLE.USER
      )
    ).rejects.toMatchObject({
      status: 403,
      message: 'Bạn không có quyền xóa lịch ăn này'
    });
  });

  it('should throw error when schedule ID is invalid', async () => {
    await expect(
      ScheduleService.deleteSchedule('invalid-id', VALID_USER_ID, ROLE.USER)
    ).rejects.toMatchObject({
      status: 400,
      message: 'Định dạng ID lịch ăn không hợp lệ'
    });
  });

  it('should throw error when schedule does not exist', async () => {
    mockFindScheduleById.mockResolvedValue(null);

    await expect(
      ScheduleService.deleteSchedule(
        VALID_SCHEDULE_ID,
        VALID_USER_ID,
        ROLE.USER
      )
    ).rejects.toMatchObject({
      status: 404,
      message: 'Không tìm thấy lịch ăn'
    });
  });
});
