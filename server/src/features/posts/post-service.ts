import type { QueryOptions } from '@quarks/mongoose-query-parser';
import createHttpError from 'http-errors';

import { ROLE } from '~/shared/constants/role';
import type { Post } from '~/shared/database/models/post-model';
import { PostModel } from '~/shared/database/models/post-model';
import {
  buildPaginateOptions,
  deleteImage,
  type PaginateResponse,
  uploadImage,
  validateObjectId
} from '~/shared/utils';

import {
  CreateCommentRequest,
  CreatePostRequest,
  UpdatePostRequest
} from './post-dto';

const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

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

    // Check if slug already exists
    const existingPost = await PostModel.findOne({ slug });
    if (existingPost) {
      throw createHttpError(400, 'Bài viết với tiêu đề này đã tồn tại');
    }

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

    if (!newPost) {
      throw createHttpError(500, 'Tạo bài viết thất bại');
    }

    if (images && images.length > 0) {
      const imageUrls: string[] = [];

      for (let i = 0; i < images.length; i++) {
        const uploadResult = await uploadImage(
          images[i].buffer,
          `${newPost._id.toString()}-${i}`
        );

        if (uploadResult.success && uploadResult.data) {
          imageUrls.push(uploadResult.data.secure_url);
        } else {
          throw createHttpError(500, 'Tải ảnh lên thất bại');
        }
      }

      newPost.images = imageUrls;
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
    if (!validateObjectId(id)) {
      throw createHttpError(400, 'ID bài viết không hợp lệ');
    }

    const post = await PostModel.findById(id);

    if (!post) {
      throw createHttpError(404, 'Không tìm thấy bài viết');
    }

    // Increment views
    post.views = (post.views || 0) + 1;
    await post.save();

    return post;
  },

  viewPostBySlug: async (slug: string) => {
    const post = await PostModel.findOne({ slug, isPublished: true });

    if (!post) {
      throw createHttpError(404, 'Không tìm thấy bài viết');
    }

    // Increment views
    post.views = (post.views || 0) + 1;
    await post.save();

    return post;
  },

  updatePost: async (
    id: string,
    userId: string,
    userRole: string,
    data: UpdatePostRequest,
    images?: Express.Multer.File[]
  ) => {
    if (!validateObjectId(id)) {
      throw createHttpError(400, 'ID bài viết không hợp lệ');
    }

    const post = await PostModel.findById(id);

    if (!post) {
      throw createHttpError(404, 'Không tìm thấy bài viết');
    }

    // Check permission
    const isAuthor = post.author?._id.toString() === userId;
    const isAdmin = userRole === ROLE.ADMIN;

    if (!isAuthor && !isAdmin) {
      throw createHttpError(403, 'Bạn không có quyền cập nhật bài viết này');
    }

    // Update slug if title changed
    if (data.title && data.title !== post.title) {
      const newSlug = generateSlug(data.title);
      const existingPost = await PostModel.findOne({
        slug: newSlug,
        _id: { $ne: id }
      });
      if (existingPost) {
        throw createHttpError(400, 'Bài viết với tiêu đề này đã tồn tại');
      }
      post.slug = newSlug;
    }

    // Update fields
    if (data.title) post.title = data.title;
    if (data.content) post.content = data.content;
    if (data.tags !== undefined) post.tags = data.tags;
    if (data.category) post.category = data.category;

    // Update publish status
    if (data.isPublished !== undefined) {
      post.isPublished = data.isPublished;
      if (data.isPublished && !post.publishedAt) {
        post.publishedAt = new Date();
      }
    }

    if (images && images.length > 0) {
      // Delete old images
      if (post.images && post.images.length > 0) {
        for (let i = 0; i < post.images.length; i++) {
          await deleteImage(`${post._id.toString()}-${i}`);
        }
      }

      // Upload new images
      const imageUrls: string[] = [];

      for (let i = 0; i < images.length; i++) {
        const uploadResult = await uploadImage(
          images[i].buffer,
          `${post._id.toString()}-${i}`
        );

        if (uploadResult.success && uploadResult.data) {
          imageUrls.push(uploadResult.data.secure_url);
        } else {
          throw createHttpError(500, 'Tải ảnh lên thất bại');
        }
      }

      post.images = imageUrls;
    }

    await post.save();

    return post;
  },

  deletePost: async (id: string, userId: string, userRole: string) => {
    if (!validateObjectId(id)) {
      throw createHttpError(400, 'ID bài viết không hợp lệ');
    }

    const post = await PostModel.findById(id);

    if (!post) {
      throw createHttpError(404, 'Không tìm thấy bài viết');
    }

    // Check permission
    const isAuthor = post.author?._id.toString() === userId;
    const isAdmin = userRole === ROLE.ADMIN;

    if (!isAuthor && !isAdmin) {
      throw createHttpError(403, 'Bạn không có quyền xóa bài viết này');
    }

    // Delete images
    if (post.images && post.images.length > 0) {
      for (let i = 0; i < post.images.length; i++) {
        await deleteImage(`${post._id.toString()}-${i}`);
      }
    }

    await PostModel.findByIdAndDelete(id);
  },

  likePost: async (id: string, userId: string) => {
    if (!validateObjectId(id)) {
      throw createHttpError(400, 'ID bài viết không hợp lệ');
    }

    const post = await PostModel.findById(id);

    if (!post) {
      throw createHttpError(404, 'Không tìm thấy bài viết');
    }

    const userIdObj = userId as any;
    const likeIndex = post.likes.findIndex(like => like.toString() === userId);

    if (likeIndex > -1) {
      // Unlike
      post.likes.splice(likeIndex, 1);
    } else {
      // Like
      post.likes.push(userIdObj);
    }

    await post.save();

    return {
      liked: likeIndex === -1,
      likesCount: post.likes.length
    };
  },

  addComment: async (
    id: string,
    userId: string,
    userName: string,
    userAvatar: string,
    data: CreateCommentRequest
  ) => {
    if (!validateObjectId(id)) {
      throw createHttpError(400, 'ID bài viết không hợp lệ');
    }

    const post = await PostModel.findById(id);

    if (!post) {
      throw createHttpError(404, 'Không tìm thấy bài viết');
    }

    const comment = {
      author: {
        _id: userId as any,
        name: userName,
        avatar: userAvatar || ''
      },
      content: data.content,
      createdAt: new Date()
    };

    post.comments.push(comment as any);
    await post.save();

    return comment;
  },

  deleteComment: async (
    postId: string,
    commentId: string,
    userId: string,
    userRole: string
  ) => {
    if (!validateObjectId(postId)) {
      throw createHttpError(400, 'ID bài viết không hợp lệ');
    }

    const post = await PostModel.findById(postId);

    if (!post) {
      throw createHttpError(404, 'Không tìm thấy bài viết');
    }

    const commentIndex = post.comments.findIndex(
      (comment: any) => comment._id.toString() === commentId
    );

    if (commentIndex === -1) {
      throw createHttpError(404, 'Không tìm thấy bình luận');
    }

    const comment = post.comments[commentIndex] as any;
    const isCommentAuthor = comment.author._id.toString() === userId;
    const isPostAuthor = post.author?._id.toString() === userId;
    const isAdmin = userRole === ROLE.ADMIN;

    if (!isCommentAuthor && !isPostAuthor && !isAdmin) {
      throw createHttpError(403, 'Bạn không có quyền xóa bình luận này');
    }

    post.comments.splice(commentIndex, 1);
    await post.save();
  }
};
