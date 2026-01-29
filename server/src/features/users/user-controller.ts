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

    if (id === currentUserId && data.isActive === 'false') {
      return res
        .status(400)
        .json(ApiResponse.failed('Admin cannot deactivate own account'));
    }

    const result = await UserService.updateUser(id, data);

    res
      .status(200)
      .json(ApiResponse.success('User updated successfully', result));
  },

  deleteUser: async (req: Request, res: Response) => {
    const id = req.params.id;
    const currentUserId = req.user?._id.toString();

    if (id === currentUserId) {
      return res
        .status(400)
        .json(ApiResponse.failed('Admin cannot delete own account'));
    }

    const result = await UserService.deleteUser(id);

    res
      .status(200)
      .json(ApiResponse.success('User deleted successfully', result));
  },

  deleteBulk: async (req: Request, res: Response) => {
    const { ids } = req.body;
    const currentUserId = req.user?._id.toString();

    if (!Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json(ApiResponse.failed('Invalid user IDs provided'));
    }

    if (ids.includes(currentUserId)) {
      return res
        .status(400)
        .json(ApiResponse.failed('Cannot delete your own account'));
    }

    const result = await UserService.deleteBulk(ids);

    res
      .status(200)
      .json(
        ApiResponse.success(
          `${result.deletedCount} user(s) deleted successfully`,
          result
        )
      );
  }
};
