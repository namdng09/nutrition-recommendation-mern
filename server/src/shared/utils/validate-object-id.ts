import mongoose from 'mongoose';

export const validateObjectId = (id: string): boolean => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return false;
  }

  return true;
};
