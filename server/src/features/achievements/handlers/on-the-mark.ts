import { ACHIEVEMENTS } from '~/shared/constants/achievement';
import { eventBus } from '~/shared/events/event-bus';
import { type EventPayloads, EVENTS } from '~/shared/events/event-types';

import { AchievementService } from '../achievement-service';
import { getTargetProgress } from '../shared/target-progress';

export function registerOnTheMarkHandler(): void {
  eventBus.on(
    EVENTS.SCHEDULE_DISH_EATEN,
    async (payload: EventPayloads[typeof EVENTS.SCHEDULE_DISH_EATEN]) => {
      try {
        const { totalHitDays } = await getTargetProgress(payload.userId);
        if (totalHitDays >= 7) {
          await AchievementService.unlock(
            payload.userId,
            ACHIEVEMENTS.ON_THE_MARK.key
          );
        }
      } catch (err) {
        console.error('[Achievement] ON_THE_MARK handler error', err);
      }
    }
  );
}
