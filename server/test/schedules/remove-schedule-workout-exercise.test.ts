import { afterEach, describe, expect, it, vi } from 'vitest';

import { ScheduleService } from '~/features/schedules/schedule-service';
import { ScheduleModel } from '~/shared/database/models';

vi.mock('~/shared/database/models', () => ({
  ScheduleModel: {
    findById: vi.fn()
  }
}));

const mockFindScheduleById = vi.mocked(ScheduleModel.findById);

const VALID_SCHEDULE_ID = '507f1f77bcf86cd799439013';
const VALID_USER_ID = '507f1f77bcf86cd799439011';
const VALID_EXERCISE_ID = '507f1f77bcf86cd799439022';

describe('ScheduleService.removeScheduleWorkoutExercise', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should remove workout exercise successfully', async () => {
    const scheduleDoc = {
      user: { _id: { toString: () => VALID_USER_ID } },
      workout: [
        {
          exerciseId: { toString: () => VALID_EXERCISE_ID },
          exerciseName: 'Running'
        },
        {
          exerciseId: { toString: () => '507f1f77bcf86cd799439099' },
          exerciseName: 'Push up'
        }
      ],
      save: vi.fn()
    };
    mockFindScheduleById.mockResolvedValue(scheduleDoc as any);

    const updated = await ScheduleService.removeScheduleWorkoutExercise(
      VALID_SCHEDULE_ID,
      VALID_USER_ID,
      VALID_EXERCISE_ID
    );

    expect(updated.workout.length).toBe(1);
    expect(updated.workout[0]?.exerciseName).toBe('Push up');
    expect(scheduleDoc.save).toHaveBeenCalledOnce();
  });

  it('should throw error when schedule ID is invalid', async () => {
    await expect(
      ScheduleService.removeScheduleWorkoutExercise(
        'invalid-id',
        VALID_USER_ID,
        VALID_EXERCISE_ID
      )
    ).rejects.toMatchObject({
      status: 400,
      message: 'Định dạng ID lịch ăn không hợp lệ'
    });
  });

  it('should throw error when exercise ID is invalid', async () => {
    await expect(
      ScheduleService.removeScheduleWorkoutExercise(
        VALID_SCHEDULE_ID,
        VALID_USER_ID,
        'invalid-id'
      )
    ).rejects.toMatchObject({
      status: 400,
      message: 'Định dạng ID bài tập không hợp lệ'
    });
  });

  it('should throw error when schedule does not exist', async () => {
    mockFindScheduleById.mockResolvedValue(null);

    await expect(
      ScheduleService.removeScheduleWorkoutExercise(
        VALID_SCHEDULE_ID,
        VALID_USER_ID,
        VALID_EXERCISE_ID
      )
    ).rejects.toMatchObject({
      status: 404,
      message: 'Không tìm thấy lịch ăn'
    });
  });

  it('should throw error when user updates another user schedule', async () => {
    mockFindScheduleById.mockResolvedValue({
      user: { _id: { toString: () => '507f1f77bcf86cd799439099' } },
      workout: []
    } as any);

    await expect(
      ScheduleService.removeScheduleWorkoutExercise(
        VALID_SCHEDULE_ID,
        VALID_USER_ID,
        VALID_EXERCISE_ID
      )
    ).rejects.toMatchObject({
      status: 403,
      message: 'Bạn không có quyền cập nhật lịch ăn này'
    });
  });

  it('should throw error when exercise not in workout', async () => {
    mockFindScheduleById.mockResolvedValue({
      user: { _id: { toString: () => VALID_USER_ID } },
      workout: []
    } as any);

    await expect(
      ScheduleService.removeScheduleWorkoutExercise(
        VALID_SCHEDULE_ID,
        VALID_USER_ID,
        VALID_EXERCISE_ID
      )
    ).rejects.toMatchObject({
      status: 404,
      message: 'Không tìm thấy bài tập trong workout'
    });
  });
});
