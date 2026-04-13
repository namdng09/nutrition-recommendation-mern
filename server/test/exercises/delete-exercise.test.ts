import { afterEach, describe, expect, it, vi } from 'vitest';

import { ExerciseService } from '~/features/exercises/exercise-service';
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

describe('ExerciseService.deleteExercise (UC112)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should throw 400 when id invalid', async () => {
    mockValidateObjectId.mockReturnValue(false);

    await expect(
      ExerciseService.deleteExercise('bad-id')
    ).rejects.toMatchObject({
      status: 400,
      message: 'Định dạng ID bài tập không hợp lệ'
    });
  });

  it('should throw 404 when exercise not found', async () => {
    mockValidateObjectId.mockReturnValue(true);
    mockFindByIdAndDelete.mockResolvedValue(null);

    await expect(
      ExerciseService.deleteExercise('507f1f77bcf86cd799439011')
    ).rejects.toMatchObject({ status: 404, message: 'Không tìm thấy bài tập' });
  });

  it('should delete exercise successfully', async () => {
    mockValidateObjectId.mockReturnValue(true);
    mockFindByIdAndDelete.mockResolvedValue({
      _id: { toString: () => 'exercise-1' }
    } as any);

    const result = await ExerciseService.deleteExercise(
      '507f1f77bcf86cd799439011'
    );

    expect(result._id.toString()).toBe('exercise-1');
  });
});
