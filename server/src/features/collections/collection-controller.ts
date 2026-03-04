import type { Request, Response } from 'express';

import { ApiResponse } from '~/shared/utils';
import { parseQuery } from '~/shared/utils/query-parser';

import { CollectionService } from './collection-service';

export const CollectionController = {
  createCollection: async (req: Request, res: Response) => {
    const data = req.body;
    const image = req.file;
    const userId = req.user!._id.toString();
    const userName = req.user!.name;

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
    const userId = req.user?._id.toString();

    const result = await CollectionService.viewCollections(parsed, userId);

    res
      .status(200)
      .json(ApiResponse.success('Lấy danh sách bộ sưu tập thành công', result));
  },

  viewCollectionDetail: async (req: Request, res: Response) => {
    const id = req.params.id;
    const userId = req.user?._id.toString();

    const result = await CollectionService.viewCollectionDetail(id, userId);

    res
      .status(200)
      .json(ApiResponse.success('Lấy thông tin bộ sưu tập thành công', result));
  },

  updateCollection: async (req: Request, res: Response) => {
    const id = req.params.id;
    const data = req.body;
    const image = req.file;
    const userId = req.user!._id.toString();

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
    const userId = req.user!._id.toString();
    const userRole = req.user!.role;

    await CollectionService.deleteCollection(id, userId, userRole);

    res.status(200).json(ApiResponse.success('Xóa bộ sưu tập thành công'));
  },

  deleteBulk: async (req: Request, res: Response) => {
    const { ids } = req.body;
    const userId = req.user!._id.toString();
    const userRole = req.user!.role;

    const result = await CollectionService.deleteBulk(ids, userId, userRole);

    res
      .status(200)
      .json(ApiResponse.success('Xóa các bộ sưu tập thành công', result));
  },

  addDishToCollection: async (req: Request, res: Response) => {
    const id = req.params.id;
    const data = req.body;
    const userId = req.user!._id.toString();

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
    const userId = req.user!._id.toString();

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
  }
};
