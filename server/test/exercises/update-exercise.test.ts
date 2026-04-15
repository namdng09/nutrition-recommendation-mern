import { afterEach, describe, expect, it, vi } from 'vitest';

import { updateExerciseRequestSchema } from '~/features/exercises/exercise-dto';
import { ExerciseService } from '~/features/exercises/exercise-service';
import { ExerciseModel } from '~/shared/database/models';
import {
  deleteExerciseTutorial,
  uploadExerciseTutorial,
  validateObjectId
} from '~/shared/utils';

vi.mock('~/shared/database/models', () => ({
  ExerciseModel: {
    findOne: vi.fn(),
    findByIdAndUpdate: vi.fn()
  }
}));

vi.mock('~/shared/utils', async importOriginal => {
  const actual = await importOriginal<typeof import('~/shared/utils')>();
  return {
    ...actual,
    validateObjectId: vi.fn(),
    uploadExerciseTutorial: vi.fn(),
    deleteExerciseTutorial: vi.fn()
  };
});

const mockFindOne = vi.mocked(ExerciseModel.findOne);
const mockFindByIdAndUpdate = vi.mocked(ExerciseModel.findByIdAndUpdate);
const mockValidateObjectId = vi.mocked(validateObjectId);
const mockUploadTutorial = vi.mocked(uploadExerciseTutorial);
const mockDeleteTutorial = vi.mocked(deleteExerciseTutorial);

const exerciseId = '507f1f77bcf86cd799439011';
const validData = { name: 'Diamond Push-up', instructions: 'Updated' };

describe('ExerciseService.updateExercise (UC111)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('validation', () => {
    it('should fail when name too short', () => {
      const result = updateExerciseRequestSchema.safeParse({ name: 'A' });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe(
        'Tên bài tập phải có ít nhất 2 ký tự'
      );
    });
  });

  describe('business logic', () => {
    it('should throw 400 when id invalid', async () => {
      mockValidateObjectId.mockReturnValue(false);

      await expect(
        ExerciseService.updateExercise('bad-id', validData)
      ).rejects.toMatchObject({
        status: 400,
        message: 'Định dạng ID bài tập không hợp lệ'
      });
    });

    it('should throw 409 when updating to duplicate name', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFindOne.mockResolvedValue({ _id: 'other' } as any);

      await expect(
        ExerciseService.updateExercise(exerciseId, { name: 'Push-up' })
      ).rejects.toMatchObject({
        status: 409,
        message: 'Bài tập với tên này đã tồn tại'
      });
    });

    it('should throw 404 when exercise not found', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFindOne.mockResolvedValue(null);
      mockFindByIdAndUpdate.mockResolvedValue(null);

      await expect(
        ExerciseService.updateExercise(exerciseId, validData)
      ).rejects.toMatchObject({
        status: 404,
        message: 'Không tìm thấy bài tập'
      });
    });

    it('should update exercise and tutorial successfully', async () => {
      const mockSave = vi.fn();
      const exercise = {
        _id: { toString: () => exerciseId },
        ...validData,
        tutorial: '',
        save: mockSave
      };

      mockValidateObjectId.mockReturnValue(true);
      mockFindOne.mockResolvedValue(null);
      mockFindByIdAndUpdate.mockResolvedValue(exercise as any);
      mockUploadTutorial.mockResolvedValue({
        success: true,
        data: {
          secure_url:
            'https://res.cloudinary.com/test/image/upload/v1234567890/updated-tutorial.jpg'
        }
      } as any);

      const result = await ExerciseService.updateExercise(
        exerciseId,
        validData,
        { buffer: Buffer.from('tutorial') } as Express.Multer.File
      );

      expect(mockDeleteTutorial).toHaveBeenCalledWith(exerciseId);
      expect(mockUploadTutorial).toHaveBeenCalledWith(
        expect.any(Buffer),
        exerciseId
      );
      expect(result.tutorial).toBe(
        'https://res.cloudinary.com/test/image/upload/v1234567890/updated-tutorial.jpg'
      );
      expect(mockSave).toHaveBeenCalled();
    });
  });
});
