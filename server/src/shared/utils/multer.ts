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

const certificateFileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: any
) => {
  if (
    file.mimetype.startsWith('image/') ||
    file.mimetype === 'application/pdf'
  ) {
    cb(null, true);
  } else {
    cb(new Error('Only image or PDF files are allowed'), false);
  }
};

export const handleCertificateUpload = (fieldName: string) => {
  return multer({
    storage,
    fileFilter: certificateFileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }
  }).single(fieldName);
};

/**
 * Handles sign-up upload with two optional fields: avatar (image, 5MB) and
 * certificate (image/PDF, 10MB). Uses multer.fields() so both are optional.
 */
export const handleSignUpUpload = () => {
  return multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req: any, file: Express.Multer.File, cb: any) => {
      if (file.fieldname === 'avatar') {
        if (file.mimetype.startsWith('image/')) {
          cb(null, true);
        } else {
          cb(new Error('Avatar phải là tệp hình ảnh'), false);
        }
      } else if (file.fieldname === 'certificate') {
        if (
          file.mimetype.startsWith('image/') ||
          file.mimetype === 'application/pdf'
        ) {
          cb(null, true);
        } else {
          cb(new Error('Chứng chỉ phải là tệp hình ảnh hoặc PDF'), false);
        }
      } else {
        cb(null, false);
      }
    }
  }).fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'certificate', maxCount: 1 }
  ]);
};

export default createUpload;
