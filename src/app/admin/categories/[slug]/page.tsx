import { notFound } from 'next/navigation';
import Product from '@/lib/models/Product';
import Category from '@/lib/models/Category';
import connectDB from '@/lib/mongodb';
import ProductCard from '@/components/ProductCard';
import { IProductClient, ICategoryClient } from '@/types/product';
import { Document, Types } from 'mongoose';

// Định nghĩa kiểu cho product sau khi dùng lean()
interface LeanProduct {
  _id: Types.ObjectId;
  tiktokUrl: string;
  productName: string;
  description?: string;
  price?: number;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  await connectDB();
  
  const category = await Category.findOne({ slug: params.slug });
  if (!category) return notFound();
  
  // Lấy sản phẩm với kiểu rõ ràng
  const products = await Product.find({ categories: category._id })
    .sort({ createdAt: -1 })
    .select('tiktokUrl productName description price images createdAt updatedAt')
    .lean<LeanProduct[]>()
    .exec();

  // Chuyển đổi sang kiểu IProductClient với kiểm tra an toàn
  const clientProducts: IProductClient[] = products.map((product) => {
    const categoryClient: ICategoryClient = {
      _id: category._id.toString(),
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.image,
      createdAt: category.createdAt?.toISOString(),
      updatedAt: category.updatedAt?.toISOString()
    };

    return {
      _id: product._id.toString(),
      shopeeUrl: product.tiktokUrl,
      productName: product.productName,
      description: product.description,
      price: product.price,
      images: product.images,
      categories: [categoryClient],
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString()
    };
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{category.name}</h1>
      {category.description && (
        <p className="mb-8 text-gray-600">{category.description}</p>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {clientProducts.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
}