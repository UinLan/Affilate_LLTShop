// components/admin/ProductTable.tsx
'use client';

import { useState, useEffect } from 'react';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { IProductClient } from '@/types/product';

export default function ProductTable() {
  const router = useRouter();
  const [products, setProducts] = useState<IProductClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/products');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        // Đảm bảo products luôn là mảng
        const productsData = Array.isArray(result.data) 
          ? result.data 
          : Array.isArray(result) 
            ? result 
            : [];
            
        setProducts(productsData);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err instanceof Error ? err.message : 'Lỗi không xác định');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleDelete = async (productId: string) => {
    if (confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      try {
        const response = await fetch(`/api/products/${productId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          setProducts(products.filter(p => p._id !== productId));
        }
      } catch (err) {
        console.error('Error deleting product:', err);
      }
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Đang tải sản phẩm...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Lỗi: {error}</div>;
  }

  if (!Array.isArray(products) || products.length === 0) {
    return <div className="p-4 text-center">Không có sản phẩm nào</div>;
  }

  return (
    <table className="min-w-full bg-white border rounded-lg overflow-hidden">
      <thead className="bg-gray-100">
        <tr>
          <th className="py-3 px-4 border-b text-left">Tên sản phẩm</th>
          <th className="py-3 px-4 border-b text-left">Giá</th>
          <th className="py-3 px-4 border-b text-left">Actions</th>
        </tr>
      </thead>
      <tbody>
        {products.map((product) => (
          <tr 
            key={product._id} 
            className="hover:bg-gray-50 border-b"
          >
            <td className="py-3 px-4">{product.productName}</td>
            <td className="py-3 px-4">{product.price}</td>
            <td className="py-3 px-4">
              <div className="flex space-x-2">
                <button
                  onClick={() => router.push(`/admin/products/edit/${product._id}`)}
                  className="text-blue-500 hover:text-blue-700 p-1 rounded hover:bg-blue-50"
                  title="Chỉnh sửa"
                >
                  <FiEdit size={18} />
                </button>
                <button
                  onClick={() => handleDelete(product._id)}
                  className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                  title="Xóa"
                >
                  <FiTrash2 size={18} />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}