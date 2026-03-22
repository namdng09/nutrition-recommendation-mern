import { ACHIEVEMENTS } from '~/shared/constants/achievement';
import { eventBus } from '~/shared/events/event-bus';
import { type EventPayloads, EVENTS } from '~/shared/events/event-types';

import { AchievementService } from '../achievement-service';
import { getGroceryStats } from '../shared/grocery-stats';

export function registerKitchenManagerHandler(): void {
  for (const event of [
    EVENTS.GROCERY_CREATED,
    EVENTS.GROCERY_INGREDIENT_PURCHASED
  ] as const) {
    eventBus.on(event, async (payload: EventPayloads[typeof event]) => {
      try {
        const { completedCount } = await getGroceryStats(payload.userId);
        if (completedCount >= 10) {
          await AchievementService.unlock(
            payload.userId,
            ACHIEVEMENTS.KITCHEN_MANAGER.key
          );
        }
      } catch (err) {
        console.error('[Achievement] KITCHEN_MANAGER handler error', err);
      }
    });
  }
}
