import type { Request, Response } from 'express';

import { ApiResponse } from '~/shared/utils';
import { parseQuery } from '~/shared/utils/query-parser';

import { UserService } from './user-service';

export const UserController = {
  createUser: async (req: Request, res: Response) => {
    const data = req.body;

    const result = await UserService.createUser(data);

    res
      .status(201)
      .json(ApiResponse.success('User created successfully', result));
  },

  viewUsers: async (req: Request, res: Response) => {
    const parsed = parseQuery(req.query);

    const result = await UserService.viewUsers(parsed);

    res
      .status(200)
      .json(ApiResponse.success('Users retrieved successfully', result));
  },

  viewProfile: async (req: Request, res: Response) => {
    const id = req.user?.id;

    const result = await UserService.viewProfile(id);

    res
      .status(200)
      .json(ApiResponse.success('Profile retrieved successfully', result));
  },

  onboardUser: async (req: Request, res: Response) => {
    const id = req.user?.id;
    const data = req.body;

    const result = await UserService.onboardUser(id, data);

    res
      .status(200)
      .json(ApiResponse.success('Onboarding completed successfully', result));
  },

  calculateNutritionTarget: async (req: Request, res: Response) => {
    const data = req.body;

    const result = await UserService.calculateNutritionTarget(data);

    res
      .status(200)
      .json(
        ApiResponse.success('Nutrition target calculated successfully', result)
      );
  },

  updateProfile: async (req: Request, res: Response) => {
    const id = req.user?.id;
    const data = req.body;
    const avatar = req.file;

    const result = await UserService.updateProfile(id, data, avatar);

    res
      .status(200)
      .json(ApiResponse.success('Profile updated successfully', result));
  },

  viewUserDetail: async (req: Request, res: Response) => {
    const id = req.params.id;

    const result = await UserService.viewUserDetail(id);

    res
      .status(200)
      .json(ApiResponse.success('User retrieved successfully', result));
  },

  updateUser: async (req: Request, res: Response) => {
    const id = req.params.id;
    const data = req.body;
    const currentUserId = req.user?._id.toString();

    const result = await UserService.updateUser(id, data, currentUserId);

    res
      .status(200)
      .json(ApiResponse.success('User updated successfully', result));
  },

  deleteUser: async (req: Request, res: Response) => {
    const id = req.params.id;
    const currentUserId = req.user?._id.toString();

    const result = await UserService.deleteUser(id, currentUserId);

    res
      .status(200)
      .json(ApiResponse.success('User deleted successfully', result));
  },

  deleteBulk: async (req: Request, res: Response) => {
    const { ids } = req.body;
    const currentUserId = req.user?._id.toString();

    const result = await UserService.deleteBulk(ids, currentUserId);

    res
      .status(200)
      .json(
        ApiResponse.success(
          `${result.deletedCount} user(s) deleted successfully`,
          result
        )
      );
  },

  addFavoriteDish: async (req: Request, res: Response) => {
    const userId = req.user?._id.toString();
    const { dishId } = req.body;

    const result = await UserService.addFavoriteDish(userId, dishId);

    res
      .status(200)
      .json(ApiResponse.success('Favorite dish added successfully', result));
  },

  removeFavoriteDish: async (req: Request, res: Response) => {
    const userId = req.user?._id.toString();
    const { dishId } = req.body;

    const result = await UserService.removeFavoriteDish(userId, dishId);

    res
      .status(200)
      .json(ApiResponse.success('Favorite dish removed successfully', result));
  },

  addFavoriteIngredient: async (req: Request, res: Response) => {
    const userId = req.user?._id.toString();
    const { ingredientId } = req.body;

    const result = await UserService.addFavoriteIngredient(
      userId,
      ingredientId
    );

    res
      .status(200)
      .json(
        ApiResponse.success('Favorite ingredient added successfully', result)
      );
  },

  removeFavoriteIngredient: async (req: Request, res: Response) => {
    const userId = req.user?._id.toString();
    const { ingredientId } = req.body;

    const result = await UserService.removeFavoriteIngredient(
      userId,
      ingredientId
    );

    res
      .status(200)
      .json(
        ApiResponse.success('Favorite ingredient removed successfully', result)
      );
  },

  addFavoriteCollection: async (req: Request, res: Response) => {
    const userId = req.user?._id.toString();
    const { collectionId } = req.body;

    const result = await UserService.addFavoriteCollection(
      userId,
      collectionId
    );

    res
      .status(200)
      .json(
        ApiResponse.success('Favorite collection added successfully', result)
      );
  },

  removeFavoriteCollection: async (req: Request, res: Response) => {
    const userId = req.user?._id.toString();
    const { collectionId } = req.body;

    const result = await UserService.removeFavoriteCollection(
      userId,
      collectionId
    );

    res
      .status(200)
      .json(
        ApiResponse.success('Favorite collection removed successfully', result)
      );
  },

  addBlockDish: async (req: Request, res: Response) => {
    const userId = req.user?._id.toString();
    const { dishId } = req.body;

    const result = await UserService.addBlockDish(userId, dishId);

    res
      .status(200)
      .json(ApiResponse.success('Blocked dish added successfully', result));
  },

  removeBlockDish: async (req: Request, res: Response) => {
    const userId = req.user?._id.toString();
    const { dishId } = req.body;

    const result = await UserService.removeBlockDish(userId, dishId);

    res
      .status(200)
      .json(ApiResponse.success('Blocked dish removed successfully', result));
  },

  addBlockIngredient: async (req: Request, res: Response) => {
    const userId = req.user?._id.toString();
    const { ingredientId } = req.body;

    const result = await UserService.addBlockIngredient(userId, ingredientId);

    res
      .status(200)
      .json(
        ApiResponse.success('Blocked ingredient added successfully', result)
      );
  },

  removeBlockIngredient: async (req: Request, res: Response) => {
    const userId = req.user?._id.toString();
    const { ingredientId } = req.body;

    const result = await UserService.removeBlockIngredient(
      userId,
      ingredientId
    );

    res
      .status(200)
      .json(
        ApiResponse.success('Blocked ingredient removed successfully', result)
      );
  }
};
