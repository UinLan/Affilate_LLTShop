// app/api/products/[productId]/categories/route.ts
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/lib/models/Product';

export async function PUT(
  request: Request,
  { params }: { params: { productId: string } }
) {
  await connectDB();
  
  const { categoryId, action } = await request.json();
  const { productId } = params;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    if (action === 'add') {
      if (!product.categories.includes(categoryId)) {
        product.categories.push(categoryId);
      }
    } else if (action === 'remove') {
      product.categories = product.categories.filter(
        (id: string) => id.toString() !== categoryId
      );
    }

    await product.save();
    return NextResponse.json({ success: true, product });
  } catch (error) {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  return NextResponse.json(
    { success: false, error: errorMessage }, // Đảm bảo luôn có cấu trúc {success, error}
    { status: 500 }
  );
}}