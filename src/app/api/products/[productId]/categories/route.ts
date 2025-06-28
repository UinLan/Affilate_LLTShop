// app/api/products/[productId]/categories/route.ts
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import { convertToClientProduct } from '@/lib/converters';

export async function PUT(
  request: Request,
  { params }: { params: { productId: string } }
) {
  try {
    await connectDB();
    
    const { categoryId, action } = await request.json();
    const { productId } = params;

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    if (action === 'add') {
      // Thêm danh mục mới và đảm bảo không trùng lặp
      if (!product.categories.includes(categoryId)) {
        product.categories.push(categoryId);
      }
    } else if (action === 'remove') {
      product.categories = product.categories.filter(
        (id: string) => id.toString() !== categoryId
      );
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action' },
        { status: 400 }
      );
    }

    await product.save();
    
    const populatedProduct = await Product.findById(productId).populate('categories');
    const clientProduct = convertToClientProduct(populatedProduct);
    
    return NextResponse.json({ 
      success: true, 
      data: clientProduct 
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}