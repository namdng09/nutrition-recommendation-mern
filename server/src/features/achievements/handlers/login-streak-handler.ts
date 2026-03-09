import { ACHIEVEMENTS } from '~/shared/constants/achievements';
import { eventBus } from '~/shared/events/event-bus';
import { EVENTS } from '~/shared/events/event-types';

import { AchievementService } from '../achievement-service';

const STREAK_MILESTONES = [
  { days: 30, key: ACHIEVEMENTS.LOGIN_STREAK_30.key },
  { days: 14, key: ACHIEVEMENTS.LOGIN_STREAK_14.key },
  { days: 7, key: ACHIEVEMENTS.LOGIN_STREAK_7.key },
  { days: 1, key: ACHIEVEMENTS.FIRST_LOGIN.key }
] as const;

export function registerLoginStreakHandler() {
  eventBus.on(EVENTS.USER_LOGGED_IN, async ({ userId, loginStreak }) => {
    try {
      for (const milestone of STREAK_MILESTONES) {
        if (loginStreak >= milestone.days) {
          await AchievementService.unlock(userId, milestone.key);
        }
      }
    } catch (err) {
      console.error('[Achievement] user:logged_in handler error', err);
    }
  });
}
