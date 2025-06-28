'use client';

import { useEffect, useState } from 'react';
import { FiEdit, FiTrash2, FiPlus, FiX } from 'react-icons/fi';

interface ICategory {
  _id: string;
  name: string;
  slug: string;
}

interface IProduct {
  _id: string;
  name: string;
  categories?: string[]; // Danh sách ID các danh mục
  // Thêm các trường khác nếu cần
}

export default function CategoryTable() {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState({
    categories: true,
    products: true
  });
  const [error, setError] = useState<string | null>(null);

  // Fetch danh sách danh mục và sản phẩm
  useEffect(() => {
    const fetchData = async () => {
  try {
    // Fetch categories
    const categoriesRes = await fetch('/api/categories');
    if (!categoriesRes.ok) throw new Error('Failed to fetch categories');
    const { data, success, error } = await categoriesRes.json();
    
    if (!success) throw new Error(error || 'Invalid data format');
    if (!Array.isArray(data)) throw new Error('Categories data is not an array');
    
    setCategories(data);

    // Fetch products
    const productsRes = await fetch('/api/products');
    if (!productsRes.ok) throw new Error('Failed to fetch products');
    const productsData = await productsRes.json();
    setProducts(productsData.data || productsData.products || []);
  } catch (err) {
    setError((err as Error).message);
  } finally {
    setLoading({ categories: false, products: false });
  }
};

    fetchData();
  }, []);

  // Xử lý gán/xóa danh mục cho sản phẩm
  const handleAssignCategory = async (productId: string, assign: boolean) => {
    if (!selectedCategory) return;

    try {
      const res = await fetch(`/api/products/${productId}/categories`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          categoryId: selectedCategory,
          action: assign ? 'add' : 'remove' 
        }),
      });

      if (!res.ok) throw new Error('Failed to update product categories');

      // Cập nhật UI ngay lập tức
      setProducts(prevProducts => 
        prevProducts.map(product => {
          if (product._id === productId) {
            const currentCategories = product.categories || [];
            return {
              ...product,
              categories: assign
                ? [...currentCategories, selectedCategory]
                : currentCategories.filter(id => id !== selectedCategory)
            };
          }
          return product;
        })
      );
    } catch (err) {
      setError((err as Error).message);
    }
  };

  if (loading.categories || loading.products) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="overflow-x-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Quản lý Danh mục</h2>
        <button
          onClick={() => window.location.href = '/admin/categories/new'}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
        >
          <FiPlus /> Thêm danh mục
        </button>
      </div>

      {/* Danh sách danh mục */}
      <table className="min-w-full bg-white border rounded-lg overflow-hidden mb-8">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-3 px-4 border-b text-left">Tên danh mục</th>
            <th className="py-3 px-4 border-b text-left">Slug</th>
            <th className="py-3 px-4 border-b text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map(category => (
            <tr key={category._id} className="hover:bg-gray-50 border-b">
              <td className="py-3 px-4">{category.name}</td>
              <td className="py-3 px-4">{category.slug}</td>
              <td className="py-3 px-4">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedCategory(
                      selectedCategory === category._id ? null : category._id
                    )}
                    className={`p-1 rounded ${
                      selectedCategory === category._id
                        ? 'bg-blue-100 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    title="Quản lý sản phẩm trong danh mục"
                  >
                    <FiPlus size={18} />
                  </button>
                  <button
                    onClick={() => window.location.href = `/admin/categories/edit/${category._id}`}
                    className="text-blue-500 hover:text-blue-700 p-1 rounded hover:bg-blue-50"
                    title="Chỉnh sửa"
                  >
                    <FiEdit size={18} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Bạn có chắc muốn xóa danh mục này?')) {
                        // Xử lý xóa danh mục
                      }
                    }}
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

      {/* Danh sách sản phẩm khi chọn danh mục */}
      {selectedCategory && (
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">
              Sản phẩm trong danh mục: {categories.find(c => c._id === selectedCategory)?.name}
            </h3>
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              <FiX size={20} />
            </button>
          </div>

          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="py-2 px-4 text-left">Sản phẩm</th>
                <th className="py-2 px-4 text-left">Trạng thái</th>
                <th className="py-2 px-4 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => {
                const isInCategory = product.categories?.includes(selectedCategory);
                return (
                  <tr key={product._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{product.name}</td>
                    <td className="py-3 px-4">
                      {isInCategory ? (
                        <span className="text-green-600">Đã gán</span>
                      ) : (
                        <span className="text-gray-500">Chưa gán</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleAssignCategory(product._id, !isInCategory)}
                        className={`px-3 py-1 rounded text-sm ${
                          isInCategory
                            ? 'bg-red-100 text-red-600 hover:bg-red-200'
                            : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                        }`}
                      >
                        {isInCategory ? 'Xóa khỏi danh mục' : 'Thêm vào danh mục'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}