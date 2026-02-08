import type { Request, Response } from 'express';

import { ApiResponse } from '~/shared/utils';
import { parseQuery } from '~/shared/utils/query-parser';

import { DishService } from './dish-service';

export const DishController = {
  createDish: async (req: Request, res: Response) => {
    const data = req.body;
    const image = req.file;
    const userId = req.user!._id.toString();
    const userName = req.user!.name;

    const result = await DishService.createDish(userId, userName, data, image);

    res.status(201).json(ApiResponse.success('Tạo món ăn thành công', result));
  },

  viewDishes: async (req: Request, res: Response) => {
    const parsed = parseQuery(req.query);

    const result = await DishService.viewDishes(parsed);

    res
      .status(200)
      .json(ApiResponse.success('Lấy danh sách món ăn thành công', result));
  },

  viewDishDetail: async (req: Request, res: Response) => {
    const id = req.params.id;

    const result = await DishService.viewDishDetail(id);

    res
      .status(200)
      .json(ApiResponse.success('Lấy thông tin món ăn thành công', result));
  },

  viewDishDetailNutrition: async (req: Request, res: Response) => {
    const id = req.params.id;

    const result = await DishService.viewDishDetailNutrition(id);

    res
      .status(200)
      .json(
        ApiResponse.success('Lấy chi tiết dinh dưỡng món ăn thành công', result)
      );
  },

  updateDish: async (req: Request, res: Response) => {
    const id = req.params.id;
    const data = req.body;
    const image = req.file;
    const userId = req.user!._id.toString();

    const result = await DishService.updateDish(id, userId, data, image);

    res
      .status(200)
      .json(ApiResponse.success('Cập nhật món ăn thành công', result));
  },

  deleteDish: async (req: Request, res: Response) => {
    const id = req.params.id;
    const userId = req.user!._id.toString();
    const userRole = req.user!.role;

    await DishService.deleteDish(id, userId, userRole);

    res.status(200).json(ApiResponse.success('Xóa món ăn thành công'));
  }
};
