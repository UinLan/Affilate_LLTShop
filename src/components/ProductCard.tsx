// components/ProductCard.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { IProductClient } from '@/types/product';
import { useState } from 'react';
import ProductModal from './ProductModal';

interface ProductCardProps {
  product: IProductClient;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [imageSrc, setImageSrc] = useState(
    isValidImageUrl(product.images[0]) ? product.images[0] : '/placeholder-image.jpg'
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  function isValidImageUrl(url: string) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-transform duration-200 h-full flex flex-col">
        {/* Phần hình ảnh vẫn giữ nguyên */}
        <Link href={product.shopeeUrl || '#'} target="_blank" rel="noopener noreferrer">
          <div className="relative aspect-square flex-shrink-0 cursor-pointer">
          <Image
            src={imageSrc}
            alt={product.productName}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            onError={() => setImageSrc('/placeholder-image.jpg')}
            priority={false}
          />
        </div>
        </Link>
        
        <div className="p-3 flex-grow flex flex-col">
         <Link href={product.shopeeUrl || '#'} target="_blank" rel="noopener noreferrer">
           <h3 className="font-semibold text-sm sm:text-base mb-1 line-clamp-2">
            {product.productName}
          </h3>
           </Link>
          {product.price && (
            <p className="text-blue-600 font-medium text-sm sm:text-base">
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
              }).format(product.price)}
            </p>
          )}
          
          {/* Nút Xem chi tiết */}
<button 
  onClick={() => setIsModalOpen(true)}
  className="mt-2 px-3 py-1 rounded text-sm font-semibold text-white bg-gradient-to-r from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600 transition-all duration-300 shadow-md border hover:shadow-lg"
>
  Xem chi tiết
</button>

          
          {product.categories && product.categories.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {product.categories.map(category => (
                <span 
                  key={category._id} 
                  className="text-[10px] sm:text-xs bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded"
                >
                  {category.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Modal chi tiết sản phẩm */}
      <ProductModal 
        product={product}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}