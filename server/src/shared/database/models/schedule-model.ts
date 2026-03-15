import mongoose, {
  InferSchemaType,
  type PaginateModel,
  Schema
} from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

import { DAY_OF_WEEK } from '~/shared/constants/day-of-week';
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

const scheduleWorkoutExerciseSchema = new Schema(
  {
    exerciseId: {
      type: Schema.Types.ObjectId,
      ref: 'Exercise',
      required: true
    },
    exerciseName: { type: String, required: true },
    exerciseType: { type: String, required: true },
    exerciseTutorial: { type: String, default: '' },
    logType: {
      type: String,
      enum: Object.values(WORKOUT_COUNTER_TYPE),
      required: true
    },
    distanceTarget: {
      type: distanceTargetSchema,
      required: function (this: { logType: string }) {
        return this.logType === WORKOUT_COUNTER_TYPE.DISTANCE;
      }
    },
    weightAndRepsTarget: {
      type: weightAndRepsTargetSchema,
      required: function (this: { logType: string }) {
        return this.logType === WORKOUT_COUNTER_TYPE.WEIGHT_AND_REPS;
      }
    },
    durationTarget: {
      type: durationTargetSchema,
      required: function (this: { logType: string }) {
        return this.logType === WORKOUT_COUNTER_TYPE.DURATION;
      }
    },
    isCompleted: { type: Boolean, default: false }
  },
  { _id: false }
);

const scheduleSchema = new Schema(
  {
    user: {
      _id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      name: { type: String, required: true }
    },
    date: { type: Date, required: true },
    dayOfWeek: {
      type: String,
      enum: Object.values(DAY_OF_WEEK),
      required: true
    },
    meals: [
      {
        mealType: { type: String, required: true },
        notes: { type: String },
        dishes: [
          {
            dishId: { type: Schema.Types.ObjectId, ref: 'Dish' },
            name: { type: String, required: true },
            energy: { type: Number },
            servings: { type: Number, default: 1 },
            image: { type: String },
            isEaten: { type: Boolean, default: false }
          }
        ]
      }
    ],
    workout: {
      type: [scheduleWorkoutExerciseSchema],
      default: []
    },
    notes: { type: String }
  },
  {
    timestamps: true
  }
);

scheduleSchema.plugin(mongoosePaginate);

scheduleSchema.index({ 'user._id': 1, date: 1 }, { unique: true });
scheduleSchema.index({ date: 1 });
scheduleSchema.index({ 'workout.exerciseId': 1 });

export type Schedule = InferSchemaType<typeof scheduleSchema>;

export const ScheduleModel = mongoose.model(
  'Schedule',
  scheduleSchema
) as PaginateModel<Schedule>;
