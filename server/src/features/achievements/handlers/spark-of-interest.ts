import { ACHIEVEMENTS } from '~/shared/constants/achievement';
import { eventBus } from '~/shared/events/event-bus';
import { type EventPayloads, EVENTS } from '~/shared/events/event-types';

import { AchievementService } from '../achievement-service';
import { getSocialStats } from '../shared/social-stats';

export function registerSparkOfInterestHandler(): void {
  for (const event of [
    EVENTS.POST_LIKED,
    EVENTS.POST_UNLIKED,
    EVENTS.POST_COMMENTED,
    EVENTS.POST_COMMENT_DELETED
  ] as const) {
    eventBus.on(event, async (payload: EventPayloads[typeof event]) => {
      try {
        const { totalLikes } = await getSocialStats(payload.authorId);
        if (totalLikes >= 50) {
          await AchievementService.unlock(
            payload.authorId,
            ACHIEVEMENTS.SPARK_OF_INTEREST.key
          );
        }
      } catch (err) {
        console.error('[Achievement] SPARK_OF_INTEREST handler error', err);
      }
    });
  }
}
