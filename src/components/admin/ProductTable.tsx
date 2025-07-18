// components/admin/ProductTable.tsx
'use client';

import { useState, useEffect } from 'react';
import { FiEdit, FiTrash2, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { IProductClient } from '@/types/product';

export default function ProductTable() {
  const router = useRouter();
  const [products, setProducts] = useState<IProductClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/products?page=${currentPage}&limit=${itemsPerPage}`);
        
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
        
        // Tính tổng số trang dựa trên tổng số sản phẩm
        if (result.total) {
          setTotalPages(Math.ceil(result.total / itemsPerPage));
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err instanceof Error ? err.message : 'Lỗi không xác định');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage]);

  const handleDelete = async (productId: string) => {
    if (confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      try {
        const response = await fetch(`/api/products/${productId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          // Nếu xóa thành công, tải lại trang hiện tại
          setCurrentPage(1); // Reset về trang đầu tiên hoặc giữ nguyên tùy logic
          // Hoặc có thể fetch lại dữ liệu
          const newResponse = await fetch(`/api/products?page=${currentPage}&limit=${itemsPerPage}`);
          const newResult = await newResponse.json();
          setProducts(Array.isArray(newResult.data) ? newResult.data : []);
        }
      } catch (err) {
        console.error('Error deleting product:', err);
      }
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
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
    <div>
      <table className="min-w-full bg-white border rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-3 px-4 border-b text-left">Ảnh</th>
            <th className="py-3 px-4 border-b text-left">Tên sản phẩm</th>
            <th className="py-3 px-4 border-b text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr 
              key={product._id} 
              className="hover:bg-gray-50 border-b"
            >
              <td className="py-3 px-4">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.productName}
                    className="w-16 h-16 object-cover rounded border"
                  />
                ) : (
                  <div className="w-16 h-16 flex items-center justify-center bg-gray-100 text-gray-400 text-sm border rounded">
                    Không có ảnh
                  </div>
                )}
              </td>
              <td className="py-3 px-4">{product.productName}</td>
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

      {/* Phân trang */}
      <div className="flex justify-center items-center mt-4">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className={`p-2 rounded mx-1 ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-200'}`}
        >
          <FiChevronLeft size={18} />
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <button
            key={page}
            onClick={() => goToPage(page)}
            className={`p-2 rounded mx-1 w-10 ${currentPage === page ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-200'}`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`p-2 rounded mx-1 ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-200'}`}
        >
          <FiChevronRight size={18} />
        </button>
      </div>

      <div className="text-center text-gray-500 mt-2">
        Trang {currentPage} / {totalPages}
      </div>
    </div>
  );
}