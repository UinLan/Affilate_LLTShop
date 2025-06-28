'use client'; // Thêm directive này ở đầu file

import Image from 'next/image';
import Link from 'next/link';
import { IProductClient } from '@/types/product';
import { useState } from 'react';

interface ProductCardProps {
  product: IProductClient;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [imageSrc, setImageSrc] = useState(
    isValidImageUrl(product.images[0]) ? product.images[0] : '/placeholder-image.jpg'
  );

  // Kiểm tra URL hình ảnh hợp lệ
  function isValidImageUrl(url: string) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={product.tiktokUrl} target="_blank" rel="noopener noreferrer">
        <div className="relative aspect-square">
          <Image
            src={imageSrc}
            alt={product.productName}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={() => setImageSrc('/placeholder-image.jpg')}
          />
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2">{product.productName}</h3>
          {product.price && (
            <p className="text-blue-600 font-medium">
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
              }).format(product.price)}
            </p>
          )}
        </div>
      </Link>
    </div>
  );
}