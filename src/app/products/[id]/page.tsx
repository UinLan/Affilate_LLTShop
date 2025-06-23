// app/products/[id]/page.tsx
import { notFound } from 'next/navigation';
import Product from '@/lib/models/Product';
import connectDB from '@/lib/mongodb';
import { IProduct } from '@/types/product';

interface ProductPageProps {
  params: { id: string };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  try {
    await connectDB();
    const rawProduct = await Product.findById(params.id).lean();
    
    if (!rawProduct) return notFound();

    const product = JSON.parse(JSON.stringify(rawProduct)) as IProduct;

    return (
      <div className="max-w-3xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">{product.productName}</h1>
        <p className="mb-2 text-gray-600">
          Link TikTok: <a href={product.tiktokUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline">{product.tiktokUrl}</a>
        </p>
        <p className="mb-4">{product.description}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {product.images.map((img, idx) => (
            <img 
              key={idx} 
              src={img} 
              alt={`${product.productName} image ${idx + 1}`} 
              className="rounded shadow w-full h-auto"
            />
          ))}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error fetching product:', error);
    return notFound();
  }
}