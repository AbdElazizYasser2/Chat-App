import multer from 'multer';
import path from 'path';
import ApiError from '../utils/ApiError.js';

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new ApiError('Not an image, please upload only images', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export const uploadSingleImage = (fieldName) => upload.single(fieldName);

export const uploadMultipleImages = (fields) => upload.fields(fields);