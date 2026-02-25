import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { nanoid } from 'nanoid'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const bucket = formData.get('bucket') as string || 'products'
    const folder = formData.get('folder') as string || user.id

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file size (max 100MB)
    const maxSize = 100 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File is too large (max 100MB)' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${nanoid()}.${fileExt}`
    const filePath = `${folder}/${fileName}`

    console.log('📤 Uploading file to Supabase:', {
      bucket,
      filePath,
      size: file.size,
      type: file.type,
    })

    // Upload file to Supabase Storage
    const { data, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      
      // Improved error message for missing buckets
      if (uploadError.message.includes('Bucket not found')) {
        return NextResponse.json(
          { 
            success: false, 
            error: `The bucket '${bucket}' does not exist. Please run the setup-storage-buckets.sql script in your Supabase project.`,
            details: uploadError.message
          },
          { status: 500 }
        )
      }

      return NextResponse.json(
        { success: false, error: `Upload error: ${uploadError.message}` },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path)

    console.log('✅ File uploaded successfully:', urlData.publicUrl)

    return NextResponse.json(
      {
        success: true,
        data: {
          url: urlData.publicUrl,
          path: data.path,
          bucket,
        },
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { success: false, error: 'Error uploading file' },
      { status: 500 }
    )
  }
}
