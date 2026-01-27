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
      .json(ApiResponse.success('Ingredient created successfully', result));
  },

  viewIngredients: async (req: Request, res: Response) => {
    const parsed = parseQuery(req.query);

    const result = await IngredientService.viewIngredients(parsed);

    res
      .status(200)
      .json(ApiResponse.success('Ingredients retrieved successfully', result));
  },

  viewIngredientDetail: async (req: Request, res: Response) => {
    const id = req.params.id;

    const result = await IngredientService.viewIngredientDetail(id);

    res
      .status(200)
      .json(ApiResponse.success('Ingredient retrieved successfully', result));
  },

  updateIngredient: async (req: Request, res: Response) => {
    const id = req.params.id;
    const data = req.body;
    const image = req.file;

    const result = await IngredientService.updateIngredient(id, data, image);

    res
      .status(200)
      .json(ApiResponse.success('Ingredient updated successfully', result));
  },

  deleteIngredient: async (req: Request, res: Response) => {
    const id = req.params.id;

    await IngredientService.deleteIngredient(id);

    res
      .status(200)
      .json(ApiResponse.success('Ingredient deleted successfully'));
  },

  deleteBulk: async (req: Request, res: Response) => {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json(ApiResponse.failed('Invalid ingredient IDs provided'));
    }

    const result = await IngredientService.deleteBulk(ids);

    res
      .status(200)
      .json(
        ApiResponse.success(
          `${result.deletedCount} ingredient(s) deleted successfully`,
          result
        )
      );
  }
};
