import { ACHIEVEMENTS } from '~/shared/constants/achievement';
import { eventBus } from '~/shared/events/event-bus';
import { type EventPayloads, EVENTS } from '~/shared/events/event-types';

import { AchievementService } from '../achievement-service';
import { getDiverseCounts } from '../shared/diverse-counts';

export function registerIngredientExplorerHandler(): void {
  eventBus.on(
    EVENTS.SCHEDULE_DISH_EATEN,
    async (payload: EventPayloads[typeof EVENTS.SCHEDULE_DISH_EATEN]) => {
      try {
        const { ingredientCount } = await getDiverseCounts(payload.userId);
        if (ingredientCount >= 20) {
          await AchievementService.unlock(
            payload.userId,
            ACHIEVEMENTS.INGREDIENT_EXPLORER.key
          );
        }
      } catch (err) {
        console.error('[Achievement] INGREDIENT_EXPLORER handler error', err);
      }
    }
  );
}
