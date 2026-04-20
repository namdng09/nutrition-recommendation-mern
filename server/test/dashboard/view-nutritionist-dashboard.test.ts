import { afterEach, describe, expect, it, vi } from 'vitest';

import { DashboardService } from '~/features/dashboard/dashboard-service';
import {
  CollectionModel,
  DishModel,
  PostModel
} from '~/shared/database/models';

vi.mock('~/shared/database/models', () => ({
  DishModel: {
    countDocuments: vi.fn()
  },
  PostModel: {
    countDocuments: vi.fn(),
    aggregate: vi.fn()
  },
  CollectionModel: {
    countDocuments: vi.fn()
  }
}));

const mockDishCountDocuments = vi.mocked(DishModel.countDocuments);
const mockPostCountDocuments = vi.mocked(PostModel.countDocuments);
const mockPostAggregate = vi.mocked(PostModel.aggregate);
const mockCollectionCountDocuments = vi.mocked(CollectionModel.countDocuments);

const VALID_NUTRITIONIST_ID = '507f1f77bcf86cd799439011';

const mockEngagementMetrics = {
  totalViews: 150,
  totalLikes: 45,
  totalComments: 12
};

describe('DashboardService.viewNutritionistDashboard', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('validation', () => {
    it('should throw 400 when custom range is missing date', async () => {
      await expect(
        DashboardService.viewNutritionistDashboard(VALID_NUTRITIONIST_ID, {
          range: 'custom',
          startDate: '2026-02-01'
        })
      ).rejects.toMatchObject({
        status: 400,
        message: 'Phải truyền startDate và endDate khi range là custom'
      });
    });

    it('should throw 400 when startDate is after endDate', async () => {
      await expect(
        DashboardService.viewNutritionistDashboard(VALID_NUTRITIONIST_ID, {
          range: 'custom',
          startDate: '2026-02-28',
          endDate: '2026-02-01'
        })
      ).rejects.toMatchObject({
        status: 400,
        message: 'startDate phải nhỏ hơn hoặc bằng endDate'
      });
    });

    it('should throw 400 when date format is invalid', async () => {
      await expect(
        DashboardService.viewNutritionistDashboard(VALID_NUTRITIONIST_ID, {
          range: 'custom',
          startDate: '02-02-2026',
          endDate: '2026-02-28'
        })
      ).rejects.toMatchObject({
        status: 400,
        message: 'startDate phải có định dạng YYYY-MM-DD'
      });
    });
  });

  describe('business logic', () => {
    it('should return nutritionist dashboard with all metrics', async () => {
      mockDishCountDocuments.mockResolvedValueOnce(25); // totalDishes
      mockDishCountDocuments.mockResolvedValueOnce(18); // totalPublicDishes
      mockPostCountDocuments.mockResolvedValueOnce(12); // totalPosts
      mockPostCountDocuments.mockResolvedValueOnce(10); // totalPublishedPosts
      mockCollectionCountDocuments.mockResolvedValueOnce(5); // totalCollections
      mockPostAggregate.mockResolvedValue([mockEngagementMetrics] as any);

      const result = await DashboardService.viewNutritionistDashboard(
        VALID_NUTRITIONIST_ID,
        { range: 'allTime' }
      );

      expect(result.period).toBe('allTime');
      expect(result.overview.totalDishes).toBe(25);
      expect(result.overview.totalPublicDishes).toBe(18);
      expect(result.overview.totalPosts).toBe(12);
      expect(result.overview.totalPublishedPosts).toBe(10);
      expect(result.overview.totalCollections).toBe(5);
      expect(result.engagement.totalViews).toBe(150);
      expect(result.engagement.totalLikes).toBe(45);
      expect(result.engagement.totalComments).toBe(12);
    });

    it('should handle all range options and default behavior', async () => {
      const ranges = [
        undefined,
        'today',
        'yesterday',
        'last7days',
        'last30days',
        'thisMonth',
        'lastMonth',
        'thisYear',
        'allTime'
      ] as const;

      for (const range of ranges) {
        mockDishCountDocuments.mockResolvedValue(0);
        mockPostCountDocuments.mockResolvedValue(0);
        mockCollectionCountDocuments.mockResolvedValue(0);
        mockPostAggregate.mockResolvedValue([] as any);

        const result = await DashboardService.viewNutritionistDashboard(
          VALID_NUTRITIONIST_ID,
          range ? { range } : {}
        );

        expect(result.period).toBe(range ?? 'allTime');
      }
    });

    it('should apply custom range and invalid range fallback without crashing', async () => {
      mockDishCountDocuments.mockResolvedValue(0);
      mockPostCountDocuments.mockResolvedValue(0);
      mockCollectionCountDocuments.mockResolvedValue(0);
      mockPostAggregate.mockResolvedValue([] as any);

      const customResult = await DashboardService.viewNutritionistDashboard(
        VALID_NUTRITIONIST_ID,
        {
          range: 'custom',
          startDate: '2026-02-01',
          endDate: '2026-02-28'
        }
      );
      expect(customResult.period).toBe('custom');

      mockDishCountDocuments.mockResolvedValue(0);
      mockPostCountDocuments.mockResolvedValue(0);
      mockCollectionCountDocuments.mockResolvedValue(0);
      mockPostAggregate.mockResolvedValue([] as any);

      const invalidRangeResult =
        await DashboardService.viewNutritionistDashboard(
          VALID_NUTRITIONIST_ID,
          {
            range: 'invalid' as any
          }
        );
      expect(invalidRangeResult.period).toBe('invalid');
    });
  });
});
