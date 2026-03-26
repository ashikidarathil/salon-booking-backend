import mongoose, { PopulateOptions, UpdateQuery, ClientSession, QueryFilter } from 'mongoose';

export { PopulateOptions, UpdateQuery, ClientSession, QueryFilter };
export const ObjectId = mongoose.Types.ObjectId;
export type ObjectId = mongoose.Types.ObjectId;

export const toObjectId = (id: string): mongoose.Types.ObjectId => {
  return new mongoose.Types.ObjectId(id);
};

export const isValidObjectId = (id: string): boolean => {
  return mongoose.Types.ObjectId.isValid(id);
};

export const getIdString = (field: unknown): string => {
  if (field && typeof field === 'object' && '_id' in field) {
    return (field as { _id: { toString(): string } })._id.toString();
  }
  return (field as { toString(): string })?.toString() ?? '';
};
