// components/admin/ProductTable.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import { IProduct } from '@/types/product';

export default function ProductTable() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;
    
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) throw new Error('Failed to delete product');
      
      setProducts(products.filter(product => product._id?.toString() !== id));
    } catch (err) {
      setError((err as Error).message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-3 px-4 border-b text-left">Tên sản phẩm</th>
            <th className="py-3 px-4 border-b text-left">Giá</th>
            <th className="py-3 px-4 border-b text-left">Hình ảnh</th>
            <th className="py-3 px-4 border-b text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr 
              key={product._id?.toString()} 
              className="hover:bg-gray-50"
            >
              <td className="py-3 px-4 border-b">{product.productName}</td>
              <td className="py-3 px-4 border-b">
                {product.price ? (
                  new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(product.price)
                ) : (
                  'N/A'
                )}
              </td>
              <td className="py-3 px-4 border-b">
                {product.images?.length > 0 ? (
                  <img 
                    src={product.images[0]} 
                    alt={product.productName}
                    className="w-16 h-16 object-cover rounded"
                  />
                ) : (
                  'No image'
                )}
              </td>
              <td className="py-3 px-4 border-b">
                <div className="flex space-x-2">
                  <button
                    onClick={() => router.push(`/admin/products/edit/${product._id?.toString()}`)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <FiEdit size={18} />
                  </button>
                  <button
                    onClick={() => product._id && handleDelete(product._id.toString())}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}