import { v2 as cloudinary } from 'cloudinary';
import { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';

cloudinary.config({
  cloudinary_url: process.env.CLOUDINARY_URL
});

interface UploadResult {
  success: boolean;
  data?: UploadApiResponse;
  error?: string;
}

/**
 * Upload image to Cloudinary
 * @param file - File buffer or file path
 * @param customOptions - Custom upload options (optional)
 * @returns Promise with upload result
 */
export const uploadImage = async (
  file: Buffer | string,
  customOptions?: any
): Promise<UploadResult> => {
  try {
    const uploadOptions: any = {
      resource_type: 'image',
      folder: 'uploads',
      ...customOptions
    };

    let result: UploadApiResponse;

    if (Buffer.isBuffer(file)) {
      result = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            uploadOptions,
            (
              error: UploadApiErrorResponse | undefined,
              result: UploadApiResponse | undefined
            ) => {
              if (error) reject(error);
              else if (result) resolve(result);
              else reject(new Error('Upload failed'));
            }
          )
          .end(file);
      });
    } else {
      result = await cloudinary.uploader.upload(file, uploadOptions);
    }

    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
};

/**
 * Upload multiple images to Cloudinary
 * @param files - Array of file buffers or file paths
 * @param customOptions - Custom upload options (optional)
 * @returns Promise with array of upload results
 */
export const uploadMultipleImages = async (
  files: (Buffer | string)[],
  customOptions?: any
): Promise<UploadResult[]> => {
  const uploadPromises = files.map(file => uploadImage(file, customOptions));
  return Promise.all(uploadPromises);
};

/**
 * Delete image from Cloudinary
 * @param publicId - Public ID of the image to delete
 * @returns Promise with deletion result
 */
export const deleteImage = async (
  publicId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return {
      success: result.result === 'ok'
    };
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed'
    };
  }
};

/**
 * Generate optimized image URL
 * @param publicId - Public ID of the image
 * @param options - Transformation options
 * @returns Optimized image URL
 */
export const getOptimizedImageUrl = (
  publicId: string,
  options: {
    width?: number;
    height?: number;
    quality?: string | number;
    format?: string;
  } = {}
): string => {
  return cloudinary.url(publicId, {
    quality: options.quality || 'auto',
    format: options.format || 'auto',
    width: options.width,
    height: options.height,
    crop: 'fill'
  });
};

/**
 * Upload avatar image to Cloudinary
 * @param file - File buffer
 * @param userId - User ID to use as filename
 * @returns Promise with upload result
 */
export const uploadAvatar = async (
  file: Buffer,
  userId: string
): Promise<UploadResult> => {
  const avatarOptions = {
    folder: 'avatars',
    public_id: userId,
    overwrite: true,
    invalidate: true,
    transformation: [
      { width: 300, height: 300, crop: 'fill', gravity: 'face' },
      { quality: 'auto', format: 'auto' }
    ]
  };

  return uploadImage(file, avatarOptions);
};

/**
 * Delete avatar from Cloudinary
 * @param userId - User ID (used as public_id)
 * @returns Promise with deletion result
 */
export const deleteAvatar = async (
  userId: string
): Promise<{ success: boolean; error?: string }> => {
  const publicId = `avatars/${userId}`;
  return deleteImage(publicId);
};

/**
 * Upload certificate (image or PDF) to Cloudinary
 * Uses resource_type: 'auto' to support both images and PDFs
 * @param file - File buffer
 * @param userId - User ID to use as filename (overwrites previous cert)
 * @returns Promise with upload result
 */
export const uploadCertificate = async (
  file: Buffer,
  userId: string
): Promise<UploadResult> => {
  const certOptions = {
    resource_type: 'auto' as const,
    folder: 'certificates',
    public_id: userId,
    overwrite: true,
    invalidate: true
  };

  try {
    const result: UploadApiResponse = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          certOptions,
          (
            error: UploadApiErrorResponse | undefined,
            result: UploadApiResponse | undefined
          ) => {
            if (error) reject(error);
            else if (result) resolve(result);
            else reject(new Error('Upload failed'));
          }
        )
        .end(file);
    });

    return { success: true, data: result };
  } catch (error) {
    console.error('Cloudinary certificate upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
};

/**
 * Delete certificate from Cloudinary
 * @param userId - User ID (used as public_id under certificates/)
 * @returns Promise with deletion result
 */
export const deleteCertificate = async (
  userId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Try both image and raw resource types since we don't know which was uploaded
    const [imageResult, rawResult] = await Promise.allSettled([
      cloudinary.uploader.destroy(`certificates/${userId}`, {
        resource_type: 'image'
      }),
      cloudinary.uploader.destroy(`certificates/${userId}`, {
        resource_type: 'raw'
      })
    ]);

    const imageOk =
      imageResult.status === 'fulfilled' && imageResult.value.result === 'ok';
    const rawOk =
      rawResult.status === 'fulfilled' && rawResult.value.result === 'ok';

    return { success: imageOk || rawOk };
  } catch (error) {
    console.error('Cloudinary certificate delete error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed'
    };
  }
};

/**
 * Upload exercise tutorial (image or video) to Cloudinary
 * @param file - File buffer
 * @param exerciseId - Exercise ID to use as filename
 * @returns Promise with upload result
 */
export const uploadExerciseTutorial = async (
  file: Buffer,
  exerciseId: string
): Promise<UploadResult> => {
  const tutorialOptions = {
    resource_type: 'auto' as const, // Support both images and videos
    folder: 'exercise-tutorials',
    public_id: exerciseId,
    overwrite: true,
    invalidate: true,
    transformation: [{ quality: 'auto', format: 'auto' }]
  };

  try {
    const result: UploadApiResponse = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          tutorialOptions,
          (
            error: UploadApiErrorResponse | undefined,
            result: UploadApiResponse | undefined
          ) => {
            if (error) reject(error);
            else if (result) resolve(result);
            else reject(new Error('Upload failed'));
          }
        )
        .end(file);
    });

    return { success: true, data: result };
  } catch (error) {
    console.error('Cloudinary exercise tutorial upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
};

/**
 * Delete exercise tutorial from Cloudinary
 * @param exerciseId - Exercise ID (used as public_id under exercise-tutorials/)
 * @returns Promise with deletion result
 */
export const deleteExerciseTutorial = async (
  exerciseId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Try both image and video resource types since we don't know which was uploaded
    const [imageResult, videoResult] = await Promise.allSettled([
      cloudinary.uploader.destroy(`exercise-tutorials/${exerciseId}`, {
        resource_type: 'image'
      }),
      cloudinary.uploader.destroy(`exercise-tutorials/${exerciseId}`, {
        resource_type: 'video'
      })
    ]);

    const imageOk =
      imageResult.status === 'fulfilled' && imageResult.value.result === 'ok';
    const videoOk =
      videoResult.status === 'fulfilled' && videoResult.value.result === 'ok';

    return { success: imageOk || videoOk };
  } catch (error) {
    console.error('Cloudinary exercise tutorial delete error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed'
    };
  }
};

export default cloudinary;
