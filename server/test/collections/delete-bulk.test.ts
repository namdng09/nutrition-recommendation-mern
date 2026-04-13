import { afterEach, describe, expect, it, vi } from 'vitest';

import { deleteBulkCollectionRequestSchema } from '~/features/collections/collection-dto';
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

const VALID_IDS = ['coll1', 'coll2'];
const userId = 'user123';
const otherUserId = 'other-user-456';

describe('CollectionService.deleteBulk', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('validation', () => {
    it('should fail when ids is empty array', () => {
      const result = deleteBulkCollectionRequestSchema.safeParse({ ids: [] });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe(
        'Cần ít nhất một ID bộ sưu tập'
      );
    });

    it('should fail when ids contains empty string', () => {
      const result = deleteBulkCollectionRequestSchema.safeParse({ ids: [''] });

      expect(result.success).toBe(false);
    });
  });

  describe('business logic', () => {
    it('should throw 400 when ids contains invalid ObjectId', async () => {
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

    it('should throw 403 when non-owner tries to delete', async () => {
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

    it('should delete successfully when ids are valid', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFind.mockResolvedValue([
        {
          _id: { toString: () => 'coll1' },
          user: { _id: { toString: () => userId } },
          image: 'coll1.jpg'
        },
        {
          _id: { toString: () => 'coll2' },
          user: { _id: { toString: () => userId } },
          image: ''
        }
      ] as any);
      mockDeleteImage.mockResolvedValue({ success: true } as any);
      mockDeleteMany.mockResolvedValue({
        deletedCount: 2,
        acknowledged: true
      } as any);

      const result = await CollectionService.deleteBulk(
        VALID_IDS,
        userId,
        ROLE.USER
      );

      expect(mockDeleteImage).toHaveBeenCalledTimes(1);
      expect(mockDeleteImage).toHaveBeenCalledWith('coll1');
      expect(mockDeleteMany).toHaveBeenCalledWith({ _id: { $in: VALID_IDS } });
      expect(result.deletedCount).toBe(2);
    });

    it('should allow admin to delete collections not owned by them', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFind.mockResolvedValue([
        {
          _id: { toString: () => 'coll1' },
          user: { _id: { toString: () => otherUserId } },
          image: 'coll1.jpg'
        }
      ] as any);
      mockDeleteMany.mockResolvedValue({ deletedCount: 1 } as any);

      const result = await CollectionService.deleteBulk(
        ['coll1'],
        otherUserId,
        ROLE.ADMIN
      );

      expect(mockDeleteMany).toHaveBeenCalledWith({ _id: { $in: ['coll1'] } });
      expect(result.deletedCount).toBe(1);
    });
  });
});
