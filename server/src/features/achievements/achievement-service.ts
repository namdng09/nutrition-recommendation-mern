import { ACHIEVEMENTS } from '~/shared/constants/achievement';
import { UserModel } from '~/shared/database/models/user-model';

export const AchievementService = {
  unlock: async (userId: string, achievementKey: string): Promise<void> => {
    await UserModel.updateOne(
      { _id: userId, 'achievements.key': { $ne: achievementKey } },
      {
        $push: { achievements: { key: achievementKey, unlockedAt: new Date() } }
      }
    );
  },

  getAllDefinitions: () => {
    return Object.values(ACHIEVEMENTS);
  },

  getUserAchievements: async (userId: string) => {
    const user = await UserModel.findById(userId, 'achievements').lean();
    const unlockedKeys = new Set((user?.achievements ?? []).map(r => r.key));
    const unlockedCount = unlockedKeys.size;

    const achievements = Object.values(ACHIEVEMENTS).map(def => ({
      key: def.key,
      name: def.name,
      description: def.description,
      unlocked: unlockedKeys.has(def.key),
      unlockedAt:
        (user?.achievements ?? []).find(r => r.key === def.key)?.unlockedAt ??
        null
    }));

    return {
      achievements,
      unlockedCount
    };
  }
};
