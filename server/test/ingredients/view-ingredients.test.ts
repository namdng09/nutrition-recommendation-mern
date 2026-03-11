import { afterEach, describe, expect, it, vi } from 'vitest';

import { IngredientService } from '~/features/ingredients/ingredient-service';
import { IngredientModel } from '~/shared/database/models';
import { buildPaginateOptions } from '~/shared/utils';

vi.mock('~/shared/database/models', () => ({
  IngredientModel: {
    paginate: vi.fn()
  }
}));

vi.mock('~/shared/utils', async importOriginal => {
  const actual = await importOriginal<typeof import('~/shared/utils')>();
  return {
    ...actual,
    buildPaginateOptions: vi.fn()
  };
});

const mockPaginate = vi.mocked(IngredientModel.paginate);
const mockBuildPaginateOptions = vi.mocked(buildPaginateOptions);

describe('IngredientService.viewIngredients', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('business logic', () => {
    it('should return paginated ingredients successfully', async () => {
      const fakeOptions = { limit: 10, page: 1 };
      const fakeResult = {
        docs: [
          { name: 'Cà chua' },
          { name: 'Thịt bò' },
          { name: 'Cá hồi' },
          { name: 'Sữa tươi' }
        ],
        totalDocs: 4,
        limit: 10,
        page: 1
      };

      mockBuildPaginateOptions.mockReturnValue(fakeOptions as any);
      mockPaginate.mockResolvedValue(fakeResult as any);

      const result = await IngredientService.viewIngredients({
        filter: {},
        limit: 10
      } as any);

      expect(result).toBeDefined();
      expect(result.docs).toBeDefined();
      expect(Array.isArray(result.docs)).toBe(true);
      expect(result.docs.length).toBe(4);
    });
  });
});
