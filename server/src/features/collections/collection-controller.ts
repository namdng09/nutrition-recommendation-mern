import type { Request, Response } from 'express';

import { ApiResponse } from '~/shared/utils';
import { parseQuery } from '~/shared/utils/query-parser';

import { CollectionService } from './collection-service';

export const CollectionController = {
  createCollection: async (req: Request, res: Response) => {
    const data = req.body;
    const image = req.file;
    const userId = req.user?._id.toString();
    const userName = req.user?.name;

    if (!userId || !userName) {
      return res.status(401).json(ApiResponse.failed('Chưa đăng nhập'));
    }

    const result = await CollectionService.createCollection(
      userId,
      userName,
      data,
      image
    );

    res
      .status(201)
      .json(ApiResponse.success('Tạo bộ sưu tập thành công', result));
  },

  viewCollections: async (req: Request, res: Response) => {
    const parsed = parseQuery(req.query);

    const result = await CollectionService.viewCollections(parsed);

    res
      .status(200)
      .json(ApiResponse.success('Lấy danh sách bộ sưu tập thành công', result));
  },

  viewCollectionDetail: async (req: Request, res: Response) => {
    const id = req.params.id;

    const result = await CollectionService.viewCollectionDetail(id);

    res
      .status(200)
      .json(ApiResponse.success('Lấy thông tin bộ sưu tập thành công', result));
  },

  updateCollection: async (req: Request, res: Response) => {
    const id = req.params.id;
    const data = req.body;
    const image = req.file;
    const userId = req.user?._id.toString();

    if (!userId) {
      return res.status(401).json(ApiResponse.failed('Unauthorized'));
    }

    const result = await CollectionService.updateCollection(
      id,
      userId,
      data,
      image
    );

    res
      .status(200)
      .json(ApiResponse.success('Cập nhật bộ sưu tập thành công', result));
  },

  deleteCollection: async (req: Request, res: Response) => {
    const id = req.params.id;
    const userId = req.user?._id.toString();

    if (!userId) {
      return res.status(401).json(ApiResponse.failed('Unauthorized'));
    }

    await CollectionService.deleteCollection(id, userId);

    res.status(200).json(ApiResponse.success('Xóa bộ sưu tập thành công'));
  },

  addDishToCollection: async (req: Request, res: Response) => {
    const id = req.params.id;
    const data = req.body;
    const userId = req.user?._id.toString();

    if (!userId) {
      return res.status(401).json(ApiResponse.failed('Unauthorized'));
    }

    const result = await CollectionService.addDishToCollection(
      id,
      userId,
      data
    );

    res
      .status(200)
      .json(
        ApiResponse.success('Thêm món ăn vào bộ sưu tập thành công', result)
      );
  },

  removeDishFromCollection: async (req: Request, res: Response) => {
    const id = req.params.id;
    const data = req.body;
    const userId = req.user?._id.toString();

    if (!userId) {
      return res.status(401).json(ApiResponse.failed('Unauthorized'));
    }

    const result = await CollectionService.removeDishFromCollection(
      id,
      userId,
      data
    );

    res
      .status(200)
      .json(
        ApiResponse.success('Xóa món ăn khỏi bộ sưu tập thành công', result)
      );
  },

  followCollection: async (req: Request, res: Response) => {
    const id = req.params.id;

    const result = await CollectionService.followCollection(id);

    res
      .status(200)
      .json(ApiResponse.success('Theo dõi bộ sưu tập thành công', result));
  },

  unfollowCollection: async (req: Request, res: Response) => {
    const id = req.params.id;

    const result = await CollectionService.unfollowCollection(id);

    res
      .status(200)
      .json(ApiResponse.success('Bỏ theo dõi bộ sưu tập thành công', result));
  }
};
