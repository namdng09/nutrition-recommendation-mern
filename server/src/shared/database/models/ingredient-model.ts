import mongoose, {
  InferSchemaType,
  type PaginateModel,
  Schema
} from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const ingredientSchema = new Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    unit: { type: String, required: true },
    caloriesPer100g: { type: Number, required: true },
    protein: { type: Number, required: true },
    carbs: { type: Number },
    fat: { type: Number },
    fiber: { type: Number },
    allergens: [{ type: String }],
    image: { type: String },
    isActive: { type: Boolean, default: true }
  },
  {
    timestamps: true
  }
);

ingredientSchema.plugin(mongoosePaginate);

ingredientSchema.index({ name: 1, category: 1 });
ingredientSchema.index({ allergens: 1 });

export type Ingredient = InferSchemaType<typeof ingredientSchema>;

export const IngredientModel = mongoose.model(
  'Ingredient',
  ingredientSchema
) as PaginateModel<Ingredient>;
