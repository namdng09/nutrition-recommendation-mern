import { afterEach, describe, expect, it, vi } from 'vitest';

import { ExerciseService } from '~/features/exercises/exercise-service';
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

describe('ExerciseService.viewExerciseDetail (UC110)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should throw 400 when id format invalid', async () => {
    mockValidateObjectId.mockReturnValue(false);

    await expect(
      ExerciseService.viewExerciseDetail('bad-id')
    ).rejects.toMatchObject({
      status: 400,
      message: 'Định dạng ID bài tập không hợp lệ'
    });
  });

  it('should throw 404 when exercise not found', async () => {
    mockValidateObjectId.mockReturnValue(true);
    mockFindById.mockResolvedValue(null);

    await expect(
      ExerciseService.viewExerciseDetail('507f1f77bcf86cd799439011')
    ).rejects.toMatchObject({ status: 404, message: 'Không tìm thấy bài tập' });
  });

  it('should return exercise detail when exists', async () => {
    const exercise = { _id: 'e1', name: 'Push-up' };
    mockValidateObjectId.mockReturnValue(true);
    mockFindById.mockResolvedValue(exercise as any);

    const result = await ExerciseService.viewExerciseDetail(
      '507f1f77bcf86cd799439011'
    );

    expect(result).toEqual(exercise);
  });
});
