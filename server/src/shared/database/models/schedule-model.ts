import mongoose, {
  InferSchemaType,
  type PaginateModel,
  Schema
} from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

import { DAY_OF_WEEK } from '~/shared/constants/day-of-week';

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
            calories: { type: Number },
            servings: { type: Number, default: 1 },
            image: { type: String },
            isEaten: { type: Boolean, default: false }
          }
        ]
      }
    ],
    notes: { type: String }
  },
  {
    timestamps: true
  }
);

scheduleSchema.plugin(mongoosePaginate);

scheduleSchema.index({ 'user._id': 1, date: 1 }, { unique: true });
scheduleSchema.index({ date: 1 });

export type Schedule = InferSchemaType<typeof scheduleSchema>;

export const ScheduleModel = mongoose.model(
  'Schedule',
  scheduleSchema
) as PaginateModel<Schedule>;
