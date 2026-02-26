import mongoose from 'mongoose';

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
