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
      <h1 className="text-3xl font-bold mb-8 text-center">Sản phẩm nổi bật</h1>

      <SearchBar onSearch={setSearchTerm} />
      <CategoryFilter categories={categories} />
      <ProductList searchTerm={searchTerm} />
    </div>
  );
}
