import mongoose, { InferSchemaType, Schema } from 'mongoose';

const userAchievementSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    achievementId: {
      type: Schema.Types.ObjectId,
      ref: 'Achievement',
      required: true
    }
  },
  {
    timestamps: true
  }
);

userAchievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true });

export type UserAchievement = InferSchemaType<typeof userAchievementSchema>;

export const UserAchievementModel = mongoose.model(
  'UserAchievement',
  userAchievementSchema
);
