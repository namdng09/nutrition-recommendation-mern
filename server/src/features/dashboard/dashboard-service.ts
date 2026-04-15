import createHttpError from 'http-errors';

import { MEMBERSHIP_LEVEL } from '~/shared/constants/membership-level';
import { PAYMENT_STATUS } from '~/shared/constants/payment-status';
import { ROLE } from '~/shared/constants/role';
import {
  CollectionModel,
  DishModel,
  PaymentModel,
  PostModel,
  UserModel
} from '~/shared/database/models';
import { toObjectId, validateObjectId } from '~/shared/utils';

import type { dashboardQuery } from './dashboard-dto';

type AdminDashboardRange = NonNullable<dashboardQuery['range']>;

export const DashboardService = {
  viewAdminDashboard: async (query: dashboardQuery) => {
    const { period, createdAtFilter } = resolveRange(query);
    const baseFilter = buildPaymentBaseFilter(createdAtFilter);

    const [statusMetrics, totalVipUsers, totalUsers] = await Promise.all([
      paymentMetricsAggregation(baseFilter),
      UserModel.countDocuments({ membershipLevel: MEMBERSHIP_LEVEL.VIP }),
      UserModel.countDocuments({})
    ]);

    const metricsMap = buildMetricsMap(statusMetrics);
    const statusBreakdown = buildStatusBreakdown(metricsMap);

    return buildAdminDashboardResponse(
      period,
      statusBreakdown,
      totalVipUsers,
      totalUsers
    );
  },

  viewNutritionistDashboard: async (userId: string, query: dashboardQuery) => {
    const { period, createdAtFilter } = resolveRange(query);

    const authorId = toObjectId(userId);
    const byAuthor = {
      'author._id': authorId,
      ...(createdAtFilter && { createdAt: createdAtFilter })
    };
    const byUser = {
      'user._id': authorId,
      ...(createdAtFilter && { createdAt: createdAtFilter })
    };

    const [
      totalDishes,
      totalPublicDishes,
      totalPosts,
      totalPublishedPosts,
      totalCollections,
      [engagement]
    ] = await Promise.all([
      DishModel.countDocuments(byUser),
      DishModel.countDocuments({ ...byUser, isPublic: true }),
      PostModel.countDocuments(byAuthor),
      PostModel.countDocuments({ ...byAuthor, isPublished: true }),
      CollectionModel.countDocuments(byUser),
      nutritionistEngagementAggregation(byAuthor)
    ]);

    return buildNutritionistDashboardResponse(
      period,
      totalDishes,
      totalPublicDishes,
      totalPosts,
      totalPublishedPosts,
      totalCollections,
      engagement
    );
  }
};
const paymentMetricsAggregation = (baseFilter: Record<string, any>) =>
  PaymentModel.aggregate<{
    _id: string;
    revenue: number;
    count: number;
    upgradeCount: number;
    completedUpgradeCount: number;
  }>([
    { $match: baseFilter },
    {
      $group: {
        _id: '$status',
        revenue: { $sum: '$amount' },
        count: { $sum: 1 },
        upgradeCount: {
          $sum: {
            $cond: [{ $eq: ['$targetMembership', MEMBERSHIP_LEVEL.VIP] }, 1, 0]
          }
        },
        completedUpgradeCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$targetMembership', MEMBERSHIP_LEVEL.VIP] },
                  { $eq: ['$status', PAYMENT_STATUS.COMPLETED] }
                ]
              },
              1,
              0
            ]
          }
        }
      }
    }
  ]);

const nutritionistEngagementAggregation = (byAuthor: Record<string, any>) =>
  PostModel.aggregate<{
    totalViews: number;
    totalLikes: number;
    totalComments: number;
  }>([
    { $match: byAuthor },
    {
      $group: {
        _id: null,
        totalViews: { $sum: { $ifNull: ['$views', 0] } },
        totalLikes: { $sum: { $size: { $ifNull: ['$likes', []] } } },
        totalComments: { $sum: { $size: { $ifNull: ['$comments', []] } } }
      }
    },
    { $project: { _id: 0 } }
  ]);

// ====== Filter Builders ======

const buildPaymentBaseFilter = (
  createdAtFilter: Record<string, any> | null
): Record<string, any> => ({
  targetMembership: { $exists: true },
  ...(createdAtFilter && { createdAt: createdAtFilter })
});

// ====== Data Transformers ======

const buildMetricsMap = (
  statusMetrics: Array<{
    _id: string;
    revenue: number;
    count: number;
    upgradeCount: number;
    completedUpgradeCount: number;
  }>
): Map<string, (typeof statusMetrics)[0]> =>
  new Map(statusMetrics.map(m => [m._id, m]));

const buildStatusBreakdown = (
  metricsMap: Map<
    string,
    {
      _id: string;
      revenue: number;
      count: number;
      upgradeCount: number;
      completedUpgradeCount: number;
    }
  >
) =>
  Object.values(PAYMENT_STATUS).map(status => ({
    status,
    revenue: metricsMap.get(status)?.revenue ?? 0,
    count: metricsMap.get(status)?.count ?? 0,
    upgradeCount: metricsMap.get(status)?.upgradeCount ?? 0,
    completedUpgradeCount: metricsMap.get(status)?.completedUpgradeCount ?? 0
  }));

const sumMetrics = (
  breakdown: ReturnType<typeof buildStatusBreakdown>,
  key: keyof (typeof breakdown)[0]
): number => breakdown.reduce((acc, item) => acc + (item[key] as number), 0);

const buildAdminDashboardResponse = (
  period: string,
  statusBreakdown: ReturnType<typeof buildStatusBreakdown>,
  totalVipUsers: number,
  totalUsers: number
) => ({
  period,
  overview: {
    totalRevenue: sumMetrics(statusBreakdown, 'revenue'),
    totalUpgrades: sumMetrics(statusBreakdown, 'upgradeCount'),
    totalCompletedUpgrades: sumMetrics(
      statusBreakdown,
      'completedUpgradeCount'
    ),
    totalVipUsers,
    totalUsers
  },
  statusBreakdown: statusBreakdown.map(({ status, count, revenue }) => ({
    status,
    count,
    revenue
  }))
});

const buildNutritionistDashboardResponse = (
  period: string,
  totalDishes: number,
  totalPublicDishes: number,
  totalPosts: number,
  totalPublishedPosts: number,
  totalCollections: number,
  engagement:
    | {
        totalViews: number;
        totalLikes: number;
        totalComments: number;
      }
    | undefined
) => ({
  period,
  overview: {
    totalDishes,
    totalPublicDishes,
    totalPosts,
    totalPublishedPosts,
    totalCollections
  },
  engagement: engagement ?? {
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0
  }
});

// ====== Date/Time Utilities ======

const toStartOfDay = (date: Date) => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

const toEndOfDay = (date: Date) => {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
};

const toStartOfMonth = (date: Date) => {
  const result = new Date(date.getFullYear(), date.getMonth(), 1);
  result.setHours(0, 0, 0, 0);
  return result;
};

const toEndOfMonth = (date: Date) => {
  const result = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  result.setHours(23, 59, 59, 999);
  return result;
};

const toStartOfYear = (date: Date) => {
  const result = new Date(date.getFullYear(), 0, 1);
  result.setHours(0, 0, 0, 0);
  return result;
};

// ====== Date Parsing ======

const parseStrictDate = (value: string, field: 'startDate' | 'endDate') => {
  const match = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match)
    throw createHttpError(400, `${field} phải có định dạng YYYY-MM-DD`);

  const [, y, m, d] = match.map(Number);
  const parsed = new Date(y, m - 1, d);

  if (
    parsed.getFullYear() !== y ||
    parsed.getMonth() !== m - 1 ||
    parsed.getDate() !== d
  )
    throw createHttpError(400, `${field} không hợp lệ`);

  return parsed;
};

// ====== Range Calculations ======

const getRangeFilter = (range: AdminDashboardRange, now = new Date()) => {
  switch (range) {
    case 'today':
      return { $gte: toStartOfDay(now), $lte: toEndOfDay(now) };
    case 'yesterday': {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      return { $gte: toStartOfDay(yesterday), $lte: toEndOfDay(yesterday) };
    }
    case 'last7days': {
      const start = new Date(now);
      start.setDate(start.getDate() - 6);
      return { $gte: toStartOfDay(start), $lte: toEndOfDay(now) };
    }
    case 'last30days': {
      const start = new Date(now);
      start.setDate(start.getDate() - 29);
      return { $gte: toStartOfDay(start), $lte: toEndOfDay(now) };
    }
    case 'thisMonth':
      return { $gte: toStartOfMonth(now), $lte: toEndOfDay(now) };
    case 'lastMonth': {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return { $gte: toStartOfMonth(lastMonth), $lte: toEndOfMonth(lastMonth) };
    }
    case 'thisYear':
      return { $gte: toStartOfYear(now), $lte: toEndOfDay(now) };
    case 'allTime':
      return null;
    default:
      return null;
  }
};

const resolveRange = (query: dashboardQuery) => {
  const range: AdminDashboardRange = query.range ?? 'allTime';

  if (range === 'custom') {
    if (!query.startDate || !query.endDate) {
      throw createHttpError(
        400,
        'Phải truyền startDate và endDate khi range là custom'
      );
    }

    const startDate = parseStrictDate(query.startDate, 'startDate');
    const endDate = parseStrictDate(query.endDate, 'endDate');

    if (startDate > endDate) {
      throw createHttpError(400, 'startDate phải nhỏ hơn hoặc bằng endDate');
    }

    return {
      period: 'custom',
      createdAtFilter: {
        $gte: toStartOfDay(startDate),
        $lte: toEndOfDay(endDate)
      }
    };
  }

  return {
    period: range,
    createdAtFilter: getRangeFilter(range)
  };
};
