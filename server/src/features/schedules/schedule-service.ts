import type { QueryOptions } from '@quarks/mongoose-query-parser';
import createHttpError from 'http-errors';

import { ROLE } from '~/shared/constants/role';
import { ScheduleModel, UserModel } from '~/shared/database/models';
import type { Schedule } from '~/shared/database/models/schedule-model';
import {
  buildPaginateOptions,
  type PaginateResponse,
  validateObjectId
} from '~/shared/utils';

import { CreateScheduleRequest, UpdateScheduleRequest } from './schedule-dto';

type ScheduleMeal = {
  dishes?: Array<{
    dishId?: string;
  }>;
};

const ensureValidDate = (value: Date) => {
  if (Number.isNaN(value.getTime())) {
    throw createHttpError(400, 'Định dạng ngày không hợp lệ');
  }
  return value;
};

const validateDishIds = (meals?: ScheduleMeal[]) => {
  if (!meals) return;

  meals.forEach(meal => {
    meal.dishes?.forEach(dish => {
      if (dish.dishId && !validateObjectId(dish.dishId)) {
        throw createHttpError(400, 'Định dạng ID món ăn không hợp lệ');
      }
    });
  });
};

export const ScheduleService = {
  createSchedule: async (
    userId: string,
    userName: string,
    data: CreateScheduleRequest
  ) => {
    if (!validateObjectId(userId)) {
      throw createHttpError(400, 'Định dạng ID người dùng không hợp lệ');
    }

    const date = ensureValidDate(data.date);
    const user = await UserModel.findById(userId);

    if (!user) {
      throw createHttpError(404, 'Không tìm thấy người dùng');
    }

    const meals = user.mealSettings.map(setting => ({
      mealType: setting.name,
      dishes: []
    }));

    const newSchedule = await ScheduleModel.create({
      user: {
        _id: userId,
        name: userName
      },
      date,
      dayOfWeek: data.dayOfWeek,
      isActive: data.isActive ?? true,
      meals,
      notes: data.notes
    });

    if (!newSchedule) {
      throw createHttpError(500, 'Tạo lịch ăn thất bại');
    }

    return newSchedule;
  },

  viewSchedules: async (
    userId: string,
    role: string | undefined,
    parsed: QueryOptions
  ): Promise<PaginateResponse<Schedule>> => {
    if (!validateObjectId(userId)) {
      throw createHttpError(400, 'Định dạng ID người dùng không hợp lệ');
    }

    const { filter } = parsed;
    const options = buildPaginateOptions(parsed);
    const scopedFilter: Record<string, unknown> =
      role === ROLE.ADMIN ? { ...filter } : { ...filter, 'user._id': userId };

    const result = await ScheduleModel.paginate(scopedFilter, options);

    return result as unknown as PaginateResponse<Schedule>;
  },

  viewScheduleDetail: async (
    id: string,
    userId: string,
    role: string | undefined
  ) => {
    if (!validateObjectId(id)) {
      throw createHttpError(400, 'Định dạng ID lịch ăn không hợp lệ');
    }

    const schedule = await ScheduleModel.findById(id);

    if (!schedule) {
      throw createHttpError(404, 'Không tìm thấy lịch ăn');
    }

    if (role !== ROLE.ADMIN && schedule.user?._id.toString() !== userId) {
      throw createHttpError(403, 'Bạn không có quyền xem lịch ăn này');
    }

    return schedule;
  },

  updateSchedule: async (
    id: string,
    userId: string,
    role: string | undefined,
    data: UpdateScheduleRequest
  ) => {
    if (!validateObjectId(id)) {
      throw createHttpError(400, 'Định dạng ID lịch ăn không hợp lệ');
    }

    const schedule = await ScheduleModel.findById(id);

    if (!schedule) {
      throw createHttpError(404, 'Không tìm thấy lịch ăn');
    }

    if (role !== ROLE.ADMIN && schedule.user?._id.toString() !== userId) {
      throw createHttpError(403, 'Bạn không có quyền cập nhật lịch ăn này');
    }

    if (data.date) {
      data.date = ensureValidDate(data.date);
    }

    validateDishIds(data.meals);

    const updatedSchedule = await ScheduleModel.findByIdAndUpdate(id, data, {
      new: true
    });

    if (!updatedSchedule) {
      throw createHttpError(404, 'Không tìm thấy lịch ăn');
    }

    return updatedSchedule;
  },

  deleteSchedule: async (
    id: string,
    userId: string,
    role: string | undefined
  ) => {
    if (!validateObjectId(id)) {
      throw createHttpError(400, 'Định dạng ID lịch ăn không hợp lệ');
    }

    const schedule = await ScheduleModel.findById(id);

    if (!schedule) {
      throw createHttpError(404, 'Không tìm thấy lịch ăn');
    }

    if (role !== ROLE.ADMIN && schedule.user?._id.toString() !== userId) {
      throw createHttpError(403, 'Bạn không có quyền xóa lịch ăn này');
    }

    await ScheduleModel.findByIdAndDelete(id);
  }
};
