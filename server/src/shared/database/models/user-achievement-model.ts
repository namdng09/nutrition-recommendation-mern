import mongoose, { InferSchemaType, Schema } from 'mongoose';

import { ACHIEVEMENT_KEYS } from '~/shared/constants/achievements';

const userAchievementSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    achievementKey: {
      type: String,
      enum: ACHIEVEMENT_KEYS,
      required: true
    },
    unlockedAt: { type: Date, required: true, default: Date.now },
    progress: { type: Schema.Types.Mixed, default: {} }
  },
  {
    timestamps: false
  }
);

userAchievementSchema.index({ userId: 1, achievementKey: 1 }, { unique: true });

export type UserAchievement = InferSchemaType<typeof userAchievementSchema>;

export const UserAchievementModel = mongoose.model(
  'UserAchievement',
  userAchievementSchema
);
