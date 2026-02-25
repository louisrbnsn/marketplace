import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth/middleware'
import { generateUploadUrl, generateFileKey, isStorageConfigured, getPublicUrl } from '@/lib/storage'
import { validateFileType, validateImageType } from '@/utils/validation'
import { getUploadLimit, formatFileSize } from '@/utils/helpers'
import { nanoid } from 'nanoid'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Check if storage is configured
    if (!isStorageConfigured()) {
      console.error('❌ Upload: S3 not configured')
      return NextResponse.json(
        { 
          success: false, 
          error: 'File storage is not configured. Please contact the administrator.' 
        },
        { status: 503 }
      )
    }

    const user = getUserFromRequest(request)

    if (!user) {
      console.log('❌ Upload: No authentication')
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { fileName, fileSize, fileType, category, productId, isThumbnail } = body

    console.log('📤 Upload request:', {
      fileName,
      fileSize,
      fileType,
      category,
      productId,
      isThumbnail,
      userId: user.userId,
      userRole: user.role,
    })

    // Get upload limit based on user role
    const uploadLimit = getUploadLimit(user.role)
    
    // Validate file size
    if (fileSize > uploadLimit) {
      console.log('❌ Upload: File too large', { fileSize, limit: uploadLimit, role: user.role })
      return NextResponse.json(
        {
          success: false,
          error: `File size cannot exceed ${formatFileSize(uploadLimit)} for your plan. Upgrade to a higher plan to upload larger files.`,
        },
        { status: 400 }
      )
    }
    console.log('✅ Upload: File size OK', { fileSize, limit: uploadLimit })

    // Validate file type
    if (isThumbnail) {
      // For thumbnails, validate as image
      if (!validateImageType(fileName)) {
        console.log('❌ Upload: Invalid image type', fileName)
        return NextResponse.json(
          {
            success: false,
            error: 'Image type not allowed. Use JPG, PNG or WebP',
          },
          { status: 400 }
        )
      }
      console.log('✅ Upload: Image type valid')
    } else {
      // For product files, validate based on category
      if (!validateFileType(fileName, category)) {
        console.log('❌ Upload: Invalid file type for category', { fileName, category })
        return NextResponse.json(
          {
            success: false,
            error: 'File type not allowed for this category',
          },
          { status: 400 }
        )
      }
      console.log('✅ Upload: File type valid for category')
    }

    // Generate unique file key
    const fileKey = generateFileKey(user.userId, productId || nanoid(), fileName)
    console.log('🔑 Generated file key:', fileKey)

    // Generate presigned upload URL
    const uploadUrl = await generateUploadUrl(fileKey, fileType, 3600)
    console.log('✅ Generated presigned URL')

    // Generate public URL for the file
    const publicUrl = getPublicUrl(fileKey)
    console.log('🌐 Public URL:', publicUrl)

    return NextResponse.json(
      {
        success: true,
        data: {
          uploadUrl,
          fileKey,
          publicUrl,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('❌ Generate upload URL error:', error)
    return NextResponse.json(
      { success: false, error: 'Error generating upload URL' },
      { status: 500 }
    )
  }
}
