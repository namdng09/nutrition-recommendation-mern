import mongoose, {
  InferSchemaType,
  type PaginateModel,
  Schema
} from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

import { DISH_CATEGORY } from '~/shared/constants/dish-category';

import { nutritionSchema } from './ingredient-model';

const dishSchema = new Schema(
  {
    user: {
      _id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      name: { type: String, required: true }
    },
    name: { type: String, required: true },
    description: { type: String },
    category: [
      { type: String, enum: Object.values(DISH_CATEGORY), required: true }
    ],
    calories: { type: Number },
    nutrition: { type: nutritionSchema },
    ingredients: [
      {
        ingredientId: { type: Schema.Types.ObjectId, ref: 'Ingredient' },
        name: { type: String, required: true },
        image: { type: String, required: true },
        description: { type: String },
        quantity: { type: Number, required: true },
        baseWeight: {
          value: { type: Number, required: true },
          unit: { type: String, default: 'g' }
        },
        units: [
          {
            unit: { type: String, required: true },
            quantity: { type: Number, required: true }
          }
        ]
      }
    ],
    instructions: [
      {
        step: { type: Number, required: true },
        description: { type: String, required: true }
      }
    ],
    image: { type: String },
    allergens: [{ type: String }],
    isActive: { type: Boolean, default: true },
    preparationTime: { type: Number },
    cookTime: { type: Number },
    servings: { type: Number, default: 1 },
    tags: [{ type: String }]
  },
  {
    timestamps: true
  }
);

dishSchema.plugin(mongoosePaginate);

dishSchema.index({ 'user._id': 1, isActive: 1 });
dishSchema.index({ category: 1 });
dishSchema.index({ allergens: 1 });
dishSchema.index({ tags: 1 });

export type Dish = InferSchemaType<typeof dishSchema>;

export const DishModel = mongoose.model(
  'Dish',
  dishSchema
) as PaginateModel<Dish>;
