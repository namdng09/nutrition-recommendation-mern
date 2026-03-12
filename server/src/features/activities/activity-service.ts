import type { QueryOptions } from '@quarks/mongoose-query-parser';
import createHttpError from 'http-errors';
import type { HydratedDocument, PaginateResult } from 'mongoose';

import { ActivityModel } from '~/shared/database/models';
import type { Activity } from '~/shared/database/models/activity-model';
import {
  buildPaginateOptions,
  deleteActivityTutorial,
  uploadActivityTutorial,
  validateObjectId
} from '~/shared/utils';

import type {
  CreateActivityRequest,
  UpdateActivityRequest
} from './activity-dto';

export const ActivityService = {
  createActivity: async (
    data: CreateActivityRequest,
    tutorial?: Express.Multer.File
  ) => {
    const existingActivity = await ActivityModel.findOne({ name: data.name });

    if (existingActivity) {
      throw createHttpError(409, 'Hoạt động với tên này đã tồn tại');
    }

    const newActivity = await ActivityModel.create(data);

    if (tutorial) {
      await replaceActivityTutorial(newActivity, tutorial);
    }

    return newActivity;
  },

  viewActivities: async (
    parsed: QueryOptions
  ): Promise<PaginateResult<Activity>> => {
    const { filter } = parsed;
    const options = buildPaginateOptions(parsed);

    const result = await ActivityModel.paginate(filter, options);

    return result;
  },

  viewActivityDetail: async (id: string) => {
    if (!validateObjectId(id)) {
      throw createHttpError(400, 'Định dạng ID hoạt động không hợp lệ');
    }

    const activity = await ActivityModel.findById(id);

    if (!activity) {
      throw createHttpError(404, 'Không tìm thấy hoạt động');
    }

    return activity;
  },

  updateActivity: async (
    id: string,
    data: UpdateActivityRequest,
    tutorial?: Express.Multer.File
  ) => {
    if (!validateObjectId(id)) {
      throw createHttpError(400, 'Định dạng ID hoạt động không hợp lệ');
    }

    if (data.name) {
      const existingActivity = await ActivityModel.findOne({
        name: data.name,
        _id: { $ne: id }
      });

      if (existingActivity) {
        throw createHttpError(409, 'Hoạt động với tên này đã tồn tại');
      }
    }

    const updatedActivity = await ActivityModel.findByIdAndUpdate(id, data, {
      new: true
    });

    if (!updatedActivity) {
      throw createHttpError(404, 'Không tìm thấy hoạt động');
    }

    if (tutorial) {
      await replaceActivityTutorial(updatedActivity, tutorial);
    }

    return updatedActivity;
  },

  deleteActivity: async (id: string) => {
    if (!validateObjectId(id)) {
      throw createHttpError(400, 'Định dạng ID hoạt động không hợp lệ');
    }

    const deletedActivity = await ActivityModel.findByIdAndDelete(id);

    if (!deletedActivity) {
      throw createHttpError(404, 'Không tìm thấy hoạt động');
    }

    return deletedActivity;
  }
};

async function saveActivityTutorial(
  activity: HydratedDocument<Activity>,
  file: Express.Multer.File
) {
  const uploadResult = await uploadActivityTutorial(
    file.buffer,
    activity._id.toString()
  );
  if (uploadResult.success && uploadResult.data) {
    activity.tutorial = uploadResult.data.secure_url;
    await activity.save();
  } else {
    throw createHttpError(500, 'Không thể tải lên ảnh hướng dẫn hoạt động');
  }
}

async function replaceActivityTutorial(
  activity: HydratedDocument<Activity>,
  file: Express.Multer.File
) {
  await deleteActivityTutorial(activity._id.toString());
  await saveActivityTutorial(activity, file);
}
