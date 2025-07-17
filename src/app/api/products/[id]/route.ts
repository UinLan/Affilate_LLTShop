import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import { IProduct } from '@/types/product';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const { id } = params; // Lấy id từ params đã được giải quyết
    const product = await Product.findById(id).populate('categories');
    
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Sản phẩm không tồn tại' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: product 
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
    const { id } = params; // Lấy id từ params đã được giải quyết
    const productData: Partial<IProduct> = await request.json();
    
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      productData,
      { new: true, runValidators: true }
    ).populate('categories');

    if (!updatedProduct) {
      return NextResponse.json(
        { success: false, error: 'Sản phẩm không tồn tại' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: updatedProduct 
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const { id } = params; // Lấy id từ params đã được giải quyết
    
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