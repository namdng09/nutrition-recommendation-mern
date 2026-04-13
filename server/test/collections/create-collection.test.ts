import { afterEach, describe, expect, it, vi } from 'vitest';

import { createCollectionRequestSchema } from '~/features/collections/collection-dto';
import { CollectionService } from '~/features/collections/collection-service';
import { CollectionModel, DishModel } from '~/shared/database/models';
import { uploadImage, validateObjectId } from '~/shared/utils';

vi.mock('~/shared/database/models', () => ({
  CollectionModel: {
    create: vi.fn()
  },
  DishModel: {
    find: vi.fn()
  }
}));

vi.mock('~/shared/utils', async importOriginal => {
  const actual = await importOriginal<typeof import('~/shared/utils')>();
  return {
    ...actual,
    uploadImage: vi.fn(),
    deleteImage: vi.fn(),
    validateObjectId: vi.fn()
  };
});

const mockCreate = vi.mocked(CollectionModel.create);
const mockFind = vi.mocked(DishModel.find);
const mockUploadImage = vi.mocked(uploadImage);
const mockValidateObjectId = vi.mocked(validateObjectId);

const userId = 'user123';
const userName = 'Nutritionist';
const dishId = 'dish1';

const validData = {
  name: 'Bua an giam can',
  description: 'Bo suu tap mon an giam can',
  dishes: [dishId],
  tags: ['healthy']
};

const makeDish = (id: string, name: string, energy = 250) => ({
  _id: id,
  name,
  image: 'dish.jpg',
  nutrition: { nutrients: [{ value: energy }] }
});

describe('CollectionService.createCollection', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('validation', () => {
    it('should fail when name is missing', () => {
      const { name: _, ...data } = validData;
      const result = createCollectionRequestSchema.safeParse(data);

      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe(
        'Tên bộ sưu tập không hợp lệ'
      );
    });

    it('should fail when name is too short', () => {
      const result = createCollectionRequestSchema.safeParse({
        ...validData,
        name: 'A'
      });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe(
        'Tên phải có ít nhất 2 ký tự'
      );
    });

    it('should fail when no dishes are provided', () => {
      const result = createCollectionRequestSchema.safeParse({
        ...validData,
        dishes: []
      });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe(
        'Phải có ít nhất một món ăn'
      );
    });
  });

  describe('business logic', () => {
    it('should throw 400 when dish id format is invalid', async () => {
      mockValidateObjectId.mockReturnValue(false);

      await expect(
        CollectionService.createCollection(userId, userName, validData as any)
      ).rejects.toMatchObject({
        status: 400,
        message: `Định dạng ID món ăn không hợp lệ: ${dishId}`
      });
    });

    it('should throw 404 when dish does not exist', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFind.mockResolvedValue([] as any);

      await expect(
        CollectionService.createCollection(userId, userName, validData as any)
      ).rejects.toMatchObject({
        status: 404,
        message: 'Một hoặc nhiều món ăn không tồn tại'
      });
    });

    it('should create collection successfully', async () => {
      const mockSave = vi.fn();
      const mockCollection = {
        _id: { toString: () => 'collection1' },
        name: validData.name,
        dishes: [{ dishId, name: 'Pho bo', energy: 250, image: 'dish.jpg' }],
        image: '',
        save: mockSave
      };

      mockValidateObjectId.mockReturnValue(true);
      mockFind.mockResolvedValue([makeDish(dishId, 'Pho bo')] as any);
      mockCreate.mockResolvedValue(mockCollection as any);
      mockUploadImage.mockResolvedValue({
        success: true,
        data: {
          secure_url:
            'https://res.cloudinary.com/test/image/upload/collection.jpg'
        }
      } as any);

      const fakeImage = { buffer: Buffer.from('img') } as Express.Multer.File;

      const result = await CollectionService.createCollection(
        userId,
        userName,
        validData as any,
        fakeImage
      );

      expect(mockCollection.image).toBe(
        'https://res.cloudinary.com/test/image/upload/collection.jpg'
      );
      expect(mockSave).toHaveBeenCalled();
      expect(result).toEqual(mockCollection);
    });
  });
});
