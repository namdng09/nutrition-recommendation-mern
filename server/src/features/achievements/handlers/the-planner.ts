import { ACHIEVEMENTS } from '~/shared/constants/achievement';
import { eventBus } from '~/shared/events/event-bus';
import { type EventPayloads, EVENTS } from '~/shared/events/event-types';

import { AchievementService } from '../achievement-service';
import { getFullCircleStats } from '../shared/full-circle-stats';

export function registerThePlannerHandler(): void {
  for (const event of [
    EVENTS.SCHEDULE_CREATED,
    EVENTS.SCHEDULE_DISH_EATEN,
    EVENTS.GROCERY_CREATED,
    EVENTS.GROCERY_INGREDIENT_PURCHASED
  ] as const) {
    eventBus.on(event, async (payload: EventPayloads[typeof event]) => {
      try {
        const { completedCircleDays } = await getFullCircleStats(
          payload.userId
        );
        if (completedCircleDays >= 5) {
          await AchievementService.unlock(
            payload.userId,
            ACHIEVEMENTS.THE_PLANNER.key
          );
        }
      } catch (err) {
        console.error('[Achievement] THE_PLANNER handler error', err);
      }
    });
  }
}
