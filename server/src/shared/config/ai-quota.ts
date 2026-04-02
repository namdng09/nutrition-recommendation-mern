import {
  MEMBERSHIP_LEVEL,
  type MembershipLevel
} from '~/shared/constants/membership-level';

export const AI_TOKEN_QUOTA_CONFIG = {
  // UTC+7 (Vietnam). Vietnam has no DST, so fixed offset is stable.
  timezoneOffsetMinutes: 7 * 60,
  dailyTokenLimitByMembership: {
    [MEMBERSHIP_LEVEL.NORMAL]: 25_000,
    [MEMBERSHIP_LEVEL.VIP]: 120_000
  } as const,
  reserveTokensByEndpoint: {
    recommend_daily_meals: {
      min: 2_500,
      max: 15_000
    },
    recommend_daily_workout: {
      min: 1_800,
      max: 9_000
    }
  } as const,
  reserveEstimation: {
    charsPerToken: 4,
    outputTokenBudget: 512,
    safetyMultiplier: 1.2
  } as const
} as const;

export type AiQuotaEndpoint =
  keyof typeof AI_TOKEN_QUOTA_CONFIG.reserveTokensByEndpoint;

export const resolveMembershipLevel = (
  value: string | null | undefined
): MembershipLevel => {
  if (value === MEMBERSHIP_LEVEL.VIP) return MEMBERSHIP_LEVEL.VIP;
  return MEMBERSHIP_LEVEL.NORMAL;
};

export const getDailyTokenLimit = (membershipLevel: MembershipLevel): number =>
  AI_TOKEN_QUOTA_CONFIG.dailyTokenLimitByMembership[membershipLevel];

export const getReserveTokenRangeForEndpoint = (
  endpoint: AiQuotaEndpoint
): { min: number; max: number } =>
  AI_TOKEN_QUOTA_CONFIG.reserveTokensByEndpoint[endpoint];

export const estimateReserveTokensForPrompt = (
  endpoint: AiQuotaEndpoint,
  prompt: string
): number => {
  const range = getReserveTokenRangeForEndpoint(endpoint);
  const charsPerToken = AI_TOKEN_QUOTA_CONFIG.reserveEstimation.charsPerToken;
  const estimatedInputTokens = Math.ceil(prompt.length / charsPerToken);
  const estimatedOutputTokens =
    AI_TOKEN_QUOTA_CONFIG.reserveEstimation.outputTokenBudget;
  const rawEstimate = Math.ceil(
    (estimatedInputTokens + estimatedOutputTokens) *
      AI_TOKEN_QUOTA_CONFIG.reserveEstimation.safetyMultiplier
  );

  return Math.max(range.min, Math.min(range.max, rawEstimate));
};

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export const getNextQuotaResetAt = (now = new Date()): Date => {
  const offsetMs = AI_TOKEN_QUOTA_CONFIG.timezoneOffsetMinutes * 60 * 1000;
  const shiftedNow = new Date(now.getTime() + offsetMs);
  shiftedNow.setUTCHours(0, 0, 0, 0);

  const nextShiftedMidnight = shiftedNow.getTime() + DAY_IN_MS;
  return new Date(nextShiftedMidnight - offsetMs);
};

export const getQuotaDateKey = (now = new Date()): string => {
  const offsetMs = AI_TOKEN_QUOTA_CONFIG.timezoneOffsetMinutes * 60 * 1000;
  const shiftedNow = new Date(now.getTime() + offsetMs);
  return shiftedNow.toISOString().slice(0, 10);
};
