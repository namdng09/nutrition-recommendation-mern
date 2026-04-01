import { afterEach, describe, expect, it, vi } from 'vitest';

import { CollectionService } from '~/features/collections/collection-service';
import { ROLE } from '~/shared/constants/role';
import { CollectionModel } from '~/shared/database/models';
import { deleteImage, validateObjectId } from '~/shared/utils';

vi.mock('~/shared/database/models', () => ({
  CollectionModel: {
    find: vi.fn(),
    deleteMany: vi.fn()
  }
}));

vi.mock('~/shared/utils', async importOriginal => {
  const actual = await importOriginal<typeof import('~/shared/utils')>();
  return {
    ...actual,
    validateObjectId: vi.fn(),
    deleteImage: vi.fn()
  };
});

const mockFind = vi.mocked(CollectionModel.find);
const mockDeleteMany = vi.mocked(CollectionModel.deleteMany);
const mockValidateObjectId = vi.mocked(validateObjectId);
const mockDeleteImage = vi.mocked(deleteImage);

const VALID_IDS = ['coll1', 'coll2', 'coll3'];
const userId = 'user123';
const otherUserId = 'other-user-456';
const ADMIN_USER = 'admin-user';

const mockCollections = [
  {
    _id: { toString: () => 'coll1' },
    user: { _id: { toString: () => userId } },
    image: 'coll1.jpg'
  },
  {
    _id: { toString: () => 'coll2' },
    user: { _id: { toString: () => userId } },
    image: 'coll2.jpg'
  },
  {
    _id: { toString: () => 'coll3' },
    user: { _id: { toString: () => userId } },
    image: ''
  }
];

describe('CollectionService.deleteBulk', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('business logic', () => {
    it('should throw 400 when id format is invalid', async () => {
      mockValidateObjectId.mockReturnValueOnce(true);
      mockValidateObjectId.mockReturnValueOnce(false);

      await expect(
        CollectionService.deleteBulk(VALID_IDS, userId, ROLE.USER)
      ).rejects.toMatchObject({
        status: 400,
        message: 'Định dạng ID bộ sưu tập không hợp lệ: coll2'
      });

      expect(mockFind).not.toHaveBeenCalled();
    });

    it('should throw 403 when non-admin user tries to delete collections not owned by them', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFind.mockResolvedValue([
        {
          _id: { toString: () => 'coll1' },
          user: { _id: { toString: () => otherUserId } },
          image: 'coll1.jpg'
        }
      ] as any);

      await expect(
        CollectionService.deleteBulk(['coll1'], userId, ROLE.USER)
      ).rejects.toMatchObject({
        status: 403,
        message: 'Bạn không có quyền xóa một số bộ sưu tập này'
      });

      expect(mockDeleteMany).not.toHaveBeenCalled();
    });

    it('should allow admin to delete collections not owned by them', async () => {
      mockValidateObjectId.mockReturnValue(true);
      const adminCollections = [
        {
          _id: { toString: () => 'coll1' },
          user: { _id: { toString: () => otherUserId } },
          image: 'coll1.jpg'
        }
      ];
      mockFind.mockResolvedValue(adminCollections as any);
      mockDeleteMany.mockResolvedValue({ deletedCount: 1 } as any);

      await CollectionService.deleteBulk(['coll1'], ADMIN_USER, ROLE.ADMIN);

      expect(mockDeleteMany).toHaveBeenCalledWith({
        _id: { $in: ['coll1'] }
      });
      expect(mockDeleteImage).toHaveBeenCalledWith('coll1');
    });

    it('should delete images for collections with images and skip empty ones', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFind.mockResolvedValue(mockCollections as any);
      mockDeleteMany.mockResolvedValue({ deletedCount: 3 } as any);

      await CollectionService.deleteBulk(VALID_IDS, userId, ROLE.USER);

      expect(mockDeleteImage).toHaveBeenCalledWith('coll1');
      expect(mockDeleteImage).toHaveBeenCalledWith('coll2');
      expect(mockDeleteImage).toHaveBeenCalledTimes(2);
      expect(mockDeleteMany).toHaveBeenCalledWith({
        _id: { $in: VALID_IDS }
      });
    });

    it('should return delete result with correct deletedCount', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFind.mockResolvedValue(mockCollections as any);
      const deleteResult = {
        deletedCount: 3,
        acknowledged: true
      };
      mockDeleteMany.mockResolvedValue(deleteResult as any);

      const result = await CollectionService.deleteBulk(
        VALID_IDS,
        userId,
        ROLE.USER
      );

      expect(result).toEqual(deleteResult);
    });

    it('should handle case when no collections found to delete', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFind.mockResolvedValue([] as any);
      mockDeleteMany.mockResolvedValue({ deletedCount: 0 } as any);

      const result = await CollectionService.deleteBulk(
        VALID_IDS,
        userId,
        ROLE.USER
      );

      expect(result.deletedCount).toBe(0);
    });
  });
});
