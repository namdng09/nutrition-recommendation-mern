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
const ALL_ACHIEVEMENTS = Object.values(ACHIEVEMENTS);

describe('AchievementService.getUserAchievements (UC115)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('business logic', () => {
    it('should return full achievement list with empty unlock state for new user', async () => {
      mockFindById.mockReturnValue({
        lean: vi.fn().mockResolvedValue(null)
      } as any);

      const result = await AchievementService.getUserAchievements(USER_ID);

      expect(mockFindById).toHaveBeenCalledWith(USER_ID, 'achievements');
      expect(result.unlockedCount).toBe(0);
      expect(result.achievements).toHaveLength(ALL_ACHIEVEMENTS.length);
      expect(result.achievements.every(item => item.unlocked === false)).toBe(
        true
      );
      expect(result.achievements.every(item => item.unlockedAt === null)).toBe(
        true
      );
    });

    it('should mark unlocked achievements with matching unlock date', async () => {
      const plannerUnlockedAt = new Date('2024-01-15T00:00:00.000Z');
      const beaconUnlockedAt = new Date('2024-02-01T00:00:00.000Z');

      mockFindById.mockReturnValue({
        lean: vi.fn().mockResolvedValue({
          achievements: [
            {
              key: ACHIEVEMENTS.THE_PLANNER.key,
              unlockedAt: plannerUnlockedAt
            },
            {
              key: ACHIEVEMENTS.COMMUNITY_BEACON.key,
              unlockedAt: beaconUnlockedAt
            }
          ]
        })
      } as any);

      const result = await AchievementService.getUserAchievements(USER_ID);

      expect(result.unlockedCount).toBe(2);
      expect(result.achievements).toHaveLength(ALL_ACHIEVEMENTS.length);

      const plannerAchievement = result.achievements.find(
        a => a.key === ACHIEVEMENTS.THE_PLANNER.key
      );
      const beaconAchievement = result.achievements.find(
        a => a.key === ACHIEVEMENTS.COMMUNITY_BEACON.key
      );

      expect(plannerAchievement?.unlocked).toBe(true);
      expect(plannerAchievement?.unlockedAt).toEqual(plannerUnlockedAt);
      expect(beaconAchievement?.unlocked).toBe(true);
      expect(beaconAchievement?.unlockedAt).toEqual(beaconUnlockedAt);
    });
  });
});
