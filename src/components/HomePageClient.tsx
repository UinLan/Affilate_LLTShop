// components/HomePageClient.tsx
'use client';

import { useState } from 'react';
import { Suspense } from 'react';
import CategoryFilter from './CategoryFilter';
import ProductList from './ProductsList';
import SearchBar from './SearchBar';
import PaginationControls from './PaginationControls';

interface HomePageClientProps {
  categories: any[];
}

export default function HomePageClient({ categories }: HomePageClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1); // Reset về trang đầu tiên khi thay đổi số lượng sản phẩm mỗi trang
  };

  const updateTotalItems = (total: number) => {
    setTotalItems(total);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-4">
        <h1 className="text-4xl md:text-5xl font-extrabold text-blue-700 drop-shadow-sm mb-4">
          🔥 Sản Phẩm Nổi Bật
        </h1>
        <p className="text-gray-600 max-w-xl mx-auto">
          Khám phá những sản phẩm chất lượng, giá hợp lý, được chọn lọc từ Shopee.
        </p>
      </div>

      <SearchBar onSearch={(term) => {
        setSearchTerm(term);
        setCurrentPage(1); // Reset về trang đầu tiên khi tìm kiếm
      }} />
      
      <CategoryFilter categories={categories} />
       <Suspense fallback={<div className="text-center py-8">Đang tải sản phẩm...</div>}>
      <ProductList 
        searchTerm={searchTerm} 
        currentPage={currentPage} 
        itemsPerPage={itemsPerPage}
        onTotalChange={updateTotalItems}
      />
      </Suspense>
      <PaginationControls 
        currentPage={currentPage}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
      />
    </div>
  );
}