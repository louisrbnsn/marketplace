import { NextRequest, NextResponse } from 'next/server'
import { uploadFile } from '@/lib/storage'

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const key = searchParams.get('key')

    if (!key) {
      return NextResponse.json(
        { success: false, error: 'File key is required' },
        { status: 400 }
      )
    }

    // Get content type from headers
    const contentType = request.headers.get('content-type') || 'application/octet-stream'

    // Read the raw body as buffer (same as S3 expects)
    const arrayBuffer = await request.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    console.log('📤 Local upload:', { key, contentType, size: buffer.length })

    // Upload using the same function as S3
    const url = await uploadFile(key, buffer, contentType)

    console.log('✅ File uploaded locally:', url)

    return new Response(null, { status: 200 })
  } catch (error) {
    console.error('❌ Local upload error:', error)
    return NextResponse.json(
      { success: false, error: 'Error uploading file' },
      { status: 500 }
    )
  }
}
