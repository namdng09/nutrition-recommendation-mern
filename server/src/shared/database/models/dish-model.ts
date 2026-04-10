import mongoose, {
  InferSchemaType,
  type PaginateModel,
  Schema
} from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

import { ALLERGEN } from '~/shared/constants/allergen';
import { DISH_CATEGORY } from '~/shared/constants/dish-category';
import { NUTRITION_FOCUS } from '~/shared/constants/nutrition-focus';
import { REVIEW_STATUS } from '~/shared/constants/review-status';
import { UNIT } from '~/shared/constants/unit';

import { nutritionSchema } from './ingredient-model';

const dishSchema = new Schema(
  {
    user: {
      _id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      name: { type: String, required: true }
    },
    name: { type: String, required: true },
    description: { type: String },
    categories: [
      { type: String, enum: Object.values(DISH_CATEGORY), required: true }
    ],
    ingredients: [
      {
        ingredientId: { type: Schema.Types.ObjectId, ref: 'Ingredient' },
        name: { type: String, required: true },
        image: { type: String },
        description: { type: String },
        allergens: [{ type: String, enum: Object.values(ALLERGEN) }],
        units: {
          type: [
            {
              quantity: { type: Number, required: true },
              unit: { type: String, required: true },
              isDefault: { type: Boolean, required: true }
            }
          ],
          validate: {
            validator: (units: Array<{ unit?: string }>) =>
              units?.some(unit => unit.unit === UNIT.GRAM),
            message: 'Each ingredient must include a gram unit in units.'
          }
        }
      }
    ],
    instructions: [
      {
        step: { type: Number, required: true },
        description: { type: String, required: true }
      }
    ],
    image: { type: String },
    nutrition: { type: nutritionSchema },
    isActive: { type: Boolean, default: true },
    isPublic: { type: Boolean, default: false },
    preparationTime: { type: Number },
    cookTime: { type: Number },
    servings: { type: Number, default: 1 },
    tags: [{ type: String }],
    nutritionFocus: [
      { type: String, enum: Object.values(NUTRITION_FOCUS), required: true }
    ],
    evaluation: {
      nutritionistId: { type: Schema.Types.ObjectId, ref: 'User' },
      rating: { type: Number, min: 1, max: 5 },
      feedback: { type: String },
      evaluatedAt: { type: Date },
      status: { type: String, enum: Object.values(REVIEW_STATUS) }
    }
  },
  {
    timestamps: true
  }
);

dishSchema.plugin(mongoosePaginate);

dishSchema.index({ 'user._id': 1, isActive: 1 });
dishSchema.index({ categories: 1 });
dishSchema.index({ 'ingredients.allergens': 1 });
dishSchema.index({ tags: 1 });

export type Dish = InferSchemaType<typeof dishSchema>;

export const DishModel = mongoose.model(
  'Dish',
  dishSchema
) as PaginateModel<Dish>;
