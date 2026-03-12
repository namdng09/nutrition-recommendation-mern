import mongoose, {
  InferSchemaType,
  type PaginateModel,
  Schema
} from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

import { ACTIVITY_DIFFICULTY } from '~/shared/constants/activity-difficulty';
import { ACTIVITY_TYPE } from '~/shared/constants/activity-type';

const activitySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    tutorial: { type: String, default: '' },
    instructions: { type: String, required: true },
    difficulty: {
      type: String,
      enum: Object.values(ACTIVITY_DIFFICULTY),
      required: true
    },
    type: {
      type: String,
      enum: Object.values(ACTIVITY_TYPE),
      required: true
    },
    muscles: [
      {
        name: { type: String, required: true },
        image: { type: String, default: '' }
      }
    ],
    equipments: [
      {
        name: { type: String, required: true },
        image: { type: String, default: '' }
      }
    ],
    isActive: { type: Boolean, default: true }
  },
  {
    timestamps: true
  }
);

activitySchema.plugin(mongoosePaginate);

activitySchema.index({ name: 1 }, { unique: true });

export type Activity = InferSchemaType<typeof activitySchema>;

export const ActivityModel = mongoose.model(
  'Activity',
  activitySchema
) as PaginateModel<Activity>;
