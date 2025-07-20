'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface CategoryFilterProps {
  categories: Category[];
}

export default function CategoryFilter({ categories }: CategoryFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Xử lý drag scroll
  const startDrag = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
    scrollRef.current.style.scrollBehavior = 'auto';
  };

  const duringDrag = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const endDrag = () => {
    setIsDragging(false);
    if (scrollRef.current) {
      scrollRef.current.style.scrollBehavior = 'smooth';
    }
  };

  const checkScrollPosition = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftScroll(scrollLeft > 0);
      setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 1);
    }
  }, []);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  const handleCategoryChange = (slug: string) => {
    if (isDragging) return;
    router.push(`${pathname}?${createQueryString('category', slug)}`, {
      scroll: false,
    });
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -250 : 250;
      scrollRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth',
      });
      setTimeout(checkScrollPosition, 300);
    }
  };

  useEffect(() => {
    checkScrollPosition();
    window.addEventListener('resize', checkScrollPosition);
    return () => window.removeEventListener('resize', checkScrollPosition);
  }, [checkScrollPosition]);

  return (
    <div className="relative mb-8 group">
      {/* Background gradient sống động như ban đầu */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 rounded-xl shadow-sm z-0"></div>

      {/* Container chính */}
      <div className="relative px-4 py-3">
        {/* Nút scroll trái - Thiết kế sắc nét hơn */}
        {showLeftScroll && (
          <button
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white border border-gray-200 shadow-lg p-2 rounded-full transition-all opacity-100 group-hover:opacity-100 hover:scale-110 backdrop-blur-sm"
            onClick={() => scroll('left')}
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4 text-gray-700 stroke-[3px]" />
          </button>
        )}

        {/* Nút scroll phải - Thiết kế sắc nét hơn */}
        {showRightScroll && (
          <button
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white border border-gray-200 shadow-lg p-2 rounded-full transition-all opacity-100 group-hover:opacity-100 hover:scale-110 backdrop-blur-sm"
            onClick={() => scroll('right')}
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4 text-gray-700 stroke-[3px]" />
          </button>
        )}

        {/* Danh sách danh mục */}
        <div
          ref={scrollRef}
          className={`flex space-x-3 overflow-x-auto px-2 py-2 scroll-smooth no-scrollbar ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          onMouseDown={startDrag}
          onMouseMove={duringDrag}
          onMouseUp={endDrag}
          onMouseLeave={endDrag}
          onScroll={checkScrollPosition}
        >
          {/* Nút "Tất cả" - Giữ gradient như cũ nhưng sắc nét hơn */}
          <button
            className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300 shadow-md ${
              !currentCategory
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-transparent hover:shadow-lg hover:from-blue-600 hover:to-purple-700'
                : 'bg-white/90 text-gray-800 border-gray-200 hover:bg-white hover:border-blue-400 hover:text-blue-600 backdrop-blur-sm'
            }`}
            onClick={() => handleCategoryChange('')}
          >
            Tất cả
          </button>

          {/* Các danh mục - Giữ style gradient khi active */}
          {categories.map((category) => (
            <button
              key={category._id}
              className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300 shadow-md ${
                currentCategory === category.slug
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-transparent hover:shadow-lg hover:from-blue-600 hover:to-purple-700'
                  : 'bg-white/90 text-gray-800 border-gray-200 hover:bg-white hover:border-blue-400 hover:text-blue-600 backdrop-blur-sm'
              }`}
              onClick={() => handleCategoryChange(category.slug)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}