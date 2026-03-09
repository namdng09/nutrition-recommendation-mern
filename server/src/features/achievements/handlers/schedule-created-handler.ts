import { ACHIEVEMENTS } from '~/shared/constants/achievements';
import { ScheduleModel } from '~/shared/database/models';
import { eventBus } from '~/shared/events/event-bus';
import { EVENTS } from '~/shared/events/event-types';

import { AchievementService } from '../achievement-service';

const SCHEDULE_MILESTONES = [
  { count: 10, key: ACHIEVEMENTS.SCHEDULE_PLANNER_10.key },
  { count: 1, key: ACHIEVEMENTS.FIRST_SCHEDULE.key }
] as const;

export function registerScheduleCreatedHandler() {
  eventBus.on(EVENTS.SCHEDULE_CREATED, async ({ userId }) => {
    try {
      const totalCount = await ScheduleModel.countDocuments({
        'user._id': userId
      });

      for (const milestone of SCHEDULE_MILESTONES) {
        if (totalCount >= milestone.count) {
          await AchievementService.unlock(userId, milestone.key);
        }
      }
    } catch (err) {
      console.error('[Achievement] schedule:created handler error', err);
    }
  });
}
