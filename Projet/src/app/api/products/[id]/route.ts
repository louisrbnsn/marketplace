import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { updateProductSchema } from '@/utils/validation'
import { mapProduct } from '@/utils/mappers'

export const dynamic = 'force-dynamic'

// GET - Get a single product
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { id } = params

    // Check if id is a UUID or a slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

    // Get product with relations
    const { data: product, error } = await supabase
      .from('products')
      .select(`
        *,
        store:stores(id, name, slug, logo, banner, description, average_rating, total_sales),
        user:users(id, full_name, avatar),
        reviews(
          *,
          user:users(id, full_name, avatar)
        )
      `)
      .eq(isUUID ? 'id' : 'slug', id)
      .order('created_at', { ascending: false, foreignTable: 'reviews' })
      .limit(10, { foreignTable: 'reviews' })
      .single()

    if (error || !product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    // Increment view count
    await supabase.rpc('increment_product_views', { product_id: product.id })

    return NextResponse.json(
      {
        success: true,
        data: { product: mapProduct(product) },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Get product error:', error)
    return NextResponse.json(
      { success: false, error: 'Error fetching product' },
      { status: 500 }
    )
  }
}

// PATCH - Update a product
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params

    // Check if product exists and belongs to user
    const { data: product } = await supabase
      .from('products')
      .select('*, user:users(role)')
      .eq('id', id)
      .single()

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    if (product.user_id !== user.id && product.user?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'You do not have permission to edit this product' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Validate input
    const validatedData = updateProductSchema.parse(body)

    // Map camelCase to snake_case for database
    const updateData: any = {}
    
    if (validatedData.title !== undefined) updateData.title = validatedData.title
    if (validatedData.description !== undefined) updateData.description = validatedData.description
    if (validatedData.shortDescription !== undefined) updateData.short_description = validatedData.shortDescription
    if (validatedData.price !== undefined) updateData.price = validatedData.price
    if (validatedData.category !== undefined) updateData.category = validatedData.category
    if (validatedData.isPremiumOnly !== undefined) updateData.is_premium_only = validatedData.isPremiumOnly
    if (validatedData.tags !== undefined) updateData.tags = validatedData.tags
    if (validatedData.status !== undefined) updateData.status = validatedData.status
    if (validatedData.fileUrl !== undefined) updateData.file_url = validatedData.fileUrl
    if (validatedData.fileSize !== undefined) updateData.file_size = validatedData.fileSize
    if (validatedData.fileType !== undefined) updateData.file_type = validatedData.fileType
    if (validatedData.thumbnailUrl !== undefined) updateData.thumbnail_url = validatedData.thumbnailUrl

    // Update product
    const { data: updatedProduct, error: updateError } = await supabase
      .from('products')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Update product error:', updateError)
      return NextResponse.json(
        { success: false, error: 'Error updating product' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: { product: mapProduct(updatedProduct) },
        message: 'Product updated successfully',
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Update product error:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Error updating product' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a product
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params

    // Check if product exists and belongs to user
    const { data: product } = await supabase
      .from('products')
      .select('*, user:users(role)')
      .eq('id', id)
      .single()

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    if (product.user_id !== user.id && product.user?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'You do not have permission to delete this product' },
        { status: 403 }
      )
    }

    // Delete product files from Supabase Storage
    try {
      console.log('🗑️ Deleting files for product:', id)
      
      const { data: files } = await supabase.storage
        .from('products')
        .list(`products/${id}`)

      if (files && files.length > 0) {
        const filePaths = files.map(file => `products/${id}/${file.name}`)
        await supabase.storage
          .from('products')
          .remove(filePaths)
        
        console.log(`✅ Deleted ${files.length} files for product ${id}`)
      }
    } catch (error) {
      console.error('Error deleting product files:', error)
      // Continue with product deletion even if file deletion fails
    }

    // Delete product
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Delete product error:', deleteError)
      return NextResponse.json(
        { success: false, error: 'Error deleting product' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Product deleted successfully',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Delete product error:', error)
    return NextResponse.json(
      { success: false, error: 'Error deleting product' },
      { status: 500 }
    )
  }
}

