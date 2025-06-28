// app/admin/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProductTable from '@/components/admin/ProductTable';
import CategoryTable from '@/components/admin/CategoryTable';

type AdminTab = 'products' | 'categories';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>('products');
  const router = useRouter();

  const handleTabChange = (tab: AdminTab) => {
    setActiveTab(tab);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <button 
          onClick={() => router.push('/admin/products/new')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Thêm sản phẩm mới
        </button>
      </div>

      <div className="flex border-b mb-6">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'products' 
              ? 'border-b-2 border-blue-500 text-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => handleTabChange('products')}
        >
          Sản phẩm
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'categories' 
              ? 'border-b-2 border-blue-500 text-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => handleTabChange('categories')}
        >
          Danh mục
        </button>
      </div>

      {activeTab === 'products' ? <ProductTable /> : <CategoryTable />}
    </div>
  );
}