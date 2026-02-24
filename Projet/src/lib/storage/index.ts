import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { writeFile, mkdir, unlink } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

// Check if using local storage or S3
const useLocalStorage = process.env.USE_LOCAL_STORAGE === 'true'

// Check if S3 configuration is present
const isS3Configured = !!(
  process.env.S3_ENDPOINT &&
  process.env.S3_ACCESS_KEY_ID &&
  process.env.S3_SECRET_ACCESS_KEY
)

if (!useLocalStorage && !isS3Configured) {
  console.error('⚠️  Storage configuration is incomplete.')
  console.error('Option 1 - Use local storage (development only):')
  console.error('  Add to .env.local: USE_LOCAL_STORAGE=true')
  console.error('')
  console.error('Option 2 - Configure S3/R2 (production):')
  console.error('  - S3_ENDPOINT')
  console.error('  - S3_ACCESS_KEY_ID')
  console.error('  - S3_SECRET_ACCESS_KEY')
  console.error('Please check your .env.local file and restart the server.')
}

if (useLocalStorage) {
  console.log('📁 Using LOCAL storage for file uploads (development mode)')
}

// Initialize S3 client for Cloudflare R2
export const s3Client = isS3Configured ? new S3Client({
  region: process.env.S3_REGION || 'auto',
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
}) : null

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'marketplace-files'
const PUBLIC_URL = process.env.S3_PUBLIC_URL || ''
const LOCAL_UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

/**
 * Check if storage (S3 or local) is properly configured
 */
export function isStorageConfigured(): boolean {
  return useLocalStorage || (isS3Configured && s3Client !== null)
}

/**
 * Ensure local upload directory exists
 */
async function ensureUploadDir(filePath: string): Promise<void> {
  const dir = path.dirname(filePath)
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true })
  }
}

/**
 * Generate a presigned URL for file upload (S3 only)
 */
export async function generateUploadUrl(
  key: string,
  contentType: string,
  expiresIn: number = 3600
): Promise<string> {
  if (useLocalStorage) {
    // For local storage, return a special URL that indicates local upload
    return `/api/upload/local?key=${encodeURIComponent(key)}`
  }

  if (!s3Client) {
    throw new Error('S3 is not configured. Please check your environment variables.')
  }

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  })

  return getSignedUrl(s3Client, command, { expiresIn })
}

/**
 * Generate a presigned URL for file download
 */
export async function generateDownloadUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  if (!s3Client) {
    throw new Error('S3 is not configured. Please check your environment variables.')
  }

  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  })

  return getSignedUrl(s3Client, command, { expiresIn })
}

/**
 * Upload a file directly to S3 or local storage
 */
export async function uploadFile(
  key: string,
  body: Buffer | Uint8Array | string,
  contentType: string
): Promise<string> {
  if (useLocalStorage) {
    // Upload to local file system
    const filePath = path.join(LOCAL_UPLOAD_DIR, key)
    await ensureUploadDir(filePath)
    
    const buffer = typeof body === 'string' ? Buffer.from(body) : body
    await writeFile(filePath, buffer)
    
    return `${APP_URL}/uploads/${key}`
  }

  if (!s3Client) {
    throw new Error('S3 storage is not configured')
  }

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: body,
    ContentType: contentType,
  })

  await s3Client.send(command)

  return `${PUBLIC_URL}/${key}`
}

/**
 * Upload a file from FormData (local storage helper)
 */
export async function uploadFileFromFormData(
  key: string,
  file: File
): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  return uploadFile(key, buffer, file.type)
}

/**
 * Delete a file from S3 or local storage
 */
export async function deleteFile(key: string): Promise<void> {
  if (useLocalStorage) {
    // Delete from local file system
    const filePath = path.join(LOCAL_UPLOAD_DIR, key)
    if (existsSync(filePath)) {
      await unlink(filePath)
    }
    return
  }

  if (!s3Client) {
    throw new Error('S3 storage is not configured')
  }

  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  })

  await s3Client.send(command)
}

/**
 * Generate a unique file key
 */
export function generateFileKey(
  userId: string,
  productId: string,
  fileName: string
): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(7)
  const extension = fileName.substring(fileName.lastIndexOf('.'))
  return `products/${userId}/${productId}/${timestamp}-${random}${extension}`
}

/**
 * Generate a thumbnail key
 */
export function generateThumbnailKey(
  userId: string,
  productId: string,
  fileName: string
): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(7)
  return `thumbnails/${userId}/${productId}/${timestamp}-${random}.jpg`
}

/**
 * Get public URL for a file
 */
export function getPublicUrl(key: string): string {
  if (useLocalStorage) {
    return `${APP_URL}/uploads/${key}`
  }
  return `${PUBLIC_URL}/${key}`
}

/**
 * Check if file extension is allowed
 */
export function isAllowedFileType(fileName: string, allowedExtensions: string[]): boolean {
  const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'))
  return allowedExtensions.includes(extension)
}

/**
 * Get content type from file extension
 */
export function getContentType(fileName: string): string {
  const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'))

  const contentTypes: Record<string, string> = {
    '.cube': 'application/octet-stream',
    '.xmp': 'application/xml',
    '.wav': 'audio/wav',
    '.mp3': 'audio/mpeg',
    '.ogg': 'audio/ogg',
    '.aep': 'application/octet-stream',
    '.prproj': 'application/octet-stream',
    '.mogrt': 'application/octet-stream',
    '.zip': 'application/zip',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.mov': 'video/quicktime',
    '.mp4': 'video/mp4',
  }

  return contentTypes[extension] || 'application/octet-stream'
}
