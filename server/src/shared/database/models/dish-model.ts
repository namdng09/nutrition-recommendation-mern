import mongoose, {
  InferSchemaType,
  type PaginateModel,
  Schema
} from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

import { ALLERGEN } from '~/shared/constants/allergen';
import { DISH_CATEGORY } from '~/shared/constants/dish-category';
import { UNIT } from '~/shared/constants/unit';

import { nutrientSchema } from './ingredient-model';

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
        nutrients: { type: nutrientSchema },
        allergens: [{ type: String, enum: Object.values(ALLERGEN) }],
        baseUnit: {
          amount: { type: Number, required: true },
          unit: { type: String, default: UNIT.GRAM, required: true }
        },
        units: [
          {
            value: { type: Number, required: true },
            quantity: { type: Number, required: true },
            unit: { type: String, required: true },
            isDefault: { type: Boolean, required: true }
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
    isActive: { type: Boolean, default: true },
    isPublic: { type: Boolean, default: false },
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
dishSchema.index({ categories: 1 });
dishSchema.index({ allergens: 1 });
dishSchema.index({ tags: 1 });

export type Dish = InferSchemaType<typeof dishSchema>;

export const DishModel = mongoose.model(
  'Dish',
  dishSchema
) as PaginateModel<Dish>;
