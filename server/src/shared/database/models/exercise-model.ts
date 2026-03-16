import mongoose, {
  InferSchemaType,
  type PaginateModel,
  Schema
} from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

import { EXERCISE_DIFFICULTY } from '~/shared/constants/exercise-difficulty';
import { EXERCISE_TYPE } from '~/shared/constants/exercise-type';
import { WORKOUT_COUNTER_TYPE } from '~/shared/constants/workout-counter-type';

const exerciseSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    tutorial: { type: String, default: '' },
    instructions: { type: String, required: true },
    difficulty: {
      type: String,
      enum: Object.values(EXERCISE_DIFFICULTY),
      required: true
    },
    type: {
      type: String,
      enum: Object.values(EXERCISE_TYPE),
      required: true
    },
    logType: {
      type: String,
      enum: Object.values(WORKOUT_COUNTER_TYPE),
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

exerciseSchema.plugin(mongoosePaginate);

exerciseSchema.index({ name: 1 }, { unique: true });

export type Exercise = InferSchemaType<typeof exerciseSchema>;

export const ExerciseModel = mongoose.model(
  'Exercise',
  exerciseSchema
) as PaginateModel<Exercise>;
