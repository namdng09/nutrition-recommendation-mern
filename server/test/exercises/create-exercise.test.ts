import { afterEach, describe, expect, it, vi } from 'vitest';

import { createExerciseRequestSchema } from '~/features/exercises/exercise-dto';
import { ExerciseService } from '~/features/exercises/exercise-service';
import { EXERCISE_DIFFICULTY } from '~/shared/constants/exercise-difficulty';
import { EXERCISE_TYPE } from '~/shared/constants/exercise-type';
import { WORKOUT_COUNTER_TYPE } from '~/shared/constants/workout-counter-type';
import { ExerciseModel } from '~/shared/database/models';
import { deleteExerciseTutorial, uploadExerciseTutorial } from '~/shared/utils';

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
    deleteExerciseTutorial: vi.fn(),
    validateObjectId: vi.fn()
  };
});

const mockFindOne = vi.mocked(ExerciseModel.findOne);
const mockCreate = vi.mocked(ExerciseModel.create);
const mockUploadTutorial = vi.mocked(uploadExerciseTutorial);
const mockDeleteTutorial = vi.mocked(deleteExerciseTutorial);

const validData = {
  name: 'Push-up',
  instructions: 'Keep body straight and push from floor',
  difficulty: EXERCISE_DIFFICULTY.BEGINNER,
  type: EXERCISE_TYPE.STRENGTH,
  logType: WORKOUT_COUNTER_TYPE.WEIGHT_AND_REPS
};

describe('ExerciseService.createExercise (UC108)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('validation', () => {
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

    it('should fail when type is invalid', () => {
      const result = createExerciseRequestSchema.safeParse({
        ...validData,
        type: 'bad-type'
      });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe('Loại bài tập không hợp lệ');
    });

    it('should fail when difficulty is invalid', () => {
      const result = createExerciseRequestSchema.safeParse({
        ...validData,
        difficulty: 'bad-difficulty'
      });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe('Độ khó không hợp lệ');
    });
  });

  describe('business logic', () => {
    it('should throw 409 when exercise name already exists', async () => {
      mockFindOne.mockResolvedValue({ _id: 'exercise-1' } as any);

      await expect(
        ExerciseService.createExercise(validData)
      ).rejects.toMatchObject({
        status: 409,
        message: 'Bài tập với tên này đã tồn tại'
      });
    });

    it('should create exercise and upload tutorial', async () => {
      const mockSave = vi.fn();
      const exerciseId = 'exercise-2';
      const exercise = {
        _id: { toString: () => exerciseId },
        ...validData,
        tutorial: '',
        save: mockSave
      };

      mockFindOne.mockResolvedValue(null);
      mockCreate.mockResolvedValue(exercise as any);
      mockUploadTutorial.mockResolvedValue({
        success: true,
        data: {
          secure_url:
            'https://res.cloudinary.com/test/image/upload/v1234567890/tutorial.jpg'
        }
      } as any);

      await ExerciseService.createExercise(validData, {
        buffer: Buffer.from('tutorial')
      } as Express.Multer.File);

      expect(mockDeleteTutorial).toHaveBeenCalledWith(exerciseId);
      expect(mockUploadTutorial).toHaveBeenCalledWith(
        expect.any(Buffer),
        exerciseId
      );
      expect(exercise.tutorial).toBe(
        'https://res.cloudinary.com/test/image/upload/v1234567890/tutorial.jpg'
      );
      expect(mockSave).toHaveBeenCalled();
    });
  });
});
