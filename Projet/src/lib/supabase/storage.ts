import { supabase } from './client'

/**
 * Upload a file to Supabase Storage
 * @param bucket - Bucket name ('products', 'stores', 'avatars')
 * @param path - File path inside the bucket (e.g., 'user-id/filename.jpg')
 * @param file - File to upload (File or Blob)
 * @param options - Additional options
 * @returns Public URL of the uploaded file
 */
export async function uploadFile(
  bucket: string,
  path: string,
  file: File | Blob,
  options?: {
    contentType?: string
    cacheControl?: string
  }
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      contentType: options?.contentType,
      cacheControl: options?.cacheControl || '3600',
      upsert: false,
    })

  if (error) {
    console.error('Upload error:', error)
    throw new Error(`Failed to upload file: ${error.message}`)
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path)

  return urlData.publicUrl
}

/**
 * Delete a file from Supabase Storage
 * @param bucket - Bucket name
 * @param path - File path to delete
 */
export async function deleteFile(bucket: string, path: string): Promise<void> {
  const { error } = await supabase.storage.from(bucket).remove([path])

  if (error) {
    console.error('Delete error:', error)
    throw new Error(`Failed to delete file: ${error.message}`)
  }
}

/**
 * Get a signed URL for private files
 * @param bucket - Bucket name
 * @param path - File path
 * @param expiresIn - Expiration time in seconds (default: 3600 = 1 hour)
 * @returns Signed URL
 */
export async function getSignedUrl(
  bucket: string,
  path: string,
  expiresIn: number = 3600
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn)

  if (error) {
    throw new Error(`Failed to get signed URL: ${error.message}`)
  }

  return data.signedUrl
}

/**
 * List files in a folder
 * @param bucket - Bucket name
 * @param path - Folder path (optional)
 * @returns List of files
 */
export async function listFiles(bucket: string, path?: string) {
  const { data, error } = await supabase.storage.from(bucket).list(path, {
    limit: 100,
    offset: 0,
    sortBy: { column: 'name', order: 'asc' },
  })

  if (error) {
    throw new Error(`Failed to list files: ${error.message}`)
  }

  return data
}

/**
 * Get public URL for a file (for public buckets)
 * @param bucket - Bucket name
 * @param path - File path
 * @returns Public URL
 */
export function getPublicUrl(bucket: string, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

/**
 * Upload product file with automatic path generation
 * @param userId - User ID
 * @param productId - Product ID
 * @param file - File to upload
 * @returns Public URL
 */
export async function uploadProductFile(
  userId: string,
  productId: string,
  file: File
): Promise<string> {
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}.${fileExt}`
  const filePath = `${userId}/${productId}/${fileName}`

  return uploadFile('products', filePath, file, {
    contentType: file.type,
  })
}

/**
 * Upload product thumbnail
 * @param userId - User ID
 * @param productId - Product ID
 * @param file - Image file
 * @returns Public URL
 */
export async function uploadProductThumbnail(
  userId: string,
  productId: string,
  file: File
): Promise<string> {
  const fileExt = file.name.split('.').pop()
  const fileName = `thumbnail-${Date.now()}.${fileExt}`
  const filePath = `${userId}/${productId}/${fileName}`

  return uploadFile('products', filePath, file, {
    contentType: file.type,
  })
}

/**
 * Upload store logo
 * @param userId - User ID
 * @param storeId - Store ID
 * @param file - Image file
 * @returns Public URL
 */
export async function uploadStoreLogo(
  userId: string,
  storeId: string,
  file: File
): Promise<string> {
  const fileExt = file.name.split('.').pop()
  const fileName = `logo-${Date.now()}.${fileExt}`
  const filePath = `${userId}/${storeId}/${fileName}`

  return uploadFile('stores', filePath, file, {
    contentType: file.type,
  })
}

/**
 * Upload user avatar
 * @param userId - User ID
 * @param file - Image file
 * @returns Public URL
 */
export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const fileExt = file.name.split('.').pop()
  const fileName = `avatar-${Date.now()}.${fileExt}`
  const filePath = `${userId}/${fileName}`

  return uploadFile('avatars', filePath, file, {
    contentType: file.type,
  })
}
