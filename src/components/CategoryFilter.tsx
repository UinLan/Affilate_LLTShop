// components/CategoryFilter.tsx
'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback } from 'react';

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface CategoryFilterProps {
  categories: Category[];
}

export default function CategoryFilter({ categories }: CategoryFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category');

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams]
  );

  const handleCategoryChange = (slug: string) => {
    router.push(`${pathname}?${createQueryString('category', slug)}`, {
      scroll: false
    });
  };

  return (
    <div className="mb-8 overflow-x-auto">
      <div className="flex space-x-2 pb-2">
        <button 
          className={`px-4 py-2 rounded-full whitespace-nowrap ${
            !currentCategory 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
          onClick={() => handleCategoryChange('')}
        >
          Tất cả
        </button>
        
        {categories.map(category => (
          <button
            key={category._id}
            className={`px-4 py-2 rounded-full whitespace-nowrap ${
              currentCategory === category.slug
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
            onClick={() => handleCategoryChange(category.slug)}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
}