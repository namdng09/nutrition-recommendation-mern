import { afterEach, describe, expect, it, vi } from 'vitest';

import { createScheduleRequestSchema } from '~/features/schedules/schedule-dto';
import { ScheduleService } from '~/features/schedules/schedule-service';
import { DAY_OF_WEEK } from '~/shared/constants/day-of-week';
import { WORKOUT_COUNTER_TYPE } from '~/shared/constants/workout-counter-type';
import {
  ExerciseModel,
  ScheduleModel,
  UserModel
} from '~/shared/database/models';

vi.mock('~/shared/database/models', () => ({
  UserModel: {
    findById: vi.fn()
  },
  ScheduleModel: {
    create: vi.fn()
  },
  ExerciseModel: {
    findById: vi.fn()
  }
}));

const mockFindById = vi.mocked(UserModel.findById);
const mockCreate = vi.mocked(ScheduleModel.create);
const mockFindExerciseById = vi.mocked(ExerciseModel.findById);

const VALID_USER_ID = '507f1f77bcf86cd799439011';
const VALID_EXERCISE_ID = '507f1f77bcf86cd799439022';
const USER_NAME = 'Test User';

const validData = {
  date: new Date('2026-02-15'),
  dayOfWeek: DAY_OF_WEEK.MONDAY
};

const mockUser = {
  _id: VALID_USER_ID,
  mealSettings: [{ name: 'Breakfast' }, { name: 'Lunch' }, { name: 'Dinner' }]
};

describe('ScheduleService.createSchedule', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('validation', () => {
    it('should fail when date format is invalid', () => {
      const result = createScheduleRequestSchema.safeParse({
        ...validData,
        date: 'invalid-date'
      });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe(
        'Định dạng ngày không hợp lệ'
      );
    });

    it('should fail when dayOfWeek is invalid', () => {
      const result = createScheduleRequestSchema.safeParse({
        ...validData,
        dayOfWeek: 'invalid-day'
      });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe(
        'Ngày trong tuần không hợp lệ'
      );
    });
  });

  describe('business logic', () => {
    it('should throw 404 when user does not exist', async () => {
      mockFindById.mockResolvedValue(null);

      await expect(
        ScheduleService.createSchedule(
          VALID_USER_ID,
          USER_NAME,
          validData as any
        )
      ).rejects.toMatchObject({
        status: 404,
        message: 'Không tìm thấy người dùng'
      });
    });

    it('should throw 400 when workout has duplicated exercise ids', async () => {
      mockFindById.mockResolvedValue(mockUser as any);

      await expect(
        ScheduleService.createSchedule(VALID_USER_ID, USER_NAME, {
          ...validData,
          workout: [
            {
              exerciseId: VALID_EXERCISE_ID,
              durationTarget: { seconds: 600 }
            },
            {
              exerciseId: VALID_EXERCISE_ID,
              durationTarget: { seconds: 900 }
            }
          ]
        } as any)
      ).rejects.toMatchObject({
        status: 409,
        message: `Bài tập ${VALID_EXERCISE_ID} đã tồn tại trong workout`
      });
    });

    it('should throw 400 when workout exercise id format is invalid', async () => {
      mockFindById.mockResolvedValue(mockUser as any);

      await expect(
        ScheduleService.createSchedule(VALID_USER_ID, USER_NAME, {
          ...validData,
          workout: [
            {
              exerciseId: 'invalid-id',
              durationTarget: { seconds: 600 }
            }
          ]
        } as any)
      ).rejects.toMatchObject({
        status: 400,
        message: 'Định dạng ID bài tập không hợp lệ: invalid-id'
      });
    });

    it('should throw 404 when workout exercise does not exist', async () => {
      mockFindById.mockResolvedValue(mockUser as any);
      mockFindExerciseById.mockResolvedValue(null);

      await expect(
        ScheduleService.createSchedule(VALID_USER_ID, USER_NAME, {
          ...validData,
          workout: [
            {
              exerciseId: VALID_EXERCISE_ID,
              durationTarget: { seconds: 600 }
            }
          ]
        } as any)
      ).rejects.toMatchObject({
        status: 404,
        message: `Không tìm thấy bài tập với ID: ${VALID_EXERCISE_ID}`
      });
    });

    it('should throw 400 when exercise has no default logType', async () => {
      mockFindById.mockResolvedValue(mockUser as any);
      mockFindExerciseById.mockResolvedValue({
        _id: VALID_EXERCISE_ID,
        name: 'Running',
        type: 'Cardio',
        tutorial: 'Run 10 minutes'
      } as any);

      await expect(
        ScheduleService.createSchedule(VALID_USER_ID, USER_NAME, {
          ...validData,
          workout: [
            {
              exerciseId: VALID_EXERCISE_ID,
              durationTarget: { seconds: 600 }
            }
          ]
        } as any)
      ).rejects.toMatchObject({
        status: 400,
        message: 'Bài tập Running chưa có logType mặc định'
      });
    });

    it('should throw 400 when provided logType mismatches exercise logType', async () => {
      mockFindById.mockResolvedValue(mockUser as any);
      mockFindExerciseById.mockResolvedValue({
        _id: VALID_EXERCISE_ID,
        name: 'Running',
        type: 'Cardio',
        tutorial: 'Run 10 minutes',
        logType: WORKOUT_COUNTER_TYPE.DURATION
      } as any);

      await expect(
        ScheduleService.createSchedule(VALID_USER_ID, USER_NAME, {
          ...validData,
          workout: [
            {
              exerciseId: VALID_EXERCISE_ID,
              logType: WORKOUT_COUNTER_TYPE.DISTANCE,
              distanceTarget: { meters: 1000 }
            }
          ]
        } as any)
      ).rejects.toMatchObject({
        status: 400,
        message: `logType của bài tập Running phải là ${WORKOUT_COUNTER_TYPE.DURATION}`
      });
    });

    it('should throw 400 when distance logType missing distanceTarget', async () => {
      mockFindById.mockResolvedValue(mockUser as any);
      mockFindExerciseById.mockResolvedValue({
        _id: VALID_EXERCISE_ID,
        name: 'Running',
        type: 'Cardio',
        tutorial: 'Run 10 minutes',
        logType: WORKOUT_COUNTER_TYPE.DISTANCE
      } as any);

      await expect(
        ScheduleService.createSchedule(VALID_USER_ID, USER_NAME, {
          ...validData,
          workout: [
            {
              exerciseId: VALID_EXERCISE_ID
            }
          ]
        } as any)
      ).rejects.toMatchObject({
        status: 400,
        message: 'Bài tập Distance cần distanceTarget'
      });
    });

    it('should throw 400 when distance logType includes invalid targets', async () => {
      mockFindById.mockResolvedValue(mockUser as any);
      mockFindExerciseById.mockResolvedValue({
        _id: VALID_EXERCISE_ID,
        name: 'Running',
        type: 'Cardio',
        tutorial: 'Run 10 minutes',
        logType: WORKOUT_COUNTER_TYPE.DISTANCE
      } as any);

      await expect(
        ScheduleService.createSchedule(VALID_USER_ID, USER_NAME, {
          ...validData,
          workout: [
            {
              exerciseId: VALID_EXERCISE_ID,
              distanceTarget: { meters: 1000 },
              durationTarget: { seconds: 600 }
            }
          ]
        } as any)
      ).rejects.toMatchObject({
        status: 400,
        message: 'Bài tập Distance chỉ được dùng distanceTarget'
      });
    });

    it('should create schedule successfully', async () => {
      const mockSchedule = {
        _id: { toString: () => 'schedule456' },
        workout: [
          {
            exerciseId: VALID_EXERCISE_ID,
            exerciseName: 'Running'
          }
        ]
      };

      mockFindById.mockResolvedValue(mockUser as any);
      mockFindExerciseById.mockResolvedValue({
        _id: VALID_EXERCISE_ID,
        name: 'Running',
        type: 'Cardio',
        tutorial: 'Run 10 minutes',
        logType: WORKOUT_COUNTER_TYPE.DURATION
      } as any);
      mockCreate.mockResolvedValue(mockSchedule as any);

      const result = await ScheduleService.createSchedule(
        VALID_USER_ID,
        USER_NAME,
        {
          ...validData,
          workout: [
            {
              exerciseId: VALID_EXERCISE_ID,
              durationTarget: { seconds: 600 }
            }
          ]
        } as any
      );

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          workout: [
            expect.objectContaining({
              exerciseId: VALID_EXERCISE_ID,
              exerciseName: 'Running',
              logType: WORKOUT_COUNTER_TYPE.DURATION,
              durationTarget: { seconds: 600 }
            })
          ]
        })
      );
      expect(result).toEqual(mockSchedule);
    });
  });
});
