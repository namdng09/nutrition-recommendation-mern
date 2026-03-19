import { afterEach, describe, expect, it, vi } from 'vitest';

import { ExerciseService } from '~/features/exercises/exercise-service';
import { ExerciseModel } from '~/shared/database/models';
import { buildPaginateOptions } from '~/shared/utils';

vi.mock('~/shared/database/models', () => ({
  ExerciseModel: {
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

const mockPaginate = vi.mocked(ExerciseModel.paginate);
const mockBuildPaginateOptions = vi.mocked(buildPaginateOptions);

describe('ExerciseService.viewExercises', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('business logic', () => {
    it('should return paginated exercises successfully', async () => {
      const fakeOptions = { limit: 10, page: 1 };
      const fakeResult = {
        docs: [
          { name: 'Push-up' },
          { name: 'Pull-up' },
          { name: 'Squat' },
          { name: 'Plank' }
        ],
        totalDocs: 4,
        limit: 10,
        page: 1
      };

      mockBuildPaginateOptions.mockReturnValue(fakeOptions as any);
      mockPaginate.mockResolvedValue(fakeResult as any);

      const result = await ExerciseService.viewExercises({
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
