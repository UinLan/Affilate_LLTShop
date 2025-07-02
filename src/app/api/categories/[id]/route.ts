import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Category from '@/lib/models/Category';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const category = await Category.findById(params.id);
    
    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Danh mục không tồn tại' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: category 
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
    const { name } = await request.json();
    
    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Tên danh mục là bắt buộc' },
        { status: 400 }
      );
    }

    const slug = name.toLowerCase().replace(/\s+/g, '-');
    
    // Kiểm tra xem slug đã tồn tại chưa (trừ chính nó)
    const existingCategory = await Category.findOne({ 
      slug,
      _id: { $ne: params.id }
    });
    
    if (existingCategory) {
      return NextResponse.json(
        { success: false, error: 'Tên danh mục đã tồn tại' },
        { status: 400 }
      );
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      params.id,
      { name, slug },
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return NextResponse.json(
        { success: false, error: 'Danh mục không tồn tại' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: updatedCategory 
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}