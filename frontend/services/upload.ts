import axios from 'axios';

interface CloudinaryResponse {
    secure_url: string;
    public_id: string;
    width: number;
    height: number;
    format: string;
    resource_type: string;
    created_at: string;
    bytes: number;
    url: string;
}

interface UploadProgress {
    loaded: number;
    total: number;
    percentage: number;
}

class UploadService {
    private cloudinaryUploadUrl: string;
    private cloudinaryCloudName: string;
    private uploadPreset: string;

    constructor() {
        // You need to set these in your .env.local file
        this.cloudinaryCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';
        this.uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '';
        this.cloudinaryUploadUrl = `https://api.cloudinary.com/v1_1/${this.cloudinaryCloudName}/image/upload`;
    }

    /**
     * Upload avatar image to Cloudinary
     */
    async uploadAvatar(
        file: File,
        onProgress?: (progress: UploadProgress) => void
    ): Promise<string> {
        if (!this.cloudinaryCloudName || !this.uploadPreset) {
            throw new Error('Cloudinary configuration missing. Please check your environment variables.');
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            throw new Error('Only image files are allowed');
        }

        // Validate file size (5MB max)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            throw new Error('Image must be less than 5MB');
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', this.uploadPreset);
        formData.append('folder', 'wandermind/avatars');

        try {
            const response = await axios.post<CloudinaryResponse>(
                this.cloudinaryUploadUrl,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    onUploadProgress: (progressEvent) => {
                        if (onProgress && progressEvent.total) {
                            const percentage = Math.round(
                                (progressEvent.loaded * 100) / progressEvent.total
                            );
                            onProgress({
                                loaded: progressEvent.loaded,
                                total: progressEvent.total,
                                percentage,
                            });
                        }
                    },
                }
            );

            return response.data.secure_url;
        } catch (error: any) {
            console.error('Cloudinary upload error:', error);

            if (error.response) {
                console.error("Cloudinary response data:", error.response.data);
                console.error("Cloudinary status:", error.response.status);
            }

            const message =
                error.response?.data?.error?.message ||
                error.message ||
                'Failed to upload image. Please try again.';

            throw new Error(message);
        }

    }

    /**
     * Delete image from Cloudinary (requires backend support)
     */
    async deleteImage(publicId: string): Promise<void> {
        // Note: Cloudinary deletion requires server-side implementation
        // due to API secret requirements. Implement this in your Django backend.
        console.warn('Image deletion should be handled by the backend');
    }

    /**
     * Get optimized image URL with transformations
     */
    getOptimizedUrl(imageUrl: string, width?: number, height?: number): string {
        if (!imageUrl || !imageUrl.includes('cloudinary.com')) {
            return imageUrl;
        }

        const transformations = [];
        if (width) transformations.push(`w_${width}`);
        if (height) transformations.push(`h_${height}`);
        transformations.push('c_fill', 'q_auto', 'f_auto');

        const parts = imageUrl.split('/upload/');
        if (parts.length === 2) {
            return `${parts[0]}/upload/${transformations.join(',')}/${parts[1]}`;
        }

        return imageUrl;
    }
}

export const uploadService = new UploadService();