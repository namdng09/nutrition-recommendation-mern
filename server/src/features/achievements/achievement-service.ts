import {
  type AchievementKey,
  ACHIEVEMENTS,
  getUserTier
} from '~/shared/constants/achievements';
import { UserAchievementModel } from '~/shared/database/models';

export const AchievementService = {
  unlock: async (
    userId: string,
    achievementKey: AchievementKey
  ): Promise<void> => {
    await UserAchievementModel.updateOne(
      { userId, achievementKey },
      { $setOnInsert: { userId, achievementKey, unlockedAt: new Date() } },
      { upsert: true }
    );
  },

  getAllDefinitions: () => {
    return Object.values(ACHIEVEMENTS);
  },

  getUserAchievements: async (userId: string) => {
    const unlocked = await UserAchievementModel.find(
      { userId },
      { achievementKey: 1, unlockedAt: 1, _id: 0 }
    ).lean();

    const unlockedKeys = new Set(unlocked.map(r => r.achievementKey));
    const unlockedCount = unlockedKeys.size;
    const tier = getUserTier(unlockedCount);

    const achievements = Object.values(ACHIEVEMENTS).map(def => ({
      key: def.key,
      name: def.name,
      description: def.description,
      unlocked: unlockedKeys.has(def.key),
      unlockedAt:
        unlocked.find(r => r.achievementKey === def.key)?.unlockedAt ?? null
    }));

    return {
      achievements,
      unlockedCount,
      tier
    };
  }
};
