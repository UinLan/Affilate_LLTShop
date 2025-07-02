'use client';

import { useState } from 'react';
import CategoryFilter from './CategoryFilter';
import ProductList from './ProductsList';
import SearchBar from './SearchBar';

interface HomePageClientProps {
  categories: any[];
}

export default function HomePageClient({ categories }: HomePageClientProps) {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-4">
  <h1 className="text-4xl md:text-5xl font-extrabold text-blue-700 drop-shadow-sm mb-4">
    🔥 Sản phẩm nổi bật
  </h1>
  <p className="text-gray-600 max-w-xl mx-auto">
    Khám phá những sản phẩm chất lượng, giá hợp lý, được chọn lọc từ Shopee.
  </p>
</div>


      <SearchBar onSearch={setSearchTerm} />
      <CategoryFilter categories={categories} />
      <ProductList searchTerm={searchTerm} />
    </div>
  );
}
