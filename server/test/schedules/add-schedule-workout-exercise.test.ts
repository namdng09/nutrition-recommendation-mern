import { afterEach, describe, expect, it, vi } from 'vitest';

import { ScheduleService } from '~/features/schedules/schedule-service';
import { WORKOUT_COUNTER_TYPE } from '~/shared/constants/workout-counter-type';
import { ExerciseModel, ScheduleModel } from '~/shared/database/models';

vi.mock('~/shared/database/models', () => ({
  ScheduleModel: {
    findById: vi.fn()
  },
  ExerciseModel: {
    findById: vi.fn()
  }
}));

const mockFindScheduleById = vi.mocked(ScheduleModel.findById);
const mockFindExerciseById = vi.mocked(ExerciseModel.findById);

const VALID_SCHEDULE_ID = '507f1f77bcf86cd799439013';
const VALID_USER_ID = '507f1f77bcf86cd799439011';
const VALID_EXERCISE_ID = '507f1f77bcf86cd799439022';

describe('ScheduleService.addScheduleWorkoutExercise', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should add workout exercise successfully', async () => {
    const scheduleDoc = {
      user: { _id: { toString: () => VALID_USER_ID } },
      workout: [] as any[],
      save: vi.fn()
    };
    mockFindScheduleById.mockResolvedValue(scheduleDoc as any);
    mockFindExerciseById.mockResolvedValue({
      _id: VALID_EXERCISE_ID,
      name: 'Running',
      type: 'Cardio',
      tutorial: 'Run 10 min',
      logType: WORKOUT_COUNTER_TYPE.DURATION
    } as any);

    const result = await ScheduleService.addScheduleWorkoutExercise(
      VALID_SCHEDULE_ID,
      VALID_USER_ID,
      {
        exerciseId: VALID_EXERCISE_ID,
        durationTarget: { seconds: 600 }
      } as any
    );

    expect(result.workout.length).toBe(1);
    expect(result.workout[0].exerciseName).toBe('Running');
    expect(result.workout[0].logType).toBe(WORKOUT_COUNTER_TYPE.DURATION);
    expect(scheduleDoc.save).toHaveBeenCalledOnce();
  });

  it('should throw error when schedule ID is invalid', async () => {
    await expect(
      ScheduleService.addScheduleWorkoutExercise('invalid-id', VALID_USER_ID, {
        exerciseId: VALID_EXERCISE_ID,
        durationTarget: { seconds: 600 }
      } as any)
    ).rejects.toMatchObject({
      status: 400,
      message: 'Định dạng ID lịch ăn không hợp lệ'
    });
  });

  it('should throw error when schedule does not exist', async () => {
    mockFindScheduleById.mockResolvedValue(null);

    await expect(
      ScheduleService.addScheduleWorkoutExercise(
        VALID_SCHEDULE_ID,
        VALID_USER_ID,
        {
          exerciseId: VALID_EXERCISE_ID,
          durationTarget: { seconds: 600 }
        } as any
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
      ScheduleService.addScheduleWorkoutExercise(
        VALID_SCHEDULE_ID,
        VALID_USER_ID,
        {
          exerciseId: VALID_EXERCISE_ID,
          durationTarget: { seconds: 600 }
        } as any
      )
    ).rejects.toMatchObject({
      status: 403,
      message: 'Bạn không có quyền cập nhật lịch ăn này'
    });
  });

  it('should throw error when exercise already exists in workout', async () => {
    mockFindScheduleById.mockResolvedValue({
      user: { _id: { toString: () => VALID_USER_ID } },
      workout: [{ exerciseId: { toString: () => VALID_EXERCISE_ID } }]
    } as any);

    await expect(
      ScheduleService.addScheduleWorkoutExercise(
        VALID_SCHEDULE_ID,
        VALID_USER_ID,
        {
          exerciseId: VALID_EXERCISE_ID,
          durationTarget: { seconds: 600 }
        } as any
      )
    ).rejects.toMatchObject({
      status: 409,
      message: 'Bài tập đã tồn tại trong workout'
    });
  });

  it('should throw error when exercise ID format is invalid', async () => {
    mockFindScheduleById.mockResolvedValue({
      user: { _id: { toString: () => VALID_USER_ID } },
      workout: []
    } as any);

    await expect(
      ScheduleService.addScheduleWorkoutExercise(
        VALID_SCHEDULE_ID,
        VALID_USER_ID,
        {
          exerciseId: 'invalid-id',
          durationTarget: { seconds: 600 }
        } as any
      )
    ).rejects.toMatchObject({
      status: 400,
      message: 'Định dạng ID bài tập không hợp lệ: invalid-id'
    });
  });

  it('should throw error when exercise does not exist', async () => {
    mockFindScheduleById.mockResolvedValue({
      user: { _id: { toString: () => VALID_USER_ID } },
      workout: []
    } as any);
    mockFindExerciseById.mockResolvedValue(null);

    await expect(
      ScheduleService.addScheduleWorkoutExercise(
        VALID_SCHEDULE_ID,
        VALID_USER_ID,
        {
          exerciseId: VALID_EXERCISE_ID,
          durationTarget: { seconds: 600 }
        } as any
      )
    ).rejects.toMatchObject({
      status: 404,
      message: `Không tìm thấy bài tập với ID: ${VALID_EXERCISE_ID}`
    });
  });
});
