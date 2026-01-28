import mongoose, {
  InferSchemaType,
  type PaginateModel,
  Schema
} from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

import { POST_CATEGORY } from '~/shared/constants/post-category';

const postSchema = new Schema(
  {
    author: {
      _id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      name: { type: String, required: true },
      avatar: { type: String, default: '' },
      role: { type: String }
    },
    title: { type: String, required: true },
    content: { type: String, required: true },
    images: [{ type: String }],
    tags: [{ type: String }],
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    views: { type: Number, default: 0 },
    comments: [
      {
        author: {
          _id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
          name: { type: String, required: true },
          avatar: { type: String, default: '' }
        },
        content: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
      }
    ],
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

postSchema.index({ 'author._id': 1, isPublished: 1 });
postSchema.index({ isPublished: 1, publishedAt: -1 });
postSchema.index({ category: 1, isPublished: 1 });
postSchema.index({ tags: 1 });

export type Post = InferSchemaType<typeof postSchema>;

export const PostModel = mongoose.model(
  'Post',
  postSchema
) as PaginateModel<Post>;
