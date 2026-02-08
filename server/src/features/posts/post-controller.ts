import type { Request, Response } from 'express';

import { ApiResponse } from '~/shared/utils';
import { parseQuery } from '~/shared/utils/query-parser';

import { PostService } from './post-service';

export const PostController = {
  createPost: async (req: Request, res: Response) => {
    const data = req.body;
    const images = req.files as Express.Multer.File[];
    const userId = req.user!._id.toString();
    const userName = req.user!.name;
    const userAvatar = req.user!.avatar || '';
    const userRole = req.user!.role;

    const result = await PostService.createPost(
      userId,
      userName,
      userAvatar,
      userRole,
      data,
      images
    );

    res
      .status(201)
      .json(ApiResponse.success('Tạo bài viết thành công', result));
  },

  viewPosts: async (req: Request, res: Response) => {
    const parsed = parseQuery(req.query);

    const result = await PostService.viewPosts(parsed);

    res
      .status(200)
      .json(ApiResponse.success('Lấy danh sách bài viết thành công', result));
  },

  viewPostDetail: async (req: Request, res: Response) => {
    const id = req.params.id;

    const result = await PostService.viewPostDetail(id);

    res
      .status(200)
      .json(ApiResponse.success('Lấy thông tin bài viết thành công', result));
  },

  viewPostBySlug: async (req: Request, res: Response) => {
    const slug = req.params.slug;

    const result = await PostService.viewPostBySlug(slug);

    res
      .status(200)
      .json(ApiResponse.success('Lấy thông tin bài viết thành công', result));
  },

  updatePost: async (req: Request, res: Response) => {
    const id = req.params.id;
    const data = req.body;
    const images = req.files as Express.Multer.File[];
    const userId = req.user!._id.toString();
    const userRole = req.user!.role;

    const result = await PostService.updatePost(
      id,
      userId,
      userRole,
      data,
      images
    );

    res
      .status(200)
      .json(ApiResponse.success('Cập nhật bài viết thành công', result));
  },

  deletePost: async (req: Request, res: Response) => {
    const id = req.params.id;
    const userId = req.user!._id.toString();
    const userRole = req.user!.role;

    await PostService.deletePost(id, userId, userRole);

    res.status(200).json(ApiResponse.success('Xóa bài viết thành công'));
  },

  likePost: async (req: Request, res: Response) => {
    const id = req.params.id;
    const userId = req.user!._id.toString();

    const result = await PostService.likePost(id, userId);

    res
      .status(200)
      .json(
        ApiResponse.success(
          result.liked ? 'Đã thích bài viết' : 'Đã bỏ thích bài viết',
          result
        )
      );
  },

  addComment: async (req: Request, res: Response) => {
    const id = req.params.id;
    const data = req.body;
    const userId = req.user!._id.toString();
    const userName = req.user!.name;
    const userAvatar = req.user!.avatar || '';

    const result = await PostService.addComment(
      id,
      userId,
      userName,
      userAvatar,
      data
    );

    res
      .status(201)
      .json(ApiResponse.success('Thêm bình luận thành công', result));
  },

  deleteComment: async (req: Request, res: Response) => {
    const postId = req.params.id;
    const commentId = req.params.commentId;
    const userId = req.user!._id.toString();
    const userRole = req.user!.role;

    await PostService.deleteComment(postId, commentId, userId, userRole);

    res.status(200).json(ApiResponse.success('Xóa bình luận thành công'));
  }
};
