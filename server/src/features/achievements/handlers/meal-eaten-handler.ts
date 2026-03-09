import mongoose from 'mongoose';

import { ACHIEVEMENTS } from '~/shared/constants/achievements';
import { ScheduleModel } from '~/shared/database/models';
import { eventBus } from '~/shared/events/event-bus';
import { EVENTS } from '~/shared/events/event-types';

import { AchievementService } from '../achievement-service';

const MEAL_MILESTONES = [
  { count: 100, key: ACHIEVEMENTS.MEAL_LOGGER_100.key },
  { count: 30, key: ACHIEVEMENTS.MEAL_LOGGER_30.key },
  { count: 10, key: ACHIEVEMENTS.MEAL_LOGGER_10.key },
  { count: 1, key: ACHIEVEMENTS.FIRST_MEAL_LOGGED.key }
] as const;

export function registerMealEatenHandler() {
  eventBus.on(EVENTS.SCHEDULE_DISH_EATEN, async ({ userId }) => {
    try {
      const result = await ScheduleModel.aggregate([
        {
          $match: {
            'user._id': mongoose.Types.ObjectId.createFromHexString(userId)
          }
        },
        { $unwind: '$meals' },
        { $unwind: '$meals.dishes' },
        { $match: { 'meals.dishes.isEaten': true } },
        { $count: 'total' }
      ]);

      const totalEaten: number = result[0]?.total ?? 0;

      for (const milestone of MEAL_MILESTONES) {
        if (totalEaten >= milestone.count) {
          await AchievementService.unlock(userId, milestone.key);
        }
      }
    } catch (err) {
      console.error('[Achievement] schedule:dish_eaten handler error', err);
    }
  });
}
