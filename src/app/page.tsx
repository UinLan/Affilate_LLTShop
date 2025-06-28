import Product from '@/lib/models/Product';
import Category from '@/lib/models/Category';
import connectDB from '@/lib/mongodb';
import ProductCard from '@/components/ProductCard';
import { convertToClientProduct } from '@/lib/converters';

export default async function HomePage() {
  await connectDB();
  
  // Lấy tất cả sản phẩm và danh mục
  const [products, categories] = await Promise.all([
    Product.find().sort({ createdAt: -1 }).exec(),
    Category.find().sort({ name: 1 }).exec()
  ]);

  const clientProducts = products.map(product => 
    convertToClientProduct(product)
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Sản phẩm nổi bật</h1>
      
      {/* Thanh danh mục */}
      <div className="mb-8 overflow-x-auto">
        <div className="flex space-x-2 pb-2">
          {/* Nút "Tất cả" */}
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-full whitespace-nowrap"
          >
            Tất cả
          </button>
          
          {/* Các danh mục */}
          {categories.map(category => (
            <button
              key={category._id.toString()}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-full whitespace-nowrap transition-colors"
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Danh sách sản phẩm */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {clientProducts.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
}