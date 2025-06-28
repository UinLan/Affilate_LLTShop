// components/admin/CategoryTable.tsx
'use client';

import { useEffect, useState } from 'react';
import { FiEdit, FiTrash2, FiPlus, FiX } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

interface ICategory {
  _id: string;
  name: string;
  slug: string;
}

interface IProduct {
  _id: string;
  productName: string;
  categories?: string[];
  images?: string[];
}

export default function CategoryTable() {
  const router = useRouter();
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [allProducts, setAllProducts] = useState<IProduct[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState({
    categories: true,
    products: true
  });
  const [error, setError] = useState<string | null>(null);

  // Fetch categories and products
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading({ categories: true, products: true });
        setError(null);

        // Fetch categories
        const categoriesRes = await fetch('/api/categories');
        if (!categoriesRes.ok) throw new Error('Failed to fetch categories');
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData.data || categoriesData);

        // Fetch products
        const productsRes = await fetch('/api/products?populate=categories');
        if (!productsRes.ok) throw new Error('Failed to fetch products');
        const productsData = await productsRes.json();
        setAllProducts(productsData.data || productsData);

        setLoading({ categories: false, products: false });
      } catch (err) {
        setError((err as Error).message);
        setLoading({ categories: false, products: false });
      }
    };

    fetchData();
  }, []);

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

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update product categories');
      }

      // Update local state to reflect changes
      setAllProducts(prevProducts => 
        prevProducts.map(product => {
          if (product._id === productId) {
            return {
              ...product,
              categories: assign
                ? [...(product.categories || []), selectedCategory]
                : product.categories?.filter(id => id !== selectedCategory) || []
            };
          }
          return product;
        })
      );
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (confirm('Bạn có chắc muốn xóa danh mục này?')) {
      try {
        const res = await fetch(`/api/categories?id=${categoryId}`, {
          method: 'DELETE'
        });
        
        if (res.ok) {
          setCategories(categories.filter(c => c._id !== categoryId));
          // Also remove from all products
          setAllProducts(prevProducts => 
            prevProducts.map(product => ({
              ...product,
              categories: product.categories?.filter(id => id !== categoryId) || []
            }))
          );
        }
      } catch (err) {
        setError((err as Error).message);
      }
    }
  };

  const getUnassignedProducts = () => {
    return allProducts.filter(product => 
      !product.categories || product.categories.length === 0
    );
  };

  const getAssignedProducts = () => {
    if (!selectedCategory) return [];
    return allProducts.filter(product => 
      product.categories?.includes(selectedCategory)
    );
  };

  if (loading.categories || loading.products) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded">
        <p className="font-bold">Lỗi:</p>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Quản lý Danh mục</h2>
        <button
          onClick={() => router.push('/admin/categories/new')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
        >
          <FiPlus /> Thêm danh mục
        </button>
      </div>

      {/* Danh sách danh mục */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left">Tên danh mục</th>
              <th className="py-3 px-4 text-left">Slug</th>
              <th className="py-3 px-4 text-left">Số sản phẩm</th>
              <th className="py-3 px-4 text-left">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {categories.length > 0 ? (
              categories.map(category => {
                const productCount = allProducts.filter(p => 
                  p.categories?.includes(category._id)
                ).length;
                
                return (
                  <tr 
                    key={category._id} 
                    className={`border-b hover:bg-gray-50 ${
                      selectedCategory === category._id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <td className="py-3 px-4">{category.name}</td>
                    <td className="py-3 px-4 text-gray-600">{category.slug}</td>
                    <td className="py-3 px-4">{productCount}</td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedCategory(
                            selectedCategory === category._id ? null : category._id
                          )}
                          className={`p-2 rounded ${
                            selectedCategory === category._id
                              ? 'bg-blue-100 text-blue-600'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                          title="Quản lý sản phẩm"
                        >
                          <FiPlus size={18} />
                        </button>
                        <button
                          onClick={() => router.push(`/admin/categories/edit/${category._id}`)}
                          className="p-2 text-blue-500 hover:text-blue-700 rounded hover:bg-blue-50"
                          title="Chỉnh sửa"
                        >
                          <FiEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category._id)}
                          className="p-2 text-red-500 hover:text-red-700 rounded hover:bg-red-50"
                          title="Xóa"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4} className="py-4 text-center text-gray-500">
                  Chưa có danh mục nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Danh sách sản phẩm khi chọn danh mục */}
      {selectedCategory && (
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">
              Quản lý sản phẩm cho danh mục:{" "}
              <span className="font-semibold text-blue-600">
                {categories.find(c => c._id === selectedCategory)?.name}
              </span>
            </h3>
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-gray-500 hover:text-gray-700 p-1"
            >
              <FiX size={20} />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Sản phẩm đã gán */}
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-3 pb-2 border-b">
                Sản phẩm trong danh mục ({getAssignedProducts().length})
              </h4>
              {getAssignedProducts().length > 0 ? (
                <div className="space-y-3">
                  {getAssignedProducts().map(product => (
                    <div 
                      key={product._id} 
                      className="flex items-center justify-between p-2 border rounded hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-3">
                        {product.images?.[0] && (
                          <img 
                            src={product.images[0]} 
                            alt={product.productName} 
                            className="w-10 h-10 object-cover rounded"
                          />
                        )}
                        <span className="truncate max-w-xs">{product.productName}</span>
                      </div>
                      <button
                        onClick={() => handleAssignCategory(product._id, false)}
                        className="px-2 py-1 text-xs rounded bg-red-100 text-red-600 hover:bg-red-200"
                      >
                        Xóa
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 py-2">Chưa có sản phẩm nào</p>
              )}
            </div>

            {/* Sản phẩm chưa gán */}
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-3 pb-2 border-b">
                Sản phẩm chưa phân loại ({getUnassignedProducts().length})
              </h4>
              {getUnassignedProducts().length > 0 ? (
                <div className="space-y-3">
                  {getUnassignedProducts().map(product => (
                    <div 
                      key={product._id} 
                      className="flex items-center justify-between p-2 border rounded hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-3">
                        {product.images?.[0] && (
                          <img 
                            src={product.images[0]} 
                            alt={product.productName} 
                            className="w-10 h-10 object-cover rounded"
                          />
                        )}
                        <span className="truncate max-w-xs">{product.productName}</span>
                      </div>
                      <button
                        onClick={() => handleAssignCategory(product._id, true)}
                        className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-600 hover:bg-blue-200"
                      >
                        Thêm
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 py-2">Không có sản phẩm nào</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}