import mongoose, { PopulateOptions, UpdateQuery, ClientSession } from 'mongoose';

export { PopulateOptions, UpdateQuery, ClientSession };
export const ObjectId = mongoose.Types.ObjectId;
export type ObjectId = mongoose.Types.ObjectId;

/**
 * Converts a string to a Mongoose ObjectId.
 * @param id The string to convert.
 * @returns The Mongoose ObjectId.
 */
export const toObjectId = (id: string): mongoose.Types.ObjectId => {
  return new mongoose.Types.ObjectId(id);
};

/**
 * Checks if a string is a valid Mongoose ObjectId.
 * @param id The string to check.
 * @returns True if valid, false otherwise.
 */
export const isValidObjectId = (id: string): boolean => {
  return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Safely extracts a string ID from a string, ObjectId, or populated document.
 * @param field The field to extract the ID from.
 * @returns The string representation of the ID.
 */
export const getIdString = (field: unknown): string => {
  if (field && typeof field === 'object' && '_id' in field) {
    return (field as { _id: { toString(): string } })._id.toString();
  }
  return (field as { toString(): string })?.toString() ?? '';
};
