import { afterEach, describe, expect, it, vi } from 'vitest';

import { DashboardService } from '~/features/dashboard/dashboard-service';
import { MEMBERSHIP_LEVEL } from '~/shared/constants/membership-level';
import { PAYMENT_STATUS } from '~/shared/constants/payment-status';
import { PaymentModel, UserModel } from '~/shared/database/models';

vi.mock('~/shared/database/models', () => ({
  PaymentModel: {
    aggregate: vi.fn()
  },
  UserModel: {
    countDocuments: vi.fn()
  }
}));

const mockAggregate = vi.mocked(PaymentModel.aggregate);
const mockCountDocuments = vi.mocked(UserModel.countDocuments);

const mockStatusMetrics = [
  {
    _id: PAYMENT_STATUS.COMPLETED,
    revenue: 5000,
    count: 10,
    upgradeCount: 8,
    completedUpgradeCount: 8
  },
  {
    _id: PAYMENT_STATUS.PENDING,
    revenue: 1000,
    count: 5,
    upgradeCount: 4,
    completedUpgradeCount: 0
  },
  {
    _id: PAYMENT_STATUS.CANCELLED,
    revenue: 0,
    count: 2,
    upgradeCount: 2,
    completedUpgradeCount: 0
  }
];

describe('DashboardService.viewAdminDashboard', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('validation', () => {
    it('should throw 400 when custom range is missing date', async () => {
      await expect(
        DashboardService.viewAdminDashboard({
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
        DashboardService.viewAdminDashboard({
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
        DashboardService.viewAdminDashboard({
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
    it('should return summarized overview and status breakdown', async () => {
      mockAggregate.mockResolvedValue(mockStatusMetrics as any);
      mockCountDocuments.mockResolvedValueOnce(15); // totalVipUsers
      mockCountDocuments.mockResolvedValueOnce(100); // totalUsers

      const result = await DashboardService.viewAdminDashboard({
        range: 'allTime'
      });

      expect(result.period).toBe('allTime');
      expect(result.overview.totalRevenue).toBe(6000);
      expect(result.overview.totalUpgrades).toBe(14);
      expect(result.overview.totalCompletedUpgrades).toBe(8);
      expect(result.overview.totalVipUsers).toBe(15);
      expect(result.overview.totalUsers).toBe(100);
      expect(result.statusBreakdown).toHaveLength(3);

      expect(mockAggregate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            $match: expect.objectContaining({
              targetMembership: { $exists: true }
            })
          })
        ])
      );
      expect(mockCountDocuments).toHaveBeenNthCalledWith(1, {
        membershipLevel: MEMBERSHIP_LEVEL.VIP
      });
      expect(mockCountDocuments).toHaveBeenNthCalledWith(2, {});
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
        mockAggregate.mockResolvedValue([] as any);
        mockCountDocuments.mockResolvedValueOnce(0);
        mockCountDocuments.mockResolvedValueOnce(0);

        const result = await DashboardService.viewAdminDashboard(
          range ? { range } : {}
        );

        expect(result.period).toBe(range ?? 'allTime');
      }
    });

    it('should apply custom range and invalid range fallback without crashing', async () => {
      mockAggregate.mockResolvedValue([] as any);
      mockCountDocuments.mockResolvedValueOnce(0);
      mockCountDocuments.mockResolvedValueOnce(0);
      const customResult = await DashboardService.viewAdminDashboard({
        range: 'custom',
        startDate: '2026-02-01',
        endDate: '2026-02-28'
      });
      expect(customResult.period).toBe('custom');

      mockAggregate.mockResolvedValue([] as any);
      mockCountDocuments.mockResolvedValueOnce(0);
      mockCountDocuments.mockResolvedValueOnce(0);
      const invalidRangeResult = await DashboardService.viewAdminDashboard({
        range: 'invalid' as any
      });
      expect(invalidRangeResult.period).toBe('invalid');
    });
  });
});
