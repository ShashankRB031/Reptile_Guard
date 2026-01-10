/**
 * Firebase Storage Service - Using Firestore for image storage (base64)
 * This approach stores images directly in Firestore as base64 strings
 * to avoid needing Firebase Storage (Blaze plan)
 */

/**
 * Convert a File object to base64 string
 * @param file - The File object to convert
 * @returns Base64 encoded string with data URL prefix
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = error => reject(error);
  });
};

/**
 * Compress and convert image file to base64
 * @param file - The File object
 * @param maxWidth - Maximum width for compression
 * @param quality - JPEG quality (0-1)
 * @returns Compressed base64 string with data URL prefix
 */
export const compressAndConvertToBase64 = (
  file: File, 
  maxWidth: number = 800, 
  quality: number = 0.7
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ratio = maxWidth / img.width;
        canvas.width = Math.min(img.width, maxWidth);
        canvas.height = img.width > maxWidth ? img.height * ratio : img.height;
        
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

/**
 * Process multiple images for storage
 * @param base64Images - Array of base64 encoded images (with or without data URL prefix)
 * @returns Array of processed base64 strings ready for Firestore
 */
export const processImagesForStorage = async (
  base64Images: string[]
): Promise<string[]> => {
  // Images are already base64, just return them
  // They will be stored directly in Firestore document
  return base64Images;
};

/**
 * Upload report images (stores in Firestore, not Storage)
 * For compatibility with existing code
 */
export const uploadReportImages = async (
  reportId: string,
  base64Images: string[]
): Promise<string[]> => {
  // In Firestore-only mode, we just return the base64 images
  // They will be stored directly in the report document
  return base64Images;
};

/**
 * Upload rescue images (stores in Firestore, not Storage)
 */
export const uploadRescueImages = async (
  reportId: string,
  base64Images: string[]
): Promise<string[]> => {
  return base64Images;
};

/**
 * Delete images - no-op in Firestore-only mode
 */
export const deleteImage = async (imageUrl: string): Promise<void> => {
  // Images are embedded in documents, deleted when document is deleted
  console.log('Image deletion handled by document deletion');
};

/**
 * Delete report images - no-op in Firestore-only mode  
 */
export const deleteReportImages = async (reportId: string): Promise<void> => {
  console.log('Report images deleted with document');
};

/**
 * Placeholder functions for compatibility
 */
export const uploadImage = async (base64Data: string): Promise<string> => {
  return base64Data;
};

export const uploadMultipleImages = async (base64Images: string[]): Promise<string[]> => {
  return base64Images;
};
