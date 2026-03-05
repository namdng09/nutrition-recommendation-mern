import type { QueryOptions } from '@quarks/mongoose-query-parser';
import createHttpError from 'http-errors';
import { type HydratedDocument } from 'mongoose';

import { ROLE } from '~/shared/constants/role';
import type { Post, PostComment } from '~/shared/database/models/post-model';
import { PostModel } from '~/shared/database/models/post-model';
import {
  buildPaginateOptions,
  deleteImage,
  type PaginateResponse,
  toObjectId,
  uploadImage,
  validateObjectId
} from '~/shared/utils';

import type {
  CreateCommentRequest,
  CreatePostRequest,
  UpdatePostRequest
} from './post-dto';

export const PostService = {
  createPost: async (
    userId: string,
    userName: string,
    userAvatar: string,
    userRole: string,
    data: CreatePostRequest,
    images?: Express.Multer.File[]
  ) => {
    const slug = generateSlug(data.title);

    const existingPost = await PostModel.findOne({ slug });
    if (existingPost)
      throw createHttpError(400, 'Bài viết với tiêu đề này đã tồn tại');

    const newPost = await PostModel.create({
      author: {
        _id: userId,
        name: userName,
        avatar: userAvatar || '',
        role: userRole
      },
      title: data.title,
      content: data.content,
      tags: data.tags || [],
      category: data.category,
      isPublished: data.isPublished ?? false,
      publishedAt: data.isPublished ? new Date() : undefined,
      slug
    });

    if (!newPost) throw createHttpError(500, 'Tạo bài viết thất bại');

    if (images && images.length > 0) {
      newPost.images = await savePostImages(newPost._id.toString(), images);
      await newPost.save();
    }

    return newPost;
  },

  viewPosts: async (parsed: QueryOptions): Promise<PaginateResponse<Post>> => {
    const { filter } = parsed;
    const options = buildPaginateOptions(parsed);
    const result = await PostModel.paginate(filter, options);
    return result as unknown as PaginateResponse<Post>;
  },

  viewPostDetail: async (id: string) => {
    if (!validateObjectId(id))
      throw createHttpError(400, 'ID bài viết không hợp lệ');

    const post = await PostModel.findById(id);
    if (!post) throw createHttpError(404, 'Không tìm thấy bài viết');

    await incrementViews(post);
    return post;
  },

  viewPostBySlug: async (slug: string) => {
    const post = await PostModel.findOne({ slug, isPublished: true });
    if (!post) throw createHttpError(404, 'Không tìm thấy bài viết');

    await incrementViews(post);
    return post;
  },

  updatePost: async (
    id: string,
    userId: string,
    userRole: string,
    data: UpdatePostRequest,
    images?: Express.Multer.File[]
  ) => {
    if (!validateObjectId(id))
      throw createHttpError(400, 'ID bài viết không hợp lệ');

    const post = await PostModel.findById(id);
    if (!post) throw createHttpError(404, 'Không tìm thấy bài viết');

    checkPostPermission(post, userId, userRole, 'cập nhật');

    if (data.title && data.title !== post.title) {
      const newSlug = generateSlug(data.title);
      const existingPost = await PostModel.findOne({
        slug: newSlug,
        _id: { $ne: id }
      });
      if (existingPost)
        throw createHttpError(400, 'Bài viết với tiêu đề này đã tồn tại');
      post.slug = newSlug;
    }

    applyPostFields(post, data);

    if (images && images.length > 0) {
      await deletePostImages(post._id.toString(), post.images?.length ?? 0);
      post.images = await savePostImages(post._id.toString(), images);
    }

    await post.save();
    return post;
  },

  deletePost: async (id: string, userId: string, userRole: string) => {
    if (!validateObjectId(id))
      throw createHttpError(400, 'ID bài viết không hợp lệ');

    const post = await PostModel.findById(id);
    if (!post) throw createHttpError(404, 'Không tìm thấy bài viết');

    checkPostPermission(post, userId, userRole, 'xóa');

    await deletePostImages(post._id.toString(), post.images?.length ?? 0);
    await PostModel.findByIdAndDelete(id);
  },

  likePost: async (id: string, userId: string) => {
    if (!validateObjectId(id))
      throw createHttpError(400, 'ID bài viết không hợp lệ');

    const post = await PostModel.findById(id, { likes: 1 });
    if (!post) throw createHttpError(404, 'Không tìm thấy bài viết');

    const alreadyLiked = post.likes.some(like => like.toString() === userId);
    const userObjectId = toObjectId(userId);

    await PostModel.findByIdAndUpdate(
      id,
      alreadyLiked
        ? { $pull: { likes: userObjectId } }
        : { $addToSet: { likes: userObjectId } }
    );

    return {
      liked: !alreadyLiked,
      likesCount: alreadyLiked ? post.likes.length - 1 : post.likes.length + 1
    };
  },

  addComment: async (
    id: string,
    userId: string,
    userName: string,
    userAvatar: string,
    data: CreateCommentRequest
  ) => {
    if (!validateObjectId(id))
      throw createHttpError(400, 'ID bài viết không hợp lệ');

    const post = await PostModel.findById(id);
    if (!post) throw createHttpError(404, 'Không tìm thấy bài viết');

    const comment: PostComment = {
      author: {
        _id: toObjectId(userId),
        name: userName,
        avatar: userAvatar || ''
      },
      content: data.content,
      createdAt: new Date()
    };

    post.comments.push(comment);
    await post.save();

    return comment;
  },

  deleteComment: async (
    postId: string,
    commentId: string,
    userId: string,
    userRole: string
  ) => {
    if (!validateObjectId(postId))
      throw createHttpError(400, 'ID bài viết không hợp lệ');

    if (!validateObjectId(commentId))
      throw createHttpError(400, 'ID bình luận không hợp lệ');

    const post = await PostModel.findById(postId);
    if (!post) throw createHttpError(404, 'Không tìm thấy bài viết');

    const commentIndex = post.comments.findIndex(
      comment => comment._id?.toString() === commentId
    );
    if (commentIndex === -1)
      throw createHttpError(404, 'Không tìm thấy bình luận');

    const comment = post.comments[commentIndex] as PostComment;
    const isCommentAuthor = comment.author?._id?.toString() === userId;
    const isPostAuthor = post.author?._id.toString() === userId;
    const isAdmin = userRole === ROLE.ADMIN;

    if (!isCommentAuthor && !isPostAuthor && !isAdmin) {
      throw createHttpError(403, 'Bạn không có quyền xóa bình luận này');
    }

    post.comments.splice(commentIndex, 1);
    await post.save();
  }
};

async function savePostImages(
  postId: string,
  images: Express.Multer.File[]
): Promise<string[]> {
  const imageUrls: string[] = [];

  for (let i = 0; i < images.length; i++) {
    const uploadResult = await uploadImage(images[i].buffer, `${postId}-${i}`);
    if (uploadResult.success && uploadResult.data) {
      imageUrls.push(uploadResult.data.secure_url);
    } else {
      throw createHttpError(500, 'Tải ảnh lên thất bại');
    }
  }

  return imageUrls;
}

async function deletePostImages(postId: string, count: number): Promise<void> {
  for (let i = 0; i < count; i++) {
    await deleteImage(`${postId}-${i}`);
  }
}

function applyPostFields(
  post: HydratedDocument<Post>,
  data: UpdatePostRequest
): void {
  if (data.title) post.title = data.title;
  if (data.content) post.content = data.content;
  if (data.tags !== undefined) post.tags = data.tags;
  if (data.category) post.category = data.category;

  if (data.isPublished !== undefined) {
    post.isPublished = data.isPublished;
    if (data.isPublished && !post.publishedAt) {
      post.publishedAt = new Date();
    }
  }
}

function checkPostPermission(
  post: HydratedDocument<Post>,
  userId: string,
  userRole: string,
  action: string
): void {
  const isAuthor = post.author?._id.toString() === userId;
  const isAdmin = userRole === ROLE.ADMIN;
  if (!isAuthor && !isAdmin) {
    throw createHttpError(403, `Bạn không có quyền ${action} bài viết này`);
  }
}

async function incrementViews(post: HydratedDocument<Post>): Promise<void> {
  post.views = (post.views || 0) + 1;
  await post.save();
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}
