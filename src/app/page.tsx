// app/page.tsx
import Category from '@/lib/models/Category';
import connectDB from '@/lib/mongodb';
import { convertToClientCategory } from '@/lib/converters';
import CategoryFilter from '@/components/CategoryFilter';
import ProductList from '@/components/ProductsList';

export default async function HomePage() {
  await connectDB();
  
  const categories = await Category.find().sort({ name: 1 }).exec();
  const clientCategories = categories.map(category =>
    convertToClientCategory(category)
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Sản phẩm nổi bật</h1>
      
      <CategoryFilter categories={clientCategories} />
      
      <ProductList />
    </div>
  );
}