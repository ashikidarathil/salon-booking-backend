import multer from 'multer';
import { HttpStatus } from '../enums/httpStatus.enum';
import { AppError } from '../errors/appError';

const storage = multer.memoryStorage();

const imageFileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  if (!file.mimetype.startsWith('image/')) {
    return cb(new AppError('Only image files are allowed', HttpStatus.BAD_REQUEST));
  }
  cb(null, true);
};

const chatMediaFileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  if (!file.mimetype.startsWith('image/') && !file.mimetype.startsWith('audio/')) {
    return cb(new AppError('Only image and audio files are allowed', HttpStatus.BAD_REQUEST));
  }
  cb(null, true);
};

export const uploadMiddleware = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB for images
  },
});

export const chatUploadMiddleware = multer({
  storage,
  fileFilter: chatMediaFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB for chat media (images 5MB, audio 10MB)
  },
});
