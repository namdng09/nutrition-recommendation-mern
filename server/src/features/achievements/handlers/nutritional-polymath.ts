import { ACHIEVEMENTS } from '~/shared/constants/achievement';
import { eventBus } from '~/shared/events/event-bus';
import { type EventPayloads, EVENTS } from '~/shared/events/event-types';

import { AchievementService } from '../achievement-service';
import { getDiverseCounts } from '../shared/diverse-counts';

export function registerNutritionalPolymathHandler(): void {
  eventBus.on(
    EVENTS.SCHEDULE_DISH_EATEN,
    async (payload: EventPayloads[typeof EVENTS.SCHEDULE_DISH_EATEN]) => {
      try {
        const { ingredientCount } = await getDiverseCounts(payload.userId);
        if (ingredientCount >= 50) {
          await AchievementService.unlock(
            payload.userId,
            ACHIEVEMENTS.NUTRITIONAL_POLYMATH.key
          );
        }
      } catch (err) {
        console.error('[Achievement] NUTRITIONAL_POLYMATH handler error', err);
      }
    }
  );
}
