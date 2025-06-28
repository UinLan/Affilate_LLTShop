import { NextResponse } from 'next/server';
import Product from '@/lib/models/Product';
import connectDB from '@/lib/mongodb';
import { IProduct } from '@/types/product';
import { spawn } from 'child_process';
import { convertToClientProduct } from '@/lib/converters';

export async function GET() {
  try {
    await connectDB();
    
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .exec();

    const clientProducts = products.map(convertToClientProduct);

    return NextResponse.json(clientProducts);
  } catch (error) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
export async function POST(request: Request) {
  try {
     await connectDB();
    const productData: Omit<IProduct, 'postedHistory' | 'createdAt'> = await request.json();
    
    const product = new Product({
      ...productData,
      postingTemplates: productData.postingTemplates || []
    });

    await product.save();

    // Gọi Python script tự động
    const pythonProcess = spawn('python', [
      'C:/tiktok_to_facebook/tiktok_to_facebook.py',
      '--product-id',
      product._id.toString()
    ]);

    pythonProcess.stdout.on('data', (data) => {
      console.log(`Python Output: ${data}`);
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error(`Python Error: ${data}`);
    });

    return NextResponse.json({ 
      success: true, 
      product 
    }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}