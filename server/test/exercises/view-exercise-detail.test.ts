import { afterEach, describe, expect, it, vi } from 'vitest';

import { ExerciseService } from '~/features/exercises/exercise-service';
import { EXERCISE_DIFFICULTY } from '~/shared/constants/exercise-difficulty';
import { EXERCISE_TYPE } from '~/shared/constants/exercise-type';
import { WORKOUT_COUNTER_TYPE } from '~/shared/constants/workout-counter-type';
import { ExerciseModel } from '~/shared/database/models';
import { validateObjectId } from '~/shared/utils';

vi.mock('~/shared/database/models', () => ({
  ExerciseModel: {
    findById: vi.fn()
  }
}));

vi.mock('~/shared/utils', async importOriginal => {
  const actual = await importOriginal<typeof import('~/shared/utils')>();
  return {
    ...actual,
    validateObjectId: vi.fn()
  };
});

const mockFindById = vi.mocked(ExerciseModel.findById);
const mockValidateObjectId = vi.mocked(validateObjectId);

const mockExercise = {
  _id: 'abc123',
  name: 'Push-up',
  instructions: 'Lower your body until chest touches floor',
  difficulty: EXERCISE_DIFFICULTY.BEGINNER,
  type: EXERCISE_TYPE.STRENGTH,
  logType: WORKOUT_COUNTER_TYPE.WEIGHT_AND_REPS
};

describe('ExerciseService.viewExerciseDetail', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('business logic', () => {
    it('should throw 400 when id format is invalid', async () => {
      mockValidateObjectId.mockReturnValue(false);

      await expect(
        ExerciseService.viewExerciseDetail('invalid-id')
      ).rejects.toMatchObject({
        status: 400,
        message: 'Định dạng ID bài tập không hợp lệ'
      });

      expect(mockFindById).not.toHaveBeenCalled();
    });

    it('should throw 404 when exercise does not exist', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFindById.mockResolvedValue(null);

      await expect(
        ExerciseService.viewExerciseDetail('abc123')
      ).rejects.toMatchObject({
        status: 404,
        message: 'Không tìm thấy bài tập'
      });
    });

    it('should return exercise detail successfully', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFindById.mockResolvedValue(mockExercise as any);

      const result = await ExerciseService.viewExerciseDetail('abc123');

      expect(result).toEqual(mockExercise);
      expect(mockFindById).toHaveBeenCalledWith('abc123');
    });
  });
});
