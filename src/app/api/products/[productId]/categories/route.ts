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
    const productId = params.productId; // Sửa lại cách lấy productId

    // Validate category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Danh mục không tồn tại' },
        { status: 404 }
      );
    }

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Sản phẩm không tồn tại' },
        { status: 404 }
      );
    }

    if (action === 'add') {
      // Ensure category is not already assigned
      if (!product.categories.includes(categoryId)) {
        product.categories.push(categoryId);
      }
    } else if (action === 'remove') {
      product.categories = product.categories.filter(
        (id: string) => id.toString() !== categoryId
      );
    } else {
      return NextResponse.json(
        { success: false, error: 'Hành động không hợp lệ' },
        { status: 400 }
      );
    }

    await product.save();
    
    // Populate categories for the response
    const populatedProduct = await Product.findById(productId).populate('categories');
    const clientProduct = convertToClientProduct(populatedProduct);
    
    return NextResponse.json({ 
      success: true, 
      data: clientProduct 
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}