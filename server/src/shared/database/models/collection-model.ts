import mongoose, {
  InferSchemaType,
  type PaginateModel,
  Schema
} from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const collectionSchema = new Schema(
  {
    user: {
      _id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      name: { type: String, required: true }
    },
    name: { type: String, required: true },
    description: { type: String },
    image: { type: String },
    isPublic: { type: Boolean, default: false },
    dishes: [
      {
        dishId: { type: Schema.Types.ObjectId, ref: 'Dish' },
        name: { type: String, required: true },
        calories: { type: Number },
        image: { type: String },
        addedAt: { type: Date, default: Date.now }
      }
    ],
    followers: { type: Number, default: 0 },
    tags: [{ type: String }],
    slug: { type: String, unique: true, sparse: true }
  },
  {
    timestamps: true
  }
);

collectionSchema.plugin(mongoosePaginate);

collectionSchema.index({ 'user._id': 1, isPublic: 1 });
collectionSchema.index({ isPublic: 1, followers: -1 });
collectionSchema.index({ tags: 1 });

// Virtual for dish count
collectionSchema.virtual('dishCount').get(function () {
  return this.dishes.length;
});

export type Collection = InferSchemaType<typeof collectionSchema>;

export const CollectionModel = mongoose.model(
  'Collection',
  collectionSchema
) as PaginateModel<Collection>;
