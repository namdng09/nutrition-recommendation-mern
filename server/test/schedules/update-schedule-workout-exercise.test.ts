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

describe('ScheduleService.updateScheduleWorkoutExercise', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should update workout exercise successfully', async () => {
    const workoutItem = {
      exerciseId: { toString: () => VALID_EXERCISE_ID },
      logType: WORKOUT_COUNTER_TYPE.DURATION,
      distanceTarget: undefined,
      weightAndRepsTarget: undefined,
      durationTarget: { seconds: 600 },
      isCompleted: false
    };
    const scheduleDoc = {
      user: { _id: { toString: () => VALID_USER_ID } },
      workout: [workoutItem],
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

    const result = await ScheduleService.updateScheduleWorkoutExercise(
      VALID_SCHEDULE_ID,
      VALID_USER_ID,
      VALID_EXERCISE_ID,
      {
        durationTarget: { seconds: 900 },
        isCompleted: true
      } as any
    );

    expect(result.workout[0].durationTarget?.seconds).toBe(900);
    expect(result.workout[0].isCompleted).toBe(true);
    expect(scheduleDoc.save).toHaveBeenCalledOnce();
  });

  it('should throw error when schedule ID is invalid', async () => {
    await expect(
      ScheduleService.updateScheduleWorkoutExercise(
        'invalid-id',
        VALID_USER_ID,
        VALID_EXERCISE_ID,
        { isCompleted: true } as any
      )
    ).rejects.toMatchObject({
      status: 400,
      message: 'Định dạng ID lịch ăn không hợp lệ'
    });
  });

  it('should throw error when exercise ID is invalid', async () => {
    await expect(
      ScheduleService.updateScheduleWorkoutExercise(
        VALID_SCHEDULE_ID,
        VALID_USER_ID,
        'invalid-id',
        { isCompleted: true } as any
      )
    ).rejects.toMatchObject({
      status: 400,
      message: 'Định dạng ID bài tập không hợp lệ'
    });
  });

  it('should throw error when schedule does not exist', async () => {
    mockFindScheduleById.mockResolvedValue(null);

    await expect(
      ScheduleService.updateScheduleWorkoutExercise(
        VALID_SCHEDULE_ID,
        VALID_USER_ID,
        VALID_EXERCISE_ID,
        { isCompleted: true } as any
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
      ScheduleService.updateScheduleWorkoutExercise(
        VALID_SCHEDULE_ID,
        VALID_USER_ID,
        VALID_EXERCISE_ID,
        { isCompleted: true } as any
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
      ScheduleService.updateScheduleWorkoutExercise(
        VALID_SCHEDULE_ID,
        VALID_USER_ID,
        VALID_EXERCISE_ID,
        { isCompleted: true } as any
      )
    ).rejects.toMatchObject({
      status: 404,
      message: 'Không tìm thấy bài tập trong workout'
    });
  });

  it('should throw error when exercise does not exist in database', async () => {
    mockFindScheduleById.mockResolvedValue({
      user: { _id: { toString: () => VALID_USER_ID } },
      workout: [
        {
          exerciseId: { toString: () => VALID_EXERCISE_ID },
          logType: WORKOUT_COUNTER_TYPE.DURATION,
          durationTarget: { seconds: 600 }
        }
      ]
    } as any);
    mockFindExerciseById.mockResolvedValue(null);

    await expect(
      ScheduleService.updateScheduleWorkoutExercise(
        VALID_SCHEDULE_ID,
        VALID_USER_ID,
        VALID_EXERCISE_ID,
        {} as any
      )
    ).rejects.toMatchObject({
      status: 404,
      message: `Không tìm thấy bài tập với ID: ${VALID_EXERCISE_ID}`
    });
  });

  it('should throw error when exercise has no default logType', async () => {
    mockFindScheduleById.mockResolvedValue({
      user: { _id: { toString: () => VALID_USER_ID } },
      workout: [
        {
          exerciseId: { toString: () => VALID_EXERCISE_ID },
          logType: WORKOUT_COUNTER_TYPE.DURATION,
          durationTarget: { seconds: 600 }
        }
      ]
    } as any);
    mockFindExerciseById.mockResolvedValue({
      _id: VALID_EXERCISE_ID,
      name: 'Running',
      type: 'Cardio',
      logType: undefined
    } as any);

    await expect(
      ScheduleService.updateScheduleWorkoutExercise(
        VALID_SCHEDULE_ID,
        VALID_USER_ID,
        VALID_EXERCISE_ID,
        {} as any
      )
    ).rejects.toMatchObject({
      status: 400,
      message: 'Bài tập Running chưa có logType mặc định'
    });
  });

  it('should throw error when existing logType mismatches exercise logType', async () => {
    mockFindScheduleById.mockResolvedValue({
      user: { _id: { toString: () => VALID_USER_ID } },
      workout: [
        {
          exerciseId: { toString: () => VALID_EXERCISE_ID },
          logType: WORKOUT_COUNTER_TYPE.DURATION,
          durationTarget: { seconds: 600 }
        }
      ]
    } as any);
    mockFindExerciseById.mockResolvedValue({
      _id: VALID_EXERCISE_ID,
      name: 'Running',
      type: 'Cardio',
      logType: WORKOUT_COUNTER_TYPE.DISTANCE
    } as any);

    await expect(
      ScheduleService.updateScheduleWorkoutExercise(
        VALID_SCHEDULE_ID,
        VALID_USER_ID,
        VALID_EXERCISE_ID,
        {} as any
      )
    ).rejects.toMatchObject({
      status: 400,
      message: `logType của bài tập Running phải là ${WORKOUT_COUNTER_TYPE.DISTANCE}`
    });
  });

  it('should throw error when distance logType has no distanceTarget', async () => {
    mockFindScheduleById.mockResolvedValue({
      user: { _id: { toString: () => VALID_USER_ID } },
      workout: [
        {
          exerciseId: { toString: () => VALID_EXERCISE_ID },
          logType: WORKOUT_COUNTER_TYPE.DISTANCE
        }
      ]
    } as any);
    mockFindExerciseById.mockResolvedValue({
      _id: VALID_EXERCISE_ID,
      name: 'Running',
      type: 'Cardio',
      logType: WORKOUT_COUNTER_TYPE.DISTANCE
    } as any);

    await expect(
      ScheduleService.updateScheduleWorkoutExercise(
        VALID_SCHEDULE_ID,
        VALID_USER_ID,
        VALID_EXERCISE_ID,
        {} as any
      )
    ).rejects.toMatchObject({
      status: 400,
      message: 'Bài tập Distance cần distanceTarget'
    });
  });

  it('should throw error when distance logType includes other targets', async () => {
    mockFindScheduleById.mockResolvedValue({
      user: { _id: { toString: () => VALID_USER_ID } },
      workout: [
        {
          exerciseId: { toString: () => VALID_EXERCISE_ID },
          logType: WORKOUT_COUNTER_TYPE.DISTANCE,
          durationTarget: { seconds: 30 }
        }
      ]
    } as any);
    mockFindExerciseById.mockResolvedValue({
      _id: VALID_EXERCISE_ID,
      name: 'Running',
      type: 'Cardio',
      logType: WORKOUT_COUNTER_TYPE.DISTANCE
    } as any);

    await expect(
      ScheduleService.updateScheduleWorkoutExercise(
        VALID_SCHEDULE_ID,
        VALID_USER_ID,
        VALID_EXERCISE_ID,
        { distanceTarget: { meters: 100 } } as any
      )
    ).rejects.toMatchObject({
      status: 400,
      message: 'Bài tập Distance chỉ được dùng distanceTarget'
    });
  });
});
