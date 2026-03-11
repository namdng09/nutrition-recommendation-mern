import { afterEach, describe, expect, it, vi } from 'vitest';

import { GroceryService } from '~/features/groceries/grocery-service';
import { GroceryModel } from '~/shared/database/models';
import { buildPaginateOptions, validateObjectId } from '~/shared/utils';

vi.mock('~/shared/database/models', () => ({
  GroceryModel: { paginate: vi.fn() }
}));

vi.mock('~/shared/utils', async importOriginal => {
  const actual = await importOriginal<typeof import('~/shared/utils')>();
  return {
    ...actual,
    validateObjectId: vi.fn(),
    buildPaginateOptions: vi.fn()
  };
});

const mockPaginate = vi.mocked(GroceryModel.paginate);
const mockValidateObjectId = vi.mocked(validateObjectId);
const mockBuildPaginateOptions = vi.mocked(buildPaginateOptions);

const USER_ID = 'user123';

describe('GroceryService.viewGroceries', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('business logic', () => {
    it('should throw 400 when userId is invalid', async () => {
      mockValidateObjectId.mockReturnValue(false);

      await expect(
        GroceryService.viewGroceries('invalid-id', { filter: {} } as any)
      ).rejects.toMatchObject({
        status: 400,
        message: 'Định dạng ID người dùng không hợp lệ'
      });
    });

    it('should return paginated groceries for the user', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockBuildPaginateOptions.mockReturnValue({ limit: 10, page: 1 } as any);

      const fakeResult = {
        docs: [{ name: 'Danh sách tuần 1' }, { name: 'Danh sách tuần 2' }],
        totalDocs: 2,
        limit: 10,
        page: 1
      };
      mockPaginate.mockResolvedValue(fakeResult as any);

      const result = await GroceryService.viewGroceries(USER_ID, {
        filter: {},
        limit: 10
      } as any);

      expect(result).toBeDefined();
      expect(result.docs).toHaveLength(2);
      expect(mockPaginate).toHaveBeenCalledWith(
        expect.objectContaining({ 'user._id': USER_ID }),
        expect.any(Object)
      );
    });
  });
});
