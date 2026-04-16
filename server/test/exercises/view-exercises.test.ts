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

const parsed = { filter: {}, limit: 10 } as any;
const options = { page: 1, limit: 10 };

describe('ExerciseService.viewExercises (UC109)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return exercises list successfully', async () => {
    mockBuildPaginateOptions.mockReturnValue(options);
    mockPaginate.mockResolvedValue({ docs: ['exercise1', 'exercise2'] } as any);

    const result = await ExerciseService.viewExercises(parsed);

    expect(mockBuildPaginateOptions).toHaveBeenCalledWith(parsed);
    expect(mockPaginate).toHaveBeenCalledWith({}, options);
    expect(result).toEqual({ docs: ['exercise1', 'exercise2'] });
  });
});
