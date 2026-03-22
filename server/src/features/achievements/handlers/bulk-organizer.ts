import { ACHIEVEMENTS } from '~/shared/constants/achievement';
import { eventBus } from '~/shared/events/event-bus';
import { type EventPayloads, EVENTS } from '~/shared/events/event-types';

import { AchievementService } from '../achievement-service';
import { getGroceryStats } from '../shared/grocery-stats';

export function registerBulkOrganizerHandler(): void {
  for (const event of [
    EVENTS.GROCERY_CREATED,
    EVENTS.GROCERY_INGREDIENT_PURCHASED
  ] as const) {
    eventBus.on(event, async (payload: EventPayloads[typeof event]) => {
      try {
        const { totalPurchased } = await getGroceryStats(payload.userId);
        if (totalPurchased >= 100) {
          await AchievementService.unlock(
            payload.userId,
            ACHIEVEMENTS.BULK_ORGANIZER.key
          );
        }
      } catch (err) {
        console.error('[Achievement] BULK_ORGANIZER handler error', err);
      }
    });
  }
}
