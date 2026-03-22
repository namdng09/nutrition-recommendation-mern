import { ACHIEVEMENTS } from '~/shared/constants/achievement';
import { eventBus } from '~/shared/events/event-bus';
import { type EventPayloads, EVENTS } from '~/shared/events/event-types';

import { AchievementService } from '../achievement-service';
import { getTargetProgress } from '../shared/target-progress';

export function registerPhaseMasterHandler(): void {
  eventBus.on(
    EVENTS.SCHEDULE_DISH_EATEN,
    async (payload: EventPayloads[typeof EVENTS.SCHEDULE_DISH_EATEN]) => {
      try {
        const { totalHitDays } = await getTargetProgress(payload.userId);
        if (totalHitDays >= 30) {
          await AchievementService.unlock(
            payload.userId,
            ACHIEVEMENTS.PHASE_MASTER.key
          );
        }
      } catch (err) {
        console.error('[Achievement] PHASE_MASTER handler error', err);
      }
    }
  );
}
