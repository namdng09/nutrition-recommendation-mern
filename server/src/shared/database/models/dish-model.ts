import mongoose, {
  InferSchemaType,
  type PaginateModel,
  Schema
} from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

import { DISH_CATEGORY } from '~/shared/constants/dish-category';
import { UNIT } from '~/shared/constants/unit';

const nutritionMacrosSchema = new Schema(
  {
    carbs: { type: Number },
    protein: { type: Number },
    fat: { type: Number },
    netCarbs: { type: Number },
    fiber: { type: Number }
  },
  { _id: false }
);

const nutritionMineralsSchema = new Schema(
  {
    sodium: { type: Number },
    calcium: { type: Number },
    iron: { type: Number },
    potassium: { type: Number },
    magnesium: { type: Number },
    phosphorus: { type: Number },
    zinc: { type: Number },
    selenium: { type: Number }
  },
  { _id: false }
);

const nutritionVitaminsSchema = new Schema(
  {
    vitaminA: { type: Number },
    vitaminD: { type: Number },
    vitaminC: { type: Number },
    vitaminE: { type: Number },
    vitaminK: { type: Number },
    vitaminB1: { type: Number },
    vitaminB2: { type: Number },
    vitaminB3: { type: Number },
    vitaminB5: { type: Number },
    vitaminB6: { type: Number },
    vitaminB9: { type: Number },
    vitaminB12: { type: Number }
  },
  { _id: false }
);

const nutritionCompoundsSchema = new Schema(
  {
    cholesterol: { type: Number },
    caffeine: { type: Number },
    choline: { type: Number },
    lycopene: { type: Number },
    betaCarotene: { type: Number }
  },
  { _id: false }
);

const nutritionSchema = new Schema(
  {
    units: {
      calories: {
        type: String,
        enum: Object.values(UNIT),
        default: UNIT.KILOCALORIE
      },
      macronutrients: {
        type: String,
        enum: Object.values(UNIT),
        default: UNIT.GRAM
      },
      minerals: {
        type: String,
        enum: Object.values(UNIT),
        default: UNIT.MILLIGRAM
      },
      vitamins: {
        type: String,
        enum: Object.values(UNIT),
        default: UNIT.MICROGRAM
      },
      otherCompounds: {
        type: String,
        enum: Object.values(UNIT),
        default: UNIT.MILLIGRAM
      }
    },
    calories: { type: Number },
    macronutrients: { type: nutritionMacrosSchema },
    minerals: { type: nutritionMineralsSchema },
    vitamins: { type: nutritionVitaminsSchema },
    otherCompounds: { type: nutritionCompoundsSchema }
  },
  { _id: false }
);

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
            unit: { type: Number, required: true },
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
