import multer from 'multer';

// Middleware to parse form-data (text fields only, no files)
export const parseFormData = multer().none();
