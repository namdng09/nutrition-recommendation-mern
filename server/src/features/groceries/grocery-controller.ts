import type { Request, Response } from 'express';

import { ApiResponse } from '~/shared/utils';
import { parseQuery } from '~/shared/utils/query-parser';

import { GroceryService } from './grocery-service';

export const GroceryController = {
  createGrocery: async (req: Request, res: Response) => {
    const data = req.body;
    const userId = req.user!._id.toString();
    const userName = req.user!.name;

    const result = await GroceryService.createGrocery(userId, userName, data);

    res
      .status(201)
      .json(ApiResponse.success('Tạo danh sách mua sắm thành công', result));
  },

  viewGroceries: async (req: Request, res: Response) => {
    const userId = req.user!._id.toString();
    const parsed = parseQuery(req.query);

    const result = await GroceryService.viewGroceries(userId, parsed);

    res
      .status(200)
      .json(ApiResponse.success('Lấy danh sách mua sắm thành công', result));
  },

  viewGroceryDetail: async (req: Request, res: Response) => {
    const id = req.params.id;
    const userId = req.user!._id.toString();

    const result = await GroceryService.viewGroceryDetail(userId, id);

    res
      .status(200)
      .json(
        ApiResponse.success(
          'Lấy thông tin danh sách mua sắm thành công',
          result
        )
      );
  },

  updateGrocery: async (req: Request, res: Response) => {
    const id = req.params.id;
    const data = req.body;
    const userId = req.user!._id.toString();

    const result = await GroceryService.updateGrocery(userId, id, data);

    res
      .status(200)
      .json(
        ApiResponse.success('Cập nhật danh sách mua sắm thành công', result)
      );
  },

  deleteGrocery: async (req: Request, res: Response) => {
    const id = req.params.id;
    const userId = req.user!._id.toString();

    await GroceryService.deleteGrocery(userId, id);

    res
      .status(200)
      .json(ApiResponse.success('Xóa danh sách mua sắm thành công'));
  },

  addIngredientsInGrocery: async (req: Request, res: Response) => {
    const groceryId = req.params.id;
    const data = req.body;
    const userId = req.user!._id.toString();

    const result = await GroceryService.addIngredientsInGrocery(
      userId,
      groceryId,
      data
    );

    res
      .status(200)
      .json(
        ApiResponse.success('Thêm nguyên liệu vào danh sách thành công', result)
      );
  },

  updateIngredientInGrocery: async (req: Request, res: Response) => {
    const groceryId = req.params.id;
    const ingredientId = req.params.ingredientId;
    const data = req.body;
    const userId = req.user!._id.toString();

    const result = await GroceryService.updateIngredientInGrocery(
      userId,
      groceryId,
      ingredientId,
      data
    );

    res
      .status(200)
      .json(ApiResponse.success('Cập nhật nguyên liệu thành công', result));
  },

  removeIngredientsInGrocery: async (req: Request, res: Response) => {
    const groceryId = req.params.id;
    const data = req.body;
    const userId = req.user!._id.toString();

    const result = await GroceryService.removeIngredientsInGrocery(
      userId,
      groceryId,
      data
    );

    res
      .status(200)
      .json(
        ApiResponse.success('Xóa nguyên liệu khỏi danh sách thành công', result)
      );
  }
};
