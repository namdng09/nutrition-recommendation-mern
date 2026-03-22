import { ACHIEVEMENTS } from '~/shared/constants/achievement';
import { eventBus } from '~/shared/events/event-bus';
import { type EventPayloads, EVENTS } from '~/shared/events/event-types';

import { AchievementService } from '../achievement-service';
import { getDiverseCounts } from '../shared/diverse-counts';

export function registerVarietySeekerHandler(): void {
  eventBus.on(
    EVENTS.SCHEDULE_DISH_EATEN,
    async (payload: EventPayloads[typeof EVENTS.SCHEDULE_DISH_EATEN]) => {
      try {
        const { categoryCount } = await getDiverseCounts(payload.userId);
        if (categoryCount >= 5) {
          await AchievementService.unlock(
            payload.userId,
            ACHIEVEMENTS.VARIETY_SEEKER.key
          );
        }
      } catch (err) {
        console.error('[Achievement] VARIETY_SEEKER handler error', err);
      }
    }
  );
}
