import { afterEach, describe, expect, it, vi } from 'vitest';

import { ScheduleService } from '~/features/schedules/schedule-service';
import { DAY_OF_WEEK } from '~/shared/constants/day-of-week';
import { ROLE } from '~/shared/constants/role';
import { WORKOUT_COUNTER_TYPE } from '~/shared/constants/workout-counter-type';
import { ExerciseModel, ScheduleModel } from '~/shared/database/models';

vi.mock('~/shared/database/models', () => ({
  ScheduleModel: {
    findById: vi.fn(),
    findByIdAndUpdate: vi.fn()
  },
  ExerciseModel: {
    findById: vi.fn()
  }
}));

const mockFindById = vi.mocked(ScheduleModel.findById);
const mockFindByIdAndUpdate = vi.mocked(ScheduleModel.findByIdAndUpdate);
const mockFindExerciseById = vi.mocked(ExerciseModel.findById);

const VALID_SCHEDULE_ID = '507f1f77bcf86cd799439013';
const VALID_USER_ID = '507f1f77bcf86cd799439011';
const VALID_ADMIN_ID = '507f1f77bcf86cd799439012';
const VALID_EXERCISE_ID = '507f1f77bcf86cd799439022';

describe('ScheduleService.updateSchedule', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should update schedule successfully with valid data', async () => {
    const updateData = {
      date: new Date('2026-02-16'),
      dayOfWeek: DAY_OF_WEEK.TUESDAY,
      notes: 'Updated notes'
    };
    mockFindById.mockResolvedValue({
      _id: VALID_SCHEDULE_ID,
      user: { _id: { toString: () => VALID_USER_ID } }
    } as any);
    mockFindByIdAndUpdate.mockResolvedValue({
      _id: { toString: () => VALID_SCHEDULE_ID },
      ...updateData
    } as any);

    const updatedSchedule = await ScheduleService.updateSchedule(
      VALID_SCHEDULE_ID,
      VALID_USER_ID,
      ROLE.USER,
      updateData as any
    );

    expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(
      VALID_SCHEDULE_ID,
      updateData,
      { new: true }
    );
    expect(updatedSchedule._id.toString()).toBe(VALID_SCHEDULE_ID);
    expect(updatedSchedule.date).toEqual(new Date('2026-02-16'));
    expect(updatedSchedule.dayOfWeek).toBe(DAY_OF_WEEK.TUESDAY);
    expect(updatedSchedule.notes).toBe('Updated notes');
  });

  it('should allow admin to update any schedule', async () => {
    const updateData = {
      notes: 'Admin updated notes'
    };
    mockFindById.mockResolvedValue({
      _id: VALID_SCHEDULE_ID,
      user: { _id: { toString: () => VALID_USER_ID } }
    } as any);
    mockFindByIdAndUpdate.mockResolvedValue({
      notes: 'Admin updated notes'
    } as any);

    const updatedSchedule = await ScheduleService.updateSchedule(
      VALID_SCHEDULE_ID,
      VALID_ADMIN_ID,
      ROLE.ADMIN,
      updateData as any
    );

    expect(updatedSchedule.notes).toBe('Admin updated notes');
  });

  it('should throw error when user tries to update other user schedule', async () => {
    const updateData = {
      notes: 'Updated notes'
    };
    mockFindById.mockResolvedValue({
      user: { _id: { toString: () => VALID_USER_ID } }
    } as any);

    await expect(
      ScheduleService.updateSchedule(
        VALID_SCHEDULE_ID,
        VALID_ADMIN_ID,
        ROLE.USER,
        updateData as any
      )
    ).rejects.toMatchObject({
      status: 403,
      message: 'Bạn không có quyền cập nhật lịch ăn này'
    });
  });

  it('should throw error when schedule ID is invalid', async () => {
    const updateData = {
      notes: 'Updated notes'
    };

    await expect(
      ScheduleService.updateSchedule(
        'invalid-id',
        VALID_USER_ID,
        ROLE.USER,
        updateData as any
      )
    ).rejects.toMatchObject({
      status: 400,
      message: 'Định dạng ID lịch ăn không hợp lệ'
    });
  });

  it('should throw error when schedule does not exist', async () => {
    const updateData = {
      notes: 'Updated notes'
    };
    mockFindById.mockResolvedValue(null);

    await expect(
      ScheduleService.updateSchedule(
        VALID_SCHEDULE_ID,
        VALID_USER_ID,
        ROLE.USER,
        updateData as any
      )
    ).rejects.toMatchObject({
      status: 404,
      message: 'Không tìm thấy lịch ăn'
    });
  });

  it('should throw error when update target missing after permission check', async () => {
    mockFindById.mockResolvedValue({
      _id: VALID_SCHEDULE_ID,
      user: { _id: { toString: () => VALID_USER_ID } }
    } as any);
    mockFindByIdAndUpdate.mockResolvedValue(null);

    await expect(
      ScheduleService.updateSchedule(
        VALID_SCHEDULE_ID,
        VALID_USER_ID,
        ROLE.USER,
        {
          notes: 'Updated notes'
        } as any
      )
    ).rejects.toMatchObject({
      status: 404,
      message: 'Không tìm thấy lịch ăn'
    });
  });
});
