// components/ProductsList.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import { motion } from 'framer-motion';

interface ProductListProps {
  searchTerm: string;
  currentPage: number;
  itemsPerPage: number;
  onTotalChange: (total: number) => void;
}

export default function ProductList({ 
  searchTerm, 
  currentPage,
  itemsPerPage,
  onTotalChange
}: ProductListProps) {
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

        if (searchTerm) {
          url += `&search=${encodeURIComponent(searchTerm)}`;
        }

        url += `&page=${currentPage}&limit=${itemsPerPage}`;

        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch products');

        const data = await res.json();
        
        setProducts(data.data || []);
        onTotalChange(data.total || 0);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, searchTerm, currentPage, itemsPerPage, onTotalChange]);

  if (loading) return <div className="text-center py-8">Đang tải sản phẩm...</div>;
  if (error) return <div className="text-red-500 py-8">Lỗi: {error}</div>;
  if (!products.length) return <div className="text-gray-500 py-8">Không tìm thấy sản phẩm</div>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product, index) => (
        <motion.div
          key={product._id || product.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <ProductCard product={product} />
        </motion.div>
      ))}
    </div>
  );
}