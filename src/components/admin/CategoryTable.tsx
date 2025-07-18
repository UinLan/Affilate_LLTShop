// components/admin/CategoryTable.tsx
'use client';

import { useEffect, useState } from 'react';
import { FiEdit, FiTrash2, FiPlus, FiX, FiSave, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

interface ICategory {
  _id: string;
  name: string;
  slug: string;
}

interface IProductCategory {
  _id: string;
  name?: string;
  slug?: string;
}

interface IProduct {
  _id: string;
  productName: string;
  categories?: (string | IProductCategory)[];
  images?: string[];
}

export default function CategoryTable() {
  const router = useRouter();
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [allProducts, setAllProducts] = useState<IProduct[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState({
    categories: true,
    products: true,
    allProducts: false
  });
  const [error, setError] = useState<string | null>(null);
  const [pendingChanges, setPendingChanges] = useState<{
    toAdd: string[];
    toRemove: string[];
  }>({ toAdd: [], toRemove: [] });
  const [allProductsFetched, setAllProductsFetched] = useState(false);
  const [showProductLists, setShowProductLists] = useState(true);

  // Fetch all data (categories and products) immediately when component mounts
  const fetchInitialData = async () => {
    setLoading({ categories: true, products: true, allProducts: true });
    setError(null);
    
    try {
      // First fetch categories
      const categoriesRes = await fetch('/api/categories');
      if (!categoriesRes.ok) {
        throw new Error('Failed to fetch categories');
      }
      const categoriesData = await categoriesRes.json();
      setCategories(categoriesData.data || categoriesData);

      // Then fetch ALL products with pagination
      let allFetchedProducts: IProduct[] = [];
      let currentPage = 1;
      let totalPages = 1;

      while (currentPage <= totalPages) {
        const response = await fetch(
          `/api/products?populate=categories&page=${currentPage}&limit=100`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const result = await response.json();
        const products = result.data || result;
        
        allFetchedProducts = [...allFetchedProducts, ...products];
        
        // Update total pages if available
        if (result.totalPages) {
          totalPages = result.totalPages;
        } else {
          // If no pagination info, assume this is the last page if we got fewer than limit
          if (products.length < 100) {
            totalPages = currentPage;
          } else {
            totalPages = currentPage + 1; // Continue to next page
          }
        }
        
        currentPage++;
      }
      
      setAllProducts(allFetchedProducts);
      setAllProductsFetched(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading({ categories: false, products: false, allProducts: false });
    }
  };

  // Load initial data when component mounts
  useEffect(() => {
    fetchInitialData();
  }, []);

  const getProductCount = (categoryId: string) => {
    return allProducts.filter(product => {
      const isInCategory = isProductInCategory(product, categoryId);
      const isPendingAdd = pendingChanges.toAdd.includes(product._id) && pendingChanges.toRemove.includes(product._id) === false;
      const isPendingRemove = pendingChanges.toRemove.includes(product._id) && pendingChanges.toAdd.includes(product._id) === false;
      
      if (isPendingAdd) return true;
      if (isPendingRemove) return false;
      return isInCategory;
    }).length;
  };

  // Check if product is in category (handles both string and object categories)
  const isProductInCategory = (product: IProduct, categoryId: string) => {
    if (!product.categories) return false;
    return product.categories.some(c => 
      (typeof c === 'string' ? c : c._id) === categoryId
    );
  };

  const handleAssignCategory = (productId: string, assign: boolean) => {
    if (!selectedCategory) return;

    // Update allProducts to show temporary changes
    setAllProducts(prevProducts => 
      prevProducts.map(product => {
        if (product._id === productId) {
          const currentCategories = product.categories || [];
          
          if (assign) {
            // Add to pending changes
            return {
              ...product,
              categories: [...currentCategories, selectedCategory]
            };
          } else {
            // Remove from pending changes
            return {
              ...product,
              categories: currentCategories.filter(c => 
                (typeof c === 'string' ? c : c._id) !== selectedCategory
              )
            };
          }
        }
        return product;
      })
    );

    setPendingChanges(prev => {
      if (assign) {
        return {
          toAdd: [...prev.toAdd, productId],
          toRemove: prev.toRemove.filter(id => id !== productId)
        };
      } else {
        return {
          toAdd: prev.toAdd.filter(id => id !== productId),
          toRemove: [...prev.toRemove, productId]
        };
      }
    });
  };

const saveChanges = async () => {
  if (!selectedCategory) return;

  try {
    setLoading(prev => ({ ...prev, allProducts: true }));
    
    const updateRequests = [
      ...pendingChanges.toAdd.map(productId => 
        fetch(`/api/products/${productId}/categories`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            categoryId: selectedCategory,
            action: 'add'
          }),
        })
      ),
      ...pendingChanges.toRemove.map(productId => 
        fetch(`/api/products/${productId}/categories`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            categoryId: selectedCategory,
            action: 'remove'
          }),
        })
      )
    ];

    const responses = await Promise.all(updateRequests);
    
    for (const res of responses) {
      if (!res.ok) {
        throw new Error('Failed to update product categories');
      }
    }

    // Update the local state to reflect the changes
    setAllProducts(prevProducts => 
      prevProducts.map(product => {
        // For products that were added
        if (pendingChanges.toAdd.includes(product._id)) {
          return {
            ...product,
            categories: [...(product.categories || []), selectedCategory]
          };
        }
        // For products that were removed
        if (pendingChanges.toRemove.includes(product._id)) {
          return {
            ...product,
            categories: (product.categories || []).filter(c => 
              (typeof c === 'string' ? c : c._id) !== selectedCategory
            )
          };
        }
        return product;
      })
    );

    // Clear pending changes
    setPendingChanges({ toAdd: [], toRemove: [] });
  } catch (err) {
    setError((err as Error).message);
    // If error, refetch to restore correct state
    fetchInitialData();
  } finally {
    setLoading(prev => ({ ...prev, allProducts: false }));
  }
};
  // Delete a category
  const handleDeleteCategory = async (categoryId: string) => {
    if (confirm('Bạn có chắc muốn xóa danh mục này? Tất cả sản phẩm trong danh mục sẽ được chuyển thành chưa phân loại.')) {
      try {
        setLoading(prev => ({ ...prev, allProducts: true }));
        
        // First remove category from all products
        const productsToUpdate = allProducts.filter(p => 
          isProductInCategory(p, categoryId)
        );

        const updateRequests = productsToUpdate.map(product => 
          fetch(`/api/products/${product._id}/categories`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              categoryId: categoryId,
              action: 'remove'
            }),
          })
        );

        // Then delete the category itself
        const deleteRequest = fetch(`/api/categories?id=${categoryId}`, {
          method: 'DELETE'
        });

        const allRequests = [...updateRequests, deleteRequest];
        await Promise.all(allRequests);

        // Refresh the data
        await fetchInitialData();
        
        if (selectedCategory === categoryId) {
          setSelectedCategory(null);
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(prev => ({ ...prev, allProducts: false }));
      }
    }
  };

 const getAssignedProducts = () => {
  if (!selectedCategory) return [];
  return allProducts.filter(product => {
    const categoryIds = product.categories?.map(c => 
      typeof c === 'string' ? c : c._id
    );
    return categoryIds?.includes(selectedCategory);
  });
};

  const getUnassignedProducts = () => {
    return allProducts.filter(product => 
      !product.categories || product.categories.length === 0
    );
  };

  // Get products with pending changes
  const getPendingProducts = (type: 'add' | 'remove') => {
    return allProducts.filter((product: IProduct) => {
      const isInPendingList = pendingChanges[type === 'add' ? 'toAdd' : 'toRemove'].includes(product._id);
      if (type === 'add') return isInPendingList;
      
      return isInPendingList && isProductInCategory(product, selectedCategory || '');
    });
  };

  if (loading.categories) {
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

      {/* Categories list */}
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
                const productCount = getProductCount(category._id);
                
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
                          onClick={() => {
                            setSelectedCategory(
                              selectedCategory === category._id ? null : category._id
                            );
                            setPendingChanges({ toAdd: [], toRemove: [] });
                          }}
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

      {/* Product management for selected category */}
      {selectedCategory && (
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">
              Quản lý sản phẩm cho danh mục:{" "}
              <span className="font-semibold text-blue-600">
                {categories.find(c => c._id === selectedCategory)?.name}
              </span>
              <button
                onClick={() => setShowProductLists(!showProductLists)}
                className="ml-2 text-gray-500 hover:text-gray-700"
                title={showProductLists ? "Ẩn danh sách" : "Hiện danh sách"}
              >
                {showProductLists ? <FiChevronUp /> : <FiChevronDown />}
              </button>
            </h3>
            <div className="flex items-center gap-2">
              {(pendingChanges.toAdd.length > 0 || pendingChanges.toRemove.length > 0) && (
                <button
                  onClick={saveChanges}
                  disabled={loading.allProducts}
                  className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-400"
                >
                  {loading.allProducts ? (
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  ) : (
                    <FiSave size={16} />
                  )}
                  Lưu thay đổi
                </button>
              )}
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setPendingChanges({ toAdd: [], toRemove: [] });
                }}
                className="text-gray-500 hover:text-gray-700 p-1"
              >
                <FiX size={20} />
              </button>
            </div>
          </div>

          {showProductLists && (
            <div className="grid md:grid-cols-3 gap-6">
              {/* Assigned products */}
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-3 pb-2 border-b">
                  Sản phẩm trong danh mục ({getAssignedProducts().length})
                </h4>
                {getAssignedProducts().length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {getAssignedProducts().map(product => {
                      const isPendingRemove = pendingChanges.toRemove.includes(product._id);
                      const isPendingAdd = pendingChanges.toAdd.includes(product._id);
                      
                      return (
                        <div 
                          key={product._id} 
                          className={`flex items-center justify-between p-2 border rounded hover:bg-gray-50 ${
                            isPendingRemove ? 'bg-yellow-50' : ''
                          }`}
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
                            disabled={isPendingRemove || isPendingAdd || loading.allProducts}
                            className={`px-2 py-1 text-xs rounded ${
                              isPendingRemove 
                                ? 'bg-yellow-100 text-yellow-600' 
                                : 'bg-red-100 text-red-600 hover:bg-red-200 disabled:opacity-50'
                            }`}
                          >
                            {isPendingRemove ? 'Đang chờ xóa' : 'Xóa'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 py-2">Chưa có sản phẩm nào</p>
                )}
              </div>

              {/* Pending changes */}
              {(pendingChanges.toAdd.length > 0 || pendingChanges.toRemove.length > 0) && (
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3 pb-2 border-b">
                    Thay đổi đang chờ ({pendingChanges.toAdd.length + pendingChanges.toRemove.length})
                  </h4>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {/* Products to be added */}
                    {getPendingProducts('add').map(product => (
                      <div 
                        key={product._id} 
                        className="flex items-center justify-between p-2 border rounded bg-blue-50"
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
                        <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-600">
                          Sẽ thêm
                        </span>
                      </div>
                    ))}

                    {/* Products to be removed */}
                    {getPendingProducts('remove').map(product => (
                      <div 
                        key={product._id} 
                        className="flex items-center justify-between p-2 border rounded bg-yellow-50"
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
                        <span className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-600">
                          Sẽ xóa
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Unassigned products */}
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-3 pb-2 border-b">
                  Sản phẩm chưa phân loại ({getUnassignedProducts().length})
                </h4>
                {getUnassignedProducts().length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {getUnassignedProducts().map(product => {
                      const isPendingAdd = pendingChanges.toAdd.includes(product._id);
                      
                      return (
                        <div 
                          key={product._id} 
                          className={`flex items-center justify-between p-2 border rounded hover:bg-gray-50 ${
                            isPendingAdd ? 'bg-blue-50' : ''
                          }`}
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
                            disabled={isPendingAdd || loading.allProducts}
                            className={`px-2 py-1 text-xs rounded ${
                              isPendingAdd 
                                ? 'bg-blue-100 text-blue-600' 
                                : 'bg-green-100 text-green-600 hover:bg-green-200 disabled:opacity-50'
                            }`}
                          >
                            {isPendingAdd ? 'Đang chờ thêm' : 'Thêm'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 py-2">Không có sản phẩm nào</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}