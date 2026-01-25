import mongoose, {
  InferSchemaType,
  type PaginateModel,
  Schema
} from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

import { POST_CATEGORY } from '~/shared/constants/post-category';

const postSchema = new Schema(
  {
    user: {
      _id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      name: { type: String, required: true },
      role: { type: String }
    },
    title: { type: String, required: true },
    content: { type: String, required: true },
    images: [{ type: String }],
    tags: [{ type: String }],
    likes: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date },
    category: {
      type: String,
      enum: Object.values(POST_CATEGORY)
    },
    slug: { type: String, unique: true, sparse: true }
  },
  {
    timestamps: true
  }
);

postSchema.plugin(mongoosePaginate);

postSchema.index({ 'user._id': 1, isPublished: 1 });
postSchema.index({ isPublished: 1, publishedAt: -1 });
postSchema.index({ category: 1, isPublished: 1 });
postSchema.index({ tags: 1 });
postSchema.index({ slug: 1 });

export type Post = InferSchemaType<typeof postSchema>;

export const PostModel = mongoose.model(
  'Post',
  postSchema
) as PaginateModel<Post>;
