import mongoose, {
  InferSchemaType,
  type PaginateModel,
  Schema
} from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

import { MEAL_TYPE } from '~/shared/constants/meal-type';

const scheduleSchema = new Schema(
  {
    user: {
      _id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      name: { type: String, required: true }
    },
    date: { type: Date, required: true },
    dayOfWeek: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    meals: [
      {
        mealType: {
          type: String,
          enum: Object.values(MEAL_TYPE),
          required: true
        },
        dishes: [
          {
            dishId: { type: Schema.Types.ObjectId, ref: 'Dish' },
            name: { type: String, required: true },
            calories: { type: Number },
            image: { type: String }
          }
        ]
      }
    ],
    totalCalories: { type: Number },
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
