import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import { IProduct } from '@/types/product';
import { convertToClientProduct } from '@/lib/converters';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const { id } = params; // Đúng cách sử dụng params trong Next.js 13+

    const product = await Product.findById(id).populate('categories');
    
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const { id } = params;
    const productData: Partial<IProduct> = await request.json();

    // Luôn dùng featuredImage từ client gửi lên, không ghi đè bằng images[0]
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        ...productData,
        featuredImage: productData.featuredImage // Giữ nguyên giá trị gửi lên
      },
      { 
        new: true, 
        runValidators: true 
      }
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
  } catch (error: any) {
    // ... xử lý lỗi
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const { id } = params; // Đúng cách sử dụng params trong Next.js 13+
    
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return NextResponse.json(
        { success: false, error: 'Sản phẩm không tồn tại' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Sản phẩm đã được xóa thành công',
      data: deletedProduct 
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}