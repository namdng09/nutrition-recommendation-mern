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
      .json(ApiResponse.success('Người dùng được tạo thành công', result));
  },

  viewUsers: async (req: Request, res: Response) => {
    const parsed = parseQuery(req.query);

    const result = await UserService.viewUsers(parsed);

    res
      .status(200)
      .json(ApiResponse.success('Người dùng được lấy thành công', result));
  },

  pendingCertificatesCount: async (_req: Request, res: Response) => {
    const count = await UserService.pendingCertificatesCount();

    res
      .status(200)
      .json(
        ApiResponse.success(
          'Số lượng chứng chỉ chờ duyệt được lấy thành công',
          { count }
        )
      );
  },

  viewProfile: async (req: Request, res: Response) => {
    const id = req.user?._id.toString();

    const result = await UserService.viewProfile(id);

    res
      .status(200)
      .json(ApiResponse.success('Hồ sơ được lấy thành công', result));
  },

  onboardUser: async (req: Request, res: Response) => {
    const id = req.user?._id.toString();
    const data = req.body;

    const result = await UserService.onboardUser(id, data);

    res
      .status(200)
      .json(ApiResponse.success('Onboarding hoàn thành thành công', result));
  },

  calculateNutritionTarget: async (req: Request, res: Response) => {
    const data = req.body;

    const result = await UserService.calculateNutritionTarget(data);

    res
      .status(200)
      .json(
        ApiResponse.success(
          'Mục tiêu dinh dưỡng được tính toán thành công',
          result
        )
      );
  },

  updateProfile: async (req: Request, res: Response) => {
    const id = req.user?.id;
    const data = req.body;
    const avatar = req.file;

    const result = await UserService.updateProfile(id, data, avatar);

    res
      .status(200)
      .json(ApiResponse.success('Hồ sơ được cập nhật thành công', result));
  },

  viewUserDetail: async (req: Request, res: Response) => {
    const id = req.params.id;

    const result = await UserService.viewUserDetail(id);

    res
      .status(200)
      .json(ApiResponse.success('Người dùng được lấy thành công', result));
  },

  viewNutritionistProfile: async (req: Request, res: Response) => {
    const id = req.params.id;

    const result = await UserService.viewNutritionistProfile(id);

    res
      .status(200)
      .json(
        ApiResponse.success(
          'Lấy hồ sơ chuyên gia dinh dưỡng thành công',
          result
        )
      );
  },

  updateUser: async (req: Request, res: Response) => {
    const id = req.params.id;
    const data = req.body;
    const currentUserId = req.user?._id.toString();

    const result = await UserService.updateUser(id, data, currentUserId);

    res
      .status(200)
      .json(ApiResponse.success('Người dùng được cập nhật thành công', result));
  },

  deleteUser: async (req: Request, res: Response) => {
    const id = req.params.id;
    const currentUserId = req.user?._id.toString();

    const result = await UserService.deleteUser(id, currentUserId);

    res
      .status(200)
      .json(ApiResponse.success('Người dùng được xóa thành công', result));
  },

  deleteBulk: async (req: Request, res: Response) => {
    const { ids } = req.body;
    const currentUserId = req.user?._id.toString();

    const result = await UserService.deleteBulk(ids, currentUserId);

    res
      .status(200)
      .json(
        ApiResponse.success(
          `${result.deletedCount} người dùng được xóa thành công`,
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
      .json(
        ApiResponse.success('Món ăn yêu thích được thêm thành công', result)
      );
  },

  removeFavoriteDish: async (req: Request, res: Response) => {
    const userId = req.user?._id.toString();
    const { dishId } = req.body;

    const result = await UserService.removeFavoriteDish(userId, dishId);

    res
      .status(200)
      .json(
        ApiResponse.success('Món ăn yêu thích được xóa thành công', result)
      );
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
        ApiResponse.success(
          'Nguyên liệu yêu thích được thêm thành công',
          result
        )
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
        ApiResponse.success('Nguyên liệu yêu thích được xóa thành công', result)
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
        ApiResponse.success('Bộ sưu tập yêu thích được thêm thành công', result)
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
        ApiResponse.success('Bộ sưu tập yêu thích được xóa thành công', result)
      );
  },

  addBlockDish: async (req: Request, res: Response) => {
    const userId = req.user?._id.toString();
    const { dishId } = req.body;

    const result = await UserService.addBlockDish(userId, dishId);

    res
      .status(200)
      .json(ApiResponse.success('Món ăn bị chặn được thêm thành công', result));
  },

  removeBlockDish: async (req: Request, res: Response) => {
    const userId = req.user?._id.toString();
    const { dishId } = req.body;

    const result = await UserService.removeBlockDish(userId, dishId);

    res
      .status(200)
      .json(ApiResponse.success('Món ăn bị chặn được xóa thành công', result));
  },

  addBlockIngredient: async (req: Request, res: Response) => {
    const userId = req.user?._id.toString();
    const { ingredientId } = req.body;

    const result = await UserService.addBlockIngredient(userId, ingredientId);

    res
      .status(200)
      .json(
        ApiResponse.success('Nguyên liệu bị chặn được thêm thành công', result)
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
        ApiResponse.success('Nguyên liệu bị chặn được xóa thành công', result)
      );
  },

  uploadCertificate: async (req: Request, res: Response) => {
    const userId = req.user?._id.toString();
    const data = req.body;
    const files = req.files as Record<string, Express.Multer.File[]>;
    const file =
      files?.['certificate']?.[0] ??
      (req.file as Express.Multer.File | undefined);

    if (!file) {
      res.status(400).json(ApiResponse.error('Vui lòng tải lên tệp chứng chỉ'));
      return;
    }

    const result = await UserService.uploadCertificate(userId, data, file);

    res
      .status(200)
      .json(ApiResponse.success('Tải lên chứng chỉ thành công', result));
  },

  approveCertificate: async (req: Request, res: Response) => {
    const userId = req.params.id;

    const result = await UserService.approveCertificate(userId);

    res
      .status(200)
      .json(ApiResponse.success('Phê duyệt chứng chỉ thành công', result));
  },

  rejectCertificate: async (req: Request, res: Response) => {
    const userId = req.params.id;
    const data = req.body;

    const result = await UserService.rejectCertificate(userId, data);

    res
      .status(200)
      .json(ApiResponse.success('Từ chối chứng chỉ thành công', result));
  }
};
