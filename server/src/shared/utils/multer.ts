import multer from 'multer';

const storage = multer.memoryStorage();

const defaultFileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  cb(null, true);
};

export const createUpload = (options?: {
  fileFilter?: (req: any, file: Express.Multer.File, cb: any) => void;
  limits?: multer.Options['limits'];
}) => {
  return multer({
    storage,
    fileFilter: options?.fileFilter || defaultFileFilter,
    limits: options?.limits || { fileSize: 5 * 1024 * 1024 }
  });
};

export const uploadSingle = (
  fieldName: string,
  options?: {
    fileFilter?: (req: any, file: Express.Multer.File, cb: any) => void;
    limits?: multer.Options['limits'];
  }
) => {
  return createUpload(options).single(fieldName);
};

export const uploadMultiple = (
  fieldName: string,
  maxCount: number,
  options?: {
    fileFilter?: (req: any, file: Express.Multer.File, cb: any) => void;
    limits?: multer.Options['limits'];
  }
) => {
  return createUpload(options).array(fieldName, maxCount);
};

export const handleSingleImageUpload = (fieldName: string) => {
  return uploadSingle(fieldName, { fileFilter: imageFileFilter });
};

export const handleMultipleImagesUpload = (
  fieldName: string,
  maxCount: number
) => {
  return uploadMultiple(fieldName, maxCount, { fileFilter: imageFileFilter });
};

const imageFileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

export default createUpload;
