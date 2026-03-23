import { afterEach, describe, expect, it, vi } from 'vitest';

import { AchievementService } from '~/features/achievements/achievement-service';
import { ACHIEVEMENTS } from '~/shared/constants/achievement';
import { UserModel } from '~/shared/database/models/user-model';

vi.mock('~/shared/database/models/user-model', () => ({
  UserModel: {
    findById: vi.fn()
  }
}));

const mockFindById = vi.mocked(UserModel.findById);

const USER_ID = 'user-123';

describe('AchievementService.getUserAchievements', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('business logic', () => {
    it('should return all achievements with no unlocks when user has no achievements', async () => {
      mockFindById.mockReturnValue({
        lean: vi.fn().mockResolvedValue(null)
      } as any);

      const result = await AchievementService.getUserAchievements(USER_ID);

      expect(result.unlockedCount).toBe(0);
      expect(result.achievements.every(item => item.unlocked === false)).toBe(
        true
      );
      expect(result.achievements.every(item => item.unlockedAt === null)).toBe(
        true
      );
    });

    it('should return all achievements with correct unlocked status and dates', async () => {
      const unlockedDate = new Date('2024-01-15');

      mockFindById.mockReturnValue({
        lean: vi.fn().mockResolvedValue({
          achievements: [
            {
              key: ACHIEVEMENTS.THE_PLANNER.key,
              unlockedAt: unlockedDate
            }
          ]
        })
      } as any);

      const result = await AchievementService.getUserAchievements(USER_ID);

      expect(result.unlockedCount).toBe(1);

      const plannerAchievement = result.achievements.find(
        a => a.key === ACHIEVEMENTS.THE_PLANNER.key
      );
      expect(plannerAchievement?.unlocked).toBe(true);
      expect(plannerAchievement?.unlockedAt).toEqual(unlockedDate);
    });
  });

  describe('system', () => {
    it('should propagate error when findById fails', async () => {
      mockFindById.mockImplementation(() => {
        throw new Error('findById failed');
      });

      await expect(
        AchievementService.getUserAchievements(USER_ID)
      ).rejects.toThrow('findById failed');
    });
  });
});
