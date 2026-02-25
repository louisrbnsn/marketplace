import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Vérifier que l'utilisateur a une boutique
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (storeError || !store) {
      return NextResponse.json(
        { error: 'No store found' },
        { status: 404 }
      )
    }

    console.log('🗑️ Deleting store:', store.id)

    // Get all products from this store to delete their files
    const { data: products } = await supabase
      .from('products')
      .select('id')
      .eq('store_id', store.id)

    // Delete product files from Supabase Storage
    if (products && products.length > 0) {
      console.log(`🗑️ Deleting files for ${products.length} products`)
      
      for (const product of products) {
        try {
          // List all files for this product
          const { data: files } = await supabase.storage
            .from('products')
            .list(`products/${product.id}`)

          if (files && files.length > 0) {
            // Delete all files for this product
            const filePaths = files.map(file => `products/${product.id}/${file.name}`)
            await supabase.storage
              .from('products')
              .remove(filePaths)
            
            console.log(`✅ Deleted ${files.length} files for product ${product.id}`)
          }
        } catch (error) {
          console.error(`Error deleting files for product ${product.id}:`, error)
        }
      }
    }

    // Delete store files (logo, banner) from Supabase Storage
    try {
      const { data: storeFiles } = await supabase.storage
        .from('stores')
        .list(`stores`)

      if (storeFiles && storeFiles.length > 0) {
        // Find files that might belong to this store (could have store ID in path)
        const filePaths = storeFiles
          .filter(file => file.name.includes(store.id) || file.name.includes(store.slug))
          .map(file => `stores/${file.name}`)
        
        if (filePaths.length > 0) {
          await supabase.storage
            .from('stores')
            .remove(filePaths)
          
          console.log(`✅ Deleted ${filePaths.length} store files`)
        }
      }
    } catch (error) {
      console.error('Error deleting store files:', error)
    }

    // Supprimer la boutique (les produits seront supprimés en cascade via la contrainte DB)
    const { error: deleteError } = await supabase
      .from('stores')
      .delete()
      .eq('id', store.id)

    if (deleteError) {
      console.error('Delete error:', deleteError)
      return NextResponse.json(
        { error: 'Error deleting' },
        { status: 500 }
      )
    }

    // Mettre à jour le rôle de l'utilisateur
    await supabase
      .from('users')
      .update({
        role: 'user',
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    console.log('✅ Store and all associated files deleted successfully')

    return NextResponse.json({
      success: true,
      message: 'Store deleted successfully',
    })
  } catch (error) {
    console.error('❌ Delete store error:', error)
    return NextResponse.json(
      { error: 'Error deleting store' },
      { status: 500 }
    )
  }
}
