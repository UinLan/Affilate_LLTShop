import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import Category from '@/lib/models/Category';
import { convertToClientProduct } from '@/lib/converters';

export async function PUT(
  request: Request,
  { params }: { params: { productId: string } }
) {
  try {
    await connectDB();
    
    const { categoryId, action } = await request.json();
    const productId = params.productId;

    // Validate category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Danh mục không tồn tại' },
        { status: 404 }
      );
    }

    // Sử dụng atomic operations để đảm bảo tính nhất quán
    let updateOperation;
    if (action === 'add') {
      updateOperation = { $addToSet: { categories: categoryId } };
    } else {
      updateOperation = { $pull: { categories: categoryId } };
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      updateOperation,
      { new: true }
    ).populate('categories');

    if (!updatedProduct) {
      return NextResponse.json(
        { success: false, error: 'Sản phẩm không tồn tại' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: convertToClientProduct(updatedProduct) 
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}