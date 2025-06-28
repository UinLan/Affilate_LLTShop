import { notFound } from 'next/navigation';
import Product from '@/lib/models/Product';
import Category from '@/lib/models/Category';
import connectDB from '@/lib/mongodb';
import { convertToClientProduct } from '@/lib/converters';
import ProductCard from '@/components/ProductCard';
import { IProductClient } from '@/types/product';

interface CategoryPageProps {
  params: { slug: string };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  await connectDB();
  
  const category = await Category.findOne({ slug: params.slug });
  if (!category) return notFound();
  
  const products = await Product.find({ categories: category._id })
    .sort({ createdAt: -1 })
    .populate('categories')
    .exec();
  
  const clientProducts: IProductClient[] = products.map(convertToClientProduct);

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