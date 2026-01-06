import multer from 'multer';
import { HttpStatus } from '../enums/httpStatus.enum';
import { AppError } from '../errors/appError';

const storage = multer.memoryStorage();

const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  if (!file.mimetype.startsWith('image/')) {
    return cb(new AppError('Only image files are allowed', HttpStatus.BAD_REQUEST));
  }

  if (file.size > 5 * 1024 * 1024) {
    return cb(new AppError('File size must be less than 5MB', HttpStatus.BAD_REQUEST));
  }

  cb(null, true);
};

export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});
