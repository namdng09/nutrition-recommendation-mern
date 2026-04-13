import { afterEach, describe, expect, it, vi } from 'vitest';

import { updateCollectionRequestSchema } from '~/features/collections/collection-dto';
import { CollectionService } from '~/features/collections/collection-service';
import { CollectionModel, DishModel } from '~/shared/database/models';
import { deleteImage, uploadImage, validateObjectId } from '~/shared/utils';

vi.mock('~/shared/database/models', () => ({
  CollectionModel: {
    findById: vi.fn(),
    findByIdAndUpdate: vi.fn()
  },
  DishModel: {
    find: vi.fn()
  }
}));

vi.mock('~/shared/utils', async importOriginal => {
  const actual = await importOriginal<typeof import('~/shared/utils')>();
  return {
    ...actual,
    validateObjectId: vi.fn(),
    uploadImage: vi.fn(),
    deleteImage: vi.fn()
  };
});

const mockFindById = vi.mocked(CollectionModel.findById);
const mockFindByIdAndUpdate = vi.mocked(CollectionModel.findByIdAndUpdate);
const mockFindDishes = vi.mocked(DishModel.find);
const mockValidateObjectId = vi.mocked(validateObjectId);
const mockUploadImage = vi.mocked(uploadImage);
const mockDeleteImage = vi.mocked(deleteImage);

const VALID_ID = 'collection1';
const userId = 'user123';

const validData = {
  name: 'Bo suu tap moi',
  description: 'Cap nhat bo suu tap',
  dishes: ['dish1']
};

describe('CollectionService.updateCollection', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('validation', () => {
    it('should fail when name is too short', () => {
      const result = updateCollectionRequestSchema.safeParse({ name: 'A' });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe(
        'Tên phải có ít nhất 2 ký tự'
      );
    });
  });

  describe('business logic', () => {
    it('should throw 400 when id format is invalid', async () => {
      mockValidateObjectId.mockReturnValue(false);

      await expect(
        CollectionService.updateCollection(
          'invalid-id',
          userId,
          validData as any
        )
      ).rejects.toMatchObject({
        status: 400,
        message: 'Định dạng ID bộ sưu tập không hợp lệ'
      });
    });

    it('should throw 404 when collection does not exist', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFindById.mockResolvedValue(null);

      await expect(
        CollectionService.updateCollection(VALID_ID, userId, validData as any)
      ).rejects.toMatchObject({
        status: 404,
        message: 'Không tìm thấy bộ sưu tập'
      });
    });

    it('should throw 403 when user is not owner', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFindById.mockResolvedValue({
        user: { _id: { toString: () => 'other-user' } }
      } as any);

      await expect(
        CollectionService.updateCollection(VALID_ID, userId, validData as any)
      ).rejects.toMatchObject({
        status: 403,
        message: 'Bạn không có quyền cập nhật bộ sưu tập này'
      });
    });

    it('should throw 400 when dish id format is invalid', async () => {
      mockValidateObjectId.mockImplementation((id: string) => id === VALID_ID);
      mockFindById.mockResolvedValue({
        user: { _id: { toString: () => userId } }
      } as any);

      await expect(
        CollectionService.updateCollection(VALID_ID, userId, validData as any)
      ).rejects.toMatchObject({
        status: 400,
        message: 'Định dạng ID món ăn không hợp lệ: dish1'
      });
    });

    it('should throw 404 when dish does not exist', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFindById.mockResolvedValue({
        user: { _id: { toString: () => userId } }
      } as any);
      mockFindDishes.mockResolvedValue([] as any);

      await expect(
        CollectionService.updateCollection(VALID_ID, userId, validData as any)
      ).rejects.toMatchObject({
        status: 404,
        message: 'Một hoặc nhiều món ăn không tồn tại'
      });
    });

    it('should update collection successfully', async () => {
      const mockSave = vi.fn();
      const mockCollection = {
        _id: { toString: () => VALID_ID },
        ...validData,
        image: '',
        save: mockSave
      };

      mockValidateObjectId.mockReturnValue(true);
      mockFindById.mockResolvedValue({
        user: { _id: { toString: () => userId } }
      } as any);
      mockFindDishes.mockResolvedValue([
        {
          _id: 'dish1',
          name: 'Pho bo',
          nutrition: { nutrients: [{ value: 250 }] },
          image: 'dish.jpg'
        }
      ] as any);
      mockFindByIdAndUpdate.mockResolvedValue(mockCollection as any);
      mockUploadImage.mockResolvedValue({
        success: true,
        data: {
          secure_url: 'https://res.cloudinary.com/test/image/upload/new.jpg'
        }
      } as any);

      const fakeImage = { buffer: Buffer.from('img') } as Express.Multer.File;

      const result = await CollectionService.updateCollection(
        VALID_ID,
        userId,
        validData as any,
        fakeImage
      );

      expect(mockDeleteImage).toHaveBeenCalledWith(VALID_ID);
      expect(mockUploadImage).toHaveBeenCalledWith(fakeImage.buffer, VALID_ID);
      expect(mockCollection.image).toBe(
        'https://res.cloudinary.com/test/image/upload/new.jpg'
      );
      expect(mockSave).toHaveBeenCalled();
      expect(result).toEqual(mockCollection);
    });
  });
});
