// ProductList.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import ProductCard from './ProductCard';

interface ProductListProps {
  searchTerm: string;
}

export default function ProductList({ searchTerm }: ProductListProps) {
  const searchParams = useSearchParams();
  const category = searchParams.get('category');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        let url = category 
          ? `/api/products?category=${category}&populate=categories`
          : '/api/products?populate=categories';

        // Nếu có searchTerm, thêm nó vào URL
        if (searchTerm) {
          url += `&search=${encodeURIComponent(searchTerm)}`;
        }

        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch products');

        const data = await res.json();
        setProducts(data.data || data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, searchTerm]);

  if (loading) return <div className="text-center py-8">Đang tải sản phẩm...</div>;
  if (error) return <div className="text-red-500 py-8">Lỗi: {error}</div>;
  if (!products.length) return <div className="text-gray-500 py-8">Không tìm thấy sản phẩm</div>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}
