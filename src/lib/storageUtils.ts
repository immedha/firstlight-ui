import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/firebase';
import { toast } from 'sonner';

const MAX_FILE_SIZE = 500 * 1024; // 500KB in bytes
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

/**
 * Validates if the file is a valid image and within size limit
 */
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'Only PNG and JPG images are allowed' };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `Image size must be less than 500KB. Current size: ${(file.size / 1024).toFixed(1)}KB` };
  }

  return { valid: true };
};

/**
 * Uploads an image file to Firebase Storage
 * @param file - The image file to upload
 * @param userId - The user ID (owner of the image)
 * @param projectId - Optional project ID for organizing images
 * @returns Promise<string> - The download URL of the uploaded image
 */
export const uploadImageToStorage = async (
  file: File,
  userId: string,
  projectId?: string
): Promise<string> => {
  try {
    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Create a unique filename
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}_${sanitizedFileName}`;
    
    // Create storage path
    const storagePath = projectId 
      ? `projects/${projectId}/${fileName}`
      : `users/${userId}/uploads/${fileName}`;
    
    const storageRef = ref(storage, storagePath);
    
    // Upload file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

/**
 * Uploads multiple images to Firebase Storage
 */
export const uploadMultipleImages = async (
  files: File[],
  userId: string,
  projectId?: string
): Promise<string[]> => {
  const uploadPromises = files.map(file => uploadImageToStorage(file, userId, projectId));
  return Promise.all(uploadPromises);
};

