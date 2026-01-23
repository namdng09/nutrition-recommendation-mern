import mongoose, { InferSchemaType, Schema } from 'mongoose';

export const MEAL_TYPE = {
  BREAKFAST: 'breakfast',
  LUNCH: 'lunch',
  DINNER: 'dinner',
  SNACK: 'snack'
} as const;

const mealSchema = new Schema(
  {
    user: {
      _id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      name: { type: String, required: true }
    },
    name: { type: String, required: true },
    mealType: {
      type: String,
      enum: Object.values(MEAL_TYPE),
      required: true
    },
    dishes: [
      {
        dishId: { type: Schema.Types.ObjectId, ref: 'Dish' },
        name: { type: String, required: true },
        category: { type: String },
        price: { type: Number },
        calories: { type: Number },
        image: { type: String }
      }
    ],
    totalCalories: { type: Number },
    totalPrice: { type: Number },
    isActive: { type: Boolean, default: true }
  },
  {
    timestamps: true
  }
);

mealSchema.index({ 'user._id': 1, mealType: 1 });

export type Meal = InferSchemaType<typeof mealSchema>;

export const MealModel = mongoose.model<Meal>('Meal', mealSchema);
