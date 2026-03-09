import { ACHIEVEMENTS } from '~/shared/constants/achievements';
import { DishModel } from '~/shared/database/models';
import { eventBus } from '~/shared/events/event-bus';
import { EVENTS } from '~/shared/events/event-types';

import { AchievementService } from '../achievement-service';

const DISH_MILESTONES = [
  { count: 20, key: ACHIEVEMENTS.DISH_CREATOR_20.key },
  { count: 10, key: ACHIEVEMENTS.DISH_CREATOR_10.key },
  { count: 5, key: ACHIEVEMENTS.DISH_CREATOR_5.key },
  { count: 1, key: ACHIEVEMENTS.FIRST_DISH.key }
] as const;

export function registerDishCreatedHandler() {
  eventBus.on(EVENTS.DISH_CREATED, async ({ userId }) => {
    try {
      const totalCount = await DishModel.countDocuments({ 'user._id': userId });

      for (const milestone of DISH_MILESTONES) {
        if (totalCount >= milestone.count) {
          await AchievementService.unlock(userId, milestone.key);
        }
      }
    } catch (err) {
      console.error('[Achievement] dish:created handler error', err);
    }
  });
}
