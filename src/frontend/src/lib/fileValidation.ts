const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];

export interface ValidationResult {
    valid: boolean;
    error?: string;
}

export function validateFile(file: File): ValidationResult {
    if (file.size > MAX_FILE_SIZE) {
        return {
            valid: false,
            error: `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`
        };
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
        return {
            valid: false,
            error: 'File must be an image (JPEG, PNG, WebP) or PDF'
        };
    }

    return { valid: true };
}

export function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
