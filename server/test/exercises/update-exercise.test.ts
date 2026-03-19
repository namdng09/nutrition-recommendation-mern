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
const mockUploadExerciseTutorial = vi.mocked(uploadExerciseTutorial);
const mockDeleteExerciseTutorial = vi.mocked(deleteExerciseTutorial);

const VALID_ID = 'abc123';
const validData = {
  name: 'Diamond Push-up',
  instructions: 'Updated instructions'
};

describe('ExerciseService.updateExercise', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('validation', () => {
    // Tests DTO schema directly — no service, no DB involved

    it('should fail when name is too short', () => {
      const result = updateExerciseRequestSchema.safeParse({ name: 'A' });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe(
        'Tên bài tập phải có ít nhất 2 ký tự'
      );
    });
  });

  describe('business logic', () => {
    it('should throw 400 when id format is invalid', async () => {
      mockValidateObjectId.mockReturnValue(false);

      await expect(
        ExerciseService.updateExercise('invalid-id', validData)
      ).rejects.toMatchObject({
        status: 400,
        message: 'Định dạng ID bài tập không hợp lệ'
      });
    });

    it('should throw 409 when updating to a name that already exists', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFindOne.mockResolvedValue({ name: 'Squat' } as any);

      await expect(
        ExerciseService.updateExercise(VALID_ID, { name: 'Squat' })
      ).rejects.toMatchObject({
        status: 409,
        message: 'Bài tập với tên này đã tồn tại'
      });
    });

    it('should throw 404 when exercise does not exist', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFindOne.mockResolvedValue(null);
      mockFindByIdAndUpdate.mockResolvedValue(null);

      await expect(
        ExerciseService.updateExercise(VALID_ID, validData)
      ).rejects.toMatchObject({
        status: 404,
        message: 'Không tìm thấy bài tập'
      });
    });

    it('should update exercise successfully', async () => {
      const mockSave = vi.fn();
      const mockExercise = {
        _id: { toString: () => VALID_ID },
        ...validData,
        tutorial: '',
        save: mockSave
      };

      mockValidateObjectId.mockReturnValue(true);
      mockFindOne.mockResolvedValue(null);
      mockFindByIdAndUpdate.mockResolvedValue(mockExercise as any);
      mockUploadExerciseTutorial.mockResolvedValue({
        success: true,
        data: {
          secure_url:
            'https://res.cloudinary.com/test/video/upload/v1234567890/updated-tutorial.mp4'
        }
      } as any);

      const fakeTutorial = {
        buffer: Buffer.from('fake-video-data')
      } as Express.Multer.File;

      const result = await ExerciseService.updateExercise(
        VALID_ID,
        validData,
        fakeTutorial
      );

      expect(mockDeleteExerciseTutorial).toHaveBeenCalledWith(VALID_ID);
      expect(mockUploadExerciseTutorial).toHaveBeenCalledWith(
        fakeTutorial.buffer,
        VALID_ID
      );
      expect(mockExercise.tutorial).toBe(
        'https://res.cloudinary.com/test/video/upload/v1234567890/updated-tutorial.mp4'
      );
      expect(mockSave).toHaveBeenCalled();
      expect(result).toEqual(mockExercise);
    });
  });

  describe('system', () => {
    it('should throw 500 when tutorial upload fails', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFindOne.mockResolvedValue(null);
      mockFindByIdAndUpdate.mockResolvedValue({
        _id: { toString: () => VALID_ID },
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
        ExerciseService.updateExercise(VALID_ID, validData, fakeTutorial)
      ).rejects.toMatchObject({
        status: 500,
        message: 'Không thể tải lên ảnh hướng dẫn bài tập'
      });
    });
  });
});
