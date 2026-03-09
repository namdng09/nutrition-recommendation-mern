import mongoose from 'mongoose';

export const validateObjectId = (id: string): boolean => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return false;
  }

  return true;
};

export const toObjectId = (id: string): mongoose.Types.ObjectId => {
  return new mongoose.Types.ObjectId(id);
};
