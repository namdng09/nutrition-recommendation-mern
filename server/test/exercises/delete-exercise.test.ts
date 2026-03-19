import { afterEach, describe, expect, it, vi } from 'vitest';

import { ExerciseService } from '~/features/exercises/exercise-service';
import { EXERCISE_DIFFICULTY } from '~/shared/constants/exercise-difficulty';
import { EXERCISE_TYPE } from '~/shared/constants/exercise-type';
import { WORKOUT_COUNTER_TYPE } from '~/shared/constants/workout-counter-type';
import { ExerciseModel } from '~/shared/database/models';
import { validateObjectId } from '~/shared/utils';

vi.mock('~/shared/database/models', () => ({
  ExerciseModel: {
    findByIdAndDelete: vi.fn()
  }
}));

vi.mock('~/shared/utils', async importOriginal => {
  const actual = await importOriginal<typeof import('~/shared/utils')>();
  return {
    ...actual,
    validateObjectId: vi.fn()
  };
});

const mockFindByIdAndDelete = vi.mocked(ExerciseModel.findByIdAndDelete);
const mockValidateObjectId = vi.mocked(validateObjectId);

const mockExercise = {
  _id: 'abc123',
  name: 'Push-up',
  instructions: 'Lower your body until chest touches floor',
  difficulty: EXERCISE_DIFFICULTY.BEGINNER,
  type: EXERCISE_TYPE.STRENGTH,
  logType: WORKOUT_COUNTER_TYPE.WEIGHT_AND_REPS
};

describe('ExerciseService.deleteExercise', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('business logic', () => {
    it('should throw 400 when id format is invalid', async () => {
      mockValidateObjectId.mockReturnValue(false);

      await expect(
        ExerciseService.deleteExercise('invalid-id')
      ).rejects.toMatchObject({
        status: 400,
        message: 'Định dạng ID bài tập không hợp lệ'
      });

      expect(mockFindByIdAndDelete).not.toHaveBeenCalled();
    });

    it('should throw 404 when exercise does not exist', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFindByIdAndDelete.mockResolvedValue(null);

      await expect(
        ExerciseService.deleteExercise('abc123')
      ).rejects.toMatchObject({
        status: 404,
        message: 'Không tìm thấy bài tập'
      });
    });

    it('should delete exercise successfully', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFindByIdAndDelete.mockResolvedValue(mockExercise as any);

      const result = await ExerciseService.deleteExercise('abc123');

      expect(result).toEqual(mockExercise);
      expect(mockFindByIdAndDelete).toHaveBeenCalledWith('abc123');
    });
  });
});
