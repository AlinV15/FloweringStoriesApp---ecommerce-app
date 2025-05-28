export interface CloudinaryUploadResponse {
    secure_url: string;
    public_id: string;
    width: number;
    height: number;
    format: string;
    resource_type: string;
    bytes: number;
    [key: string]: any;
}

export class CloudinaryError extends Error {
    constructor(message: string, public statusCode?: number) {
        super(message);
        this.name = 'CloudinaryError';
    }
}

export const uploadToCloudinary = async (
    file: File,
    folder: string = 'uploads',
    options: {
        width?: number;
        height?: number;
        crop?: string;
        quality?: string | number;
    } = {}
): Promise<string> => {
    try {
        // Validate environment variables
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

        if (!cloudName || !uploadPreset) {
            throw new CloudinaryError('Cloudinary configuration is missing');
        }

        // Validate file
        if (!file) {
            throw new CloudinaryError('No file provided');
        }

        // Create form data
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);
        formData.append('folder', folder);

        // Add transformation options
        if (options.width) formData.append('width', options.width.toString());
        if (options.height) formData.append('height', options.height.toString());
        if (options.crop) formData.append('crop', options.crop);
        if (options.quality) formData.append('quality', options.quality.toString());

        // Upload to Cloudinary
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            {
                method: 'POST',
                body: formData,
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new CloudinaryError(
                errorData.error?.message || `Upload failed with status ${response.status}`,
                response.status
            );
        }

        const data: CloudinaryUploadResponse = await response.json();
        return data.secure_url;
    } catch (error) {
        if (error instanceof CloudinaryError) {
            throw error;
        }
        throw new CloudinaryError(
            error instanceof Error ? error.message : 'Unknown upload error'
        );
    }
};

export const deleteFromCloudinary = async (publicId: string): Promise<boolean> => {
    try {
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        const apiKey = process.env.CLOUDINARY_API_KEY;
        const apiSecret = process.env.CLOUDINARY_API_SECRET;

        if (!cloudName || !apiKey || !apiSecret) {
            throw new CloudinaryError('Cloudinary configuration is missing');
        }

        // This would typically be done server-side due to API secret
        // For now, we'll just return true and handle deletion server-side
        console.warn('Cloudinary deletion should be handled server-side');
        return true;
    } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
        return false;
    }
};

// File validation utilities
export const validateImageFile = (file: File, maxSize: number = 5 * 1024 * 1024): void => {
    if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
    }

    if (file.size > maxSize) {
        const maxSizeMB = Math.round(maxSize / (1024 * 1024));
        throw new Error(`File size must be less than ${maxSizeMB}MB`);
    }
};

export const validateIconFile = (file: File, maxSize: number = 1024 * 1024): void => {
    const validTypes = ['image/x-icon', 'image/vnd.microsoft.icon', 'image/ico', 'image/icon'];

    if (!validTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.ico')) {
        throw new Error('File must be an ICO icon file');
    }

    if (file.size > maxSize) {
        const maxSizeKB = Math.round(maxSize / 1024);
        throw new Error(`Icon file size must be less than ${maxSizeKB}KB`);
    }
};

export const validateAvatarFile = (file: File, maxSize: number = 2 * 1024 * 1024): void => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (!validTypes.includes(file.type)) {
        throw new Error('Avatar must be JPEG, JPG, PNG, or WebP format');
    }

    if (file.size > maxSize) {
        const maxSizeMB = Math.round(maxSize / (1024 * 1024));
        throw new Error(`Avatar file size must be less than ${maxSizeMB}MB`);
    }
};

// Helper function to get optimized image URL
export const getOptimizedImageUrl = (
    publicId: string,
    options: {
        width?: number;
        height?: number;
        crop?: 'fill' | 'fit' | 'scale' | 'crop';
        quality?: 'auto' | number;
        format?: 'auto' | 'webp' | 'jpg' | 'png';
    } = {}
): string => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    if (!cloudName) {
        console.warn('Cloudinary cloud name not configured');
        return '';
    }

    const transformations = [];

    if (options.width) transformations.push(`w_${options.width}`);
    if (options.height) transformations.push(`h_${options.height}`);
    if (options.crop) transformations.push(`c_${options.crop}`);
    if (options.quality) transformations.push(`q_${options.quality}`);
    if (options.format) transformations.push(`f_${options.format}`);

    const transformationString = transformations.length > 0 ? `${transformations.join(',')}/` : '';

    return `https://res.cloudinary.com/${cloudName}/image/upload/${transformationString}${publicId}`;
};

// Batch upload utility
export const uploadMultipleToCloudinary = async (
    files: File[],
    folder: string = 'uploads',
    options: {
        width?: number;
        height?: number;
        crop?: string;
        quality?: string | number;
    } = {}
): Promise<string[]> => {
    const uploadPromises = files.map(file => uploadToCloudinary(file, folder, options));

    try {
        const results = await Promise.allSettled(uploadPromises);
        const urls: string[] = [];
        const errors: string[] = [];

        results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                urls.push(result.value);
            } else {
                errors.push(`File ${index + 1}: ${result.reason.message}`);
            }
        });

        if (errors.length > 0) {
            console.warn('Some uploads failed:', errors);
        }

        return urls;
    } catch (error) {
        throw new CloudinaryError('Batch upload failed');
    }
};

// Upload progress tracking (for UI feedback)
export const uploadWithProgress = async (
    file: File,
    folder: string = 'uploads',
    options: {
        width?: number;
        height?: number;
        crop?: string;
        quality?: string | number;
    } = {},
    onProgress?: (progress: number) => void
): Promise<string> => {
    return new Promise((resolve, reject) => {
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

        if (!cloudName || !uploadPreset) {
            reject(new CloudinaryError('Cloudinary configuration is missing'));
            return;
        }

        const xhr = new XMLHttpRequest();
        const formData = new FormData();

        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);
        formData.append('folder', folder);

        if (options.width) formData.append('width', options.width.toString());
        if (options.height) formData.append('height', options.height.toString());
        if (options.crop) formData.append('crop', options.crop);
        if (options.quality) formData.append('quality', options.quality.toString());

        xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable && onProgress) {
                const progress = Math.round((event.loaded / event.total) * 100);
                onProgress(progress);
            }
        });

        xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
                try {
                    const response: CloudinaryUploadResponse = JSON.parse(xhr.responseText);
                    resolve(response.secure_url);
                } catch (error) {
                    reject(new CloudinaryError('Failed to parse response'));
                }
            } else {
                reject(new CloudinaryError(`Upload failed with status ${xhr.status}`));
            }
        });

        xhr.addEventListener('error', () => {
            reject(new CloudinaryError('Upload failed due to network error'));
        });

        xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);
        xhr.send(formData);
    });
};