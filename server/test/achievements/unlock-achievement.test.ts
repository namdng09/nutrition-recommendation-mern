import { afterEach, describe, expect, it, vi } from 'vitest';

import { AchievementService } from '~/features/achievements/achievement-service';
import { sendAchievementSseEvent } from '~/features/achievements/achievement-sse';
import { ACHIEVEMENTS } from '~/shared/constants/achievement';
import { UserModel } from '~/shared/database/models/user-model';

vi.mock('~/shared/database/models/user-model', () => ({
  UserModel: {
    updateOne: vi.fn()
  }
}));

vi.mock('~/features/achievements/achievement-sse', () => ({
  sendAchievementSseEvent: vi.fn()
}));

const mockUpdateOne = vi.mocked(UserModel.updateOne);
const mockSendAchievementSseEvent = vi.mocked(sendAchievementSseEvent);

const USER_ID = 'user-123';

describe('AchievementService.unlock', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('business logic', () => {
    it('should do nothing when user already has the achievement', async () => {
      mockUpdateOne.mockResolvedValue({ modifiedCount: 0 } as any);

      await AchievementService.unlock(USER_ID, ACHIEVEMENTS.THE_PLANNER.key);

      expect(mockUpdateOne).toHaveBeenCalledWith(
        {
          _id: USER_ID,
          'achievements.key': { $ne: ACHIEVEMENTS.THE_PLANNER.key }
        },
        {
          $push: {
            achievements: {
              key: ACHIEVEMENTS.THE_PLANNER.key,
              unlockedAt: expect.any(Date)
            }
          }
        }
      );
      expect(mockSendAchievementSseEvent).not.toHaveBeenCalled();
    });

    it('should do nothing when achievement is not existing', async () => {
      mockUpdateOne.mockResolvedValue({ modifiedCount: 1 } as any);

      await AchievementService.unlock(USER_ID, 'UNKNOWN_ACHIEVEMENT');

      expect(mockSendAchievementSseEvent).not.toHaveBeenCalled();
    });

    it('should emit SSE payload when unlock succeeds', async () => {
      mockUpdateOne.mockResolvedValue({ modifiedCount: 1 } as any);

      await AchievementService.unlock(USER_ID, ACHIEVEMENTS.THE_PLANNER.key);

      expect(mockSendAchievementSseEvent).toHaveBeenCalledWith(USER_ID, {
        type: 'achievement_unlocked',
        achievement: {
          key: ACHIEVEMENTS.THE_PLANNER.key,
          name: ACHIEVEMENTS.THE_PLANNER.name,
          description: ACHIEVEMENTS.THE_PLANNER.description
        }
      });
    });
  });
});
