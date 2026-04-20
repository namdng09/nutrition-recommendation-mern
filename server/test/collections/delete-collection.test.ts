import { afterEach, describe, expect, it, vi } from 'vitest';

import { CollectionService } from '~/features/collections/collection-service';
import { ROLE } from '~/shared/constants/role';
import { CollectionModel } from '~/shared/database/models';
import { deleteImage, validateObjectId } from '~/shared/utils';

vi.mock('~/shared/database/models', () => ({
  CollectionModel: {
    findById: vi.fn()
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

const mockFindById = vi.mocked(CollectionModel.findById);
const mockValidateObjectId = vi.mocked(validateObjectId);
const mockDeleteImage = vi.mocked(deleteImage);

const VALID_ID = 'collection1';
const userId = 'user123';
const otherUserId = 'other-user-456';
const mockDeleteOne = vi.fn();

const mockCollection = {
  _id: { toString: () => VALID_ID },
  user: { _id: { toString: () => userId } },
  image: 'collection.jpg',
  deleteOne: mockDeleteOne
};

describe('CollectionService.deleteCollection', () => {
  afterEach(() => {
    vi.clearAllMocks();
    mockDeleteOne.mockClear();
  });

  describe('business logic', () => {
    it('should throw 400 when id format is invalid', async () => {
      mockValidateObjectId.mockReturnValue(false);

      await expect(
        CollectionService.deleteCollection('invalid-id', userId, ROLE.USER)
      ).rejects.toMatchObject({
        status: 400,
        message: 'Định dạng ID bộ sưu tập không hợp lệ'
      });
    });

    it('should throw 404 when collection does not exist', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFindById.mockResolvedValue(null);

      await expect(
        CollectionService.deleteCollection(VALID_ID, userId, ROLE.USER)
      ).rejects.toMatchObject({
        status: 404,
        message: 'Không tìm thấy bộ sưu tập'
      });
    });

    it('should throw 403 when non-owner tries to delete', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFindById.mockResolvedValue(mockCollection as any);

      await expect(
        CollectionService.deleteCollection(VALID_ID, otherUserId, ROLE.USER)
      ).rejects.toMatchObject({
        status: 403,
        message: 'Bạn không có quyền xóa bộ sưu tập này'
      });
    });

    it('should delete collection successfully as owner', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFindById.mockResolvedValue(mockCollection as any);

      const result = await CollectionService.deleteCollection(
        VALID_ID,
        userId,
        ROLE.USER
      );

      expect(mockDeleteImage).toHaveBeenCalledWith(VALID_ID);
      expect(mockDeleteOne).toHaveBeenCalled();
      expect(result._id.toString()).toBe(VALID_ID);
    });

    it('should allow admin to delete any collection', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFindById.mockResolvedValue(mockCollection as any);

      const result = await CollectionService.deleteCollection(
        VALID_ID,
        otherUserId,
        ROLE.ADMIN
      );

      expect(result._id.toString()).toBe(VALID_ID);
    });
  });
});
