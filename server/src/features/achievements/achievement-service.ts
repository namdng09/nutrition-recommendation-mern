import { ACHIEVEMENTS } from '~/shared/constants/achievement';
import { UserModel } from '~/shared/database/models/user-model';

import { sendAchievementSseEvent } from './achievement-sse';

export const AchievementService = {
  unlock: async (userId: string, achievementKey: string): Promise<void> => {
    const result = await UserModel.updateOne(
      { _id: userId, 'achievements.key': { $ne: achievementKey } },
      {
        $push: { achievements: { key: achievementKey, unlockedAt: new Date() } }
      }
    );

    if (result.modifiedCount === 0) return;

    const achievementDefinition = Object.values(ACHIEVEMENTS).find(
      achievement => achievement.key === achievementKey
    );
    if (!achievementDefinition) return;

    sendAchievementSseEvent(userId, {
      type: 'achievement_unlocked',
      achievement: {
        key: achievementDefinition.key,
        name: achievementDefinition.name,
        description: achievementDefinition.description
      }
    });
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
