import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import Category from '@/lib/models/Category';
import { convertToClientProduct } from '@/lib/converters';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const { categoryId, action } = await request.json();
    const productId = params.id;

    // Validate category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Danh mục không tồn tại' },
        { status: 404 }
      );
    }

    // Find the product and update in one operation
    let product;
    if (action === 'add') {
      product = await Product.findByIdAndUpdate(
        productId,
        { $addToSet: { categories: categoryId } }, // Sử dụng $addToSet để tránh trùng lặp
        { new: true, populate: 'categories' }
      );
    } else if (action === 'remove') {
      product = await Product.findByIdAndUpdate(
        productId,
        { $pull: { categories: categoryId } },
        { new: true, populate: 'categories' }
      );
    }

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Sản phẩm không tồn tại' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: convertToClientProduct(product) 
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}