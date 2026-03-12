import mongoose, {
  InferSchemaType,
  type PaginateModel,
  Schema
} from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

import {
  WORKOUT_COUNTER_TYPE,
  WORKOUT_DISTANCE_UNIT
} from '~/shared/constants/workout-counter-type';

const distanceTargetSchema = new Schema(
  {
    value: { type: Number, required: true, min: 0.1 },
    unit: {
      type: String,
      enum: Object.values(WORKOUT_DISTANCE_UNIT),
      required: true
    }
  },
  { _id: false }
);

const weightAndRepsTargetSchema = new Schema(
  {
    weight: { type: Number, min: 0 },
    reps: { type: Number, required: true, min: 1 },
    sets: { type: Number, min: 1, default: 1 }
  },
  { _id: false }
);

const durationTargetSchema = new Schema(
  {
    seconds: { type: Number, required: true, min: 1 }
  },
  { _id: false }
);

const workoutExerciseSchema = new Schema(
  {
    exerciseId: {
      type: Schema.Types.ObjectId,
      ref: 'Exercise',
      required: true
    },
    exerciseName: { type: String, required: true },
    exerciseType: { type: String, required: true },
    exerciseTutorial: { type: String, default: '' },
    counterType: {
      type: String,
      enum: Object.values(WORKOUT_COUNTER_TYPE),
      required: true
    },
    distanceTarget: {
      type: distanceTargetSchema,
      required: function (this: { counterType: string }) {
        return this.counterType === WORKOUT_COUNTER_TYPE.DISTANCE;
      }
    },
    weightAndRepsTarget: {
      type: weightAndRepsTargetSchema,
      required: function (this: { counterType: string }) {
        return this.counterType === WORKOUT_COUNTER_TYPE.WEIGHT_AND_REPS;
      }
    },
    durationTarget: {
      type: durationTargetSchema,
      required: function (this: { counterType: string }) {
        return this.counterType === WORKOUT_COUNTER_TYPE.DURATION;
      }
    },
    note: { type: String, default: '' },
    order: { type: Number, required: true, min: 1 }
  },
  { _id: false }
);

const workoutSchema = new Schema(
  {
    user: {
      _id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      name: { type: String, required: true }
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    exercises: {
      type: [workoutExerciseSchema],
      default: [],
      validate: {
        validator: (items: unknown[]) => items.length > 0,
        message: 'Workout phải có ít nhất một bài tập'
      }
    },
    isActive: { type: Boolean, default: true }
  },
  {
    timestamps: true
  }
);

workoutSchema.plugin(mongoosePaginate);

workoutSchema.index({ 'user._id': 1, name: 1 }, { unique: true });
workoutSchema.index({ 'exercises.exerciseId': 1 });

export type Workout = InferSchemaType<typeof workoutSchema>;

export const WorkoutModel = mongoose.model(
  'Workout',
  workoutSchema
) as PaginateModel<Workout>;
