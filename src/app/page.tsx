import Product from '@/lib/models/Product';
import connectDB from '@/lib/mongodb';
import ProductCard from '@/components/ProductCard';
import { convertToClientProduct } from '@/lib/converters';

export default async function HomePage() {
  await connectDB();
  
  const products = await Product.find()
    .sort({ createdAt: -1 })
    .exec();

  const clientProducts = products.map(product => 
    convertToClientProduct(product)
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Sản phẩm nổi bật</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {clientProducts.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
}