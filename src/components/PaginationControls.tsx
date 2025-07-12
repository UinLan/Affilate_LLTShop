'use client';

import { useState, useEffect } from 'react';

interface PaginationControlsProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (value: number) => void;
}

export default function PaginationControls({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange
}: PaginationControlsProps) {
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setTotalPages(Math.ceil(totalItems / itemsPerPage));
  }, [totalItems, itemsPerPage]);

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const leftOffset = Math.floor(maxVisiblePages / 2);
      const rightOffset = Math.ceil(maxVisiblePages / 2) - 1;
      
      let startPage, endPage;
      
      if (currentPage <= leftOffset) {
        startPage = 1;
        endPage = maxVisiblePages;
      } else if (currentPage + rightOffset >= totalPages) {
        startPage = totalPages - maxVisiblePages + 1;
        endPage = totalPages;
      } else {
        startPage = currentPage - leftOffset;
        endPage = currentPage + rightOffset;
      }
      
      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) {
          pages.push('...');
        }
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push('...');
        }
        pages.push(totalPages);
      }
    }

    return pages.map((page, index) => (
      <button
        key={index}
        onClick={() => typeof page === 'number' ? onPageChange(page) : null}
        disabled={page === '...'}
        className={`flex items-center justify-center w-10 h-10 rounded-md transition-all relative z-10 ${
          currentPage === page
            ? 'bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 text-white shadow-md shadow-purple-300/50'
            : 'bg-white/90 text-gray-700 hover:bg-white border border-white/20 hover:border-purple-200'
        } ${page === '...' ? 'cursor-default bg-transparent border-none hover:bg-transparent text-gray-500' : 'cursor-pointer'}`}
      >
        {page}
      </button>
    ));
  };

  return (
    <div className="relative p-4 rounded-xl overflow-hidden mt-10">
      {/* Background gradient with blur */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 bg-opacity-70 backdrop-blur-sm rounded-xl shadow-xl z-0" />
      
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 relative z-10">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700 font-medium">Sản phẩm mỗi trang:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="border border-white/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/90 text-gray-700 shadow-sm hover:border-purple-300 transition-colors"
          >
            <option value="4">4</option>
            <option value="8">8</option>
            <option value="12">12</option>
            <option value="16">16</option>
            <option value="20">20</option>
          </select>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={handlePrevious}
            disabled={currentPage === 1}
            className={`flex items-center justify-center w-10 h-10 rounded-md transition-all relative z-10 ${
              currentPage === 1
                ? 'bg-white/50 text-gray-400 cursor-not-allowed'
                : 'bg-white/90 text-gray-700 hover:bg-white border border-white/20 hover:border-purple-200 hover:text-purple-600'
            }`}
            aria-label="Trang trước"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          
          <div className="flex gap-1">
            {renderPageNumbers()}
          </div>
          
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className={`flex items-center justify-center w-10 h-10 rounded-md transition-all relative z-10 ${
              currentPage === totalPages
                ? 'bg-white/50 text-gray-400 cursor-not-allowed'
                : 'bg-white/90 text-gray-700 hover:bg-white border border-white/20 hover:border-purple-200 hover:text-purple-600'
            }`}
            aria-label="Trang sau"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}