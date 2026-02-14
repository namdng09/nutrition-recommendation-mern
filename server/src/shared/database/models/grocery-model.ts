import mongoose, {
  InferSchemaType,
  type PaginateModel,
  Schema
} from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const grocerySchema = new Schema(
  {
    user: {
      _id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      name: { type: String, required: true }
    },
    name: { type: String, required: true },
    date: [{ type: Date }],
    ingredients: [
      {
        ingredientId: { type: Schema.Types.ObjectId, ref: 'Ingredient' },
        name: { type: String, required: true },
        image: { type: String, required: true },
        isPurchased: { type: Boolean, default: false }
      }
    ],
    notes: { type: String }
  },
  {
    timestamps: true
  }
);

grocerySchema.plugin(mongoosePaginate);

grocerySchema.index({ 'user._id': 1, date: -1 });

export type Grocery = InferSchemaType<typeof grocerySchema>;

export const GroceryModel = mongoose.model(
  'Grocery',
  grocerySchema
) as PaginateModel<Grocery>;
