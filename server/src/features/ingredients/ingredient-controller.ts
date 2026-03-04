import type { Request, Response } from 'express';

import { ApiResponse } from '~/shared/utils';
import { parseQuery } from '~/shared/utils/query-parser';

import { IngredientService } from './ingredient-service';

export const IngredientController = {
  createIngredient: async (req: Request, res: Response) => {
    const data = req.body;
    const image = req.file;

    const result = await IngredientService.createIngredient(data, image);

    res
      .status(201)
      .json(ApiResponse.success('Tạo nguyên liệu thành công', result));
  },

  viewIngredients: async (req: Request, res: Response) => {
    const parsed = parseQuery(req.query);
    const userId = req.user?._id.toString();

    const result = await IngredientService.viewIngredients(parsed, userId);

    res
      .status(200)
      .json(
        ApiResponse.success('Lấy danh sách nguyên liệu thành công', result)
      );
  },

  viewIngredientDetail: async (req: Request, res: Response) => {
    const id = req.params.id;
    const userId = req.user?._id.toString();

    const result = await IngredientService.viewIngredientDetail(id, userId);

    res
      .status(200)
      .json(
        ApiResponse.success('Lấy thông tin nguyên liệu thành công', result)
      );
  },

  updateIngredient: async (req: Request, res: Response) => {
    const id = req.params.id;
    const data = req.body;
    const image = req.file;

    const result = await IngredientService.updateIngredient(id, data, image);

    res
      .status(200)
      .json(ApiResponse.success('Cập nhật nguyên liệu thành công', result));
  },

  deleteIngredient: async (req: Request, res: Response) => {
    const id = req.params.id;

    await IngredientService.deleteIngredient(id);

    res.status(200).json(ApiResponse.success('Xóa nguyên liệu thành công'));
  },

  deleteBulk: async (req: Request, res: Response) => {
    const { ids } = req.body;

    const result = await IngredientService.deleteBulk(ids);

    res
      .status(200)
      .json(
        ApiResponse.success(`Đã xóa ${result.deletedCount} nguyên liệu`, result)
      );
  }
};
