import mongoose, { InferSchemaType, Schema } from 'mongoose';

import { ACHIEVEMENT_CATEGORY } from '~/shared/constants/achievement-category';

const achievementSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    category: {
      type: String,
      enum: Object.values(ACHIEVEMENT_CATEGORY),
      required: true
    },
    icon: { type: String, required: true }
  },
  {
    timestamps: true
  }
);

export type Achievement = InferSchemaType<typeof achievementSchema>;

export const AchievementModel = mongoose.model(
  'Achievement',
  achievementSchema
);
