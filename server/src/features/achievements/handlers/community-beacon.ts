import { ACHIEVEMENTS } from '~/shared/constants/achievement';
import { eventBus } from '~/shared/events/event-bus';
import { type EventPayloads, EVENTS } from '~/shared/events/event-types';

import { AchievementService } from '../achievement-service';
import { getSocialStats } from '../shared/social-stats';

export function registerCommunityBeaconHandler(): void {
  for (const event of [
    EVENTS.POST_LIKED,
    EVENTS.POST_UNLIKED,
    EVENTS.POST_COMMENTED,
    EVENTS.POST_COMMENT_DELETED
  ] as const) {
    eventBus.on(event, async (payload: EventPayloads[typeof event]) => {
      try {
        const { totalLikes, totalComments } = await getSocialStats(
          payload.authorId
        );
        if (totalLikes >= 200 && totalComments >= 50) {
          await AchievementService.unlock(
            payload.authorId,
            ACHIEVEMENTS.COMMUNITY_BEACON.key
          );
        }
      } catch (err) {
        console.error('[Achievement] COMMUNITY_BEACON handler error', err);
      }
    });
  }
}
