'use client';

import { useState } from 'react';
import ProductCard from '@/components/ProductCard';
import { IProductClient } from '@/types/product';

// Định nghĩa interface ICategory nếu chưa có
interface ICategory {
  _id: string;
  name: string;
  slug: string;
}

export default function ProductFilter({
  categories,
  products
}: {
  categories: ICategory[];
  products: IProductClient[];
}) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredProducts = selectedCategory
    ? products.filter(product => 
        product.categories?.some(cat => cat._id === selectedCategory))
    : products;

  return (
    <>
      <div className="mb-8 overflow-x-auto">
        <div className="flex space-x-2 pb-2">
          <button 
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full whitespace-nowrap ${
              !selectedCategory 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            Tất cả
          </button>
          
          {categories.map(category => (
            <button
              key={category._id}
              onClick={() => setSelectedCategory(category._id)}
              className={`px-4 py-2 rounded-full whitespace-nowrap ${
                selectedCategory === category._id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </>
  );
}