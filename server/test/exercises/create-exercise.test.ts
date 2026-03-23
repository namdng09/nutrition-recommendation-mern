import { afterEach, describe, expect, it, vi } from 'vitest';

import { createExerciseRequestSchema } from '~/features/exercises/exercise-dto';
import { ExerciseService } from '~/features/exercises/exercise-service';
import { EXERCISE_DIFFICULTY } from '~/shared/constants/exercise-difficulty';
import { EXERCISE_TYPE } from '~/shared/constants/exercise-type';
import { WORKOUT_COUNTER_TYPE } from '~/shared/constants/workout-counter-type';
import { ExerciseModel } from '~/shared/database/models';
import { uploadExerciseTutorial } from '~/shared/utils';

vi.mock('~/shared/database/models', () => ({
  ExerciseModel: {
    findOne: vi.fn(),
    create: vi.fn()
  }
}));

vi.mock('~/shared/utils', async importOriginal => {
  const actual = await importOriginal<typeof import('~/shared/utils')>();
  return {
    ...actual,
    uploadExerciseTutorial: vi.fn(),
    deleteExerciseTutorial: vi.fn()
  };
});

const mockFindOne = vi.mocked(ExerciseModel.findOne);
const mockCreate = vi.mocked(ExerciseModel.create);
const mockUploadExerciseTutorial = vi.mocked(uploadExerciseTutorial);

const validData = {
  name: 'Push-up',
  instructions: 'Lower your body until chest touches floor',
  difficulty: EXERCISE_DIFFICULTY.BEGINNER,
  type: EXERCISE_TYPE.STRENGTH,
  logType: WORKOUT_COUNTER_TYPE.WEIGHT_AND_REPS
};

describe('ExerciseService.createExercise', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('validation', () => {
    // Tests DTO schema directly — no service, no DB involved

    it('should fail when name is missing', () => {
      const { name: _, ...data } = validData;
      const result = createExerciseRequestSchema.safeParse(data);

      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe('Tên bài tập không hợp lệ');
    });

    it('should fail when name is too short', () => {
      const result = createExerciseRequestSchema.safeParse({
        ...validData,
        name: 'A'
      });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe(
        'Tên bài tập phải có ít nhất 2 ký tự'
      );
    });

    it('should fail when name is not a string', () => {
      const result = createExerciseRequestSchema.safeParse({
        ...validData,
        name: 1234
      });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe('Tên bài tập không hợp lệ');
    });
  });

  describe('business logic', () => {
    it('should throw 409 when exercise name already exists', async () => {
      mockFindOne.mockResolvedValue({ name: validData.name } as any);

      await expect(
        ExerciseService.createExercise(validData)
      ).rejects.toMatchObject({
        status: 409,
        message: 'Bài tập với tên này đã tồn tại'
      });
    });

    it('should create exercise successfully with tutorial', async () => {
      const mockSave = vi.fn();
      const mockExercise = {
        _id: { toString: () => 'abc123' },
        ...validData,
        tutorial: '',
        save: mockSave
      };

      mockFindOne.mockResolvedValue(null);
      mockCreate.mockResolvedValue(mockExercise as any);
      mockUploadExerciseTutorial.mockResolvedValue({
        success: true,
        data: {
          secure_url:
            'https://res.cloudinary.com/test/video/upload/v1234567890/test-tutorial.mp4'
        }
      } as any);

      const fakeTutorial = {
        buffer: Buffer.from('fake-video-data')
      } as Express.Multer.File;

      const result = await ExerciseService.createExercise(
        validData,
        fakeTutorial
      );

      expect(mockExercise.tutorial).toBe(
        'https://res.cloudinary.com/test/video/upload/v1234567890/test-tutorial.mp4'
      );
      expect(mockSave).toHaveBeenCalled();
      expect(result).toEqual(mockExercise);
    });
  });

  describe('system', () => {
    it('should throw 500 when tutorial upload fails', async () => {
      mockFindOne.mockResolvedValue(null);
      mockCreate.mockResolvedValue({
        _id: { toString: () => 'abc123' },
        ...validData,
        save: vi.fn()
      } as any);
      mockUploadExerciseTutorial.mockResolvedValue({
        success: false,
        data: null
      } as any);

      const fakeTutorial = {
        buffer: Buffer.from('fake-video-data')
      } as Express.Multer.File;

      await expect(
        ExerciseService.createExercise(validData, fakeTutorial)
      ).rejects.toMatchObject({
        status: 500,
        message: 'Không thể tải lên ảnh hướng dẫn bài tập'
      });
    });
  });
});
