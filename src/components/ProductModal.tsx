// components/ProductModal.tsx
'use client';

import { IProductClient } from '@/types/product';
import { useEffect, useState } from 'react';

interface ProductModalProps {
  product: IProductClient;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isValidVideo, setIsValidVideo] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Kiểm tra URL video khi modal mở
      if (product.videoUrl) {
        checkVideoValidity(product.videoUrl);
      }
    } else {
      document.body.style.overflow = 'auto';
      setVideoError(null);
      setIsValidVideo(false);
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, product.videoUrl]);

  const checkVideoValidity = (url: string) => {
    try {
      new URL(url); // Kiểm tra URL hợp lệ
      setIsValidVideo(true);
      setVideoError(null);
    } catch (e) {
      setIsValidVideo(false);
      setVideoError('URL video không hợp lệ');
    }
  };

  const handleVideoError = () => {
    setVideoError('Không thể tải video. Vui lòng kiểm tra lại đường dẫn.');
    setIsValidVideo(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold">{product.productName}</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {/* Phần hiển thị video */}
          {product.videoUrl && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Video sản phẩm</h3>
              {isValidVideo ? (
                <div className="relative pt-[56.25%] rounded-lg overflow-hidden bg-black">
                  <video
                    controls
                    className="absolute top-0 left-0 w-full h-full"
                    src={product.videoUrl}
                    onError={handleVideoError}
                  >
                    <source src={product.videoUrl} type="video/mp4" />
                    Trình duyệt của bạn không hỗ trợ video HTML5.
                  </video>
                </div>
              ) : (
                <div className="bg-gray-100 p-4 rounded-lg text-center">
                  {videoError || 'Đang kiểm tra video...'}
                </div>
              )}
            </div>
          )}

          {product.images && product.images.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Hình ảnh sản phẩm</h3>
              <div className="grid grid-cols-2 gap-2">
                {product.images.map((img, index) => (
                  <div key={index} className="relative aspect-square">
                    <img
                      src={img}
                      alt={`${product.productName} ${index + 1}`}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {product.price && (
            <div className="mb-4">
              <p className="text-xl text-blue-600 font-bold">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                }).format(product.price)}
              </p>
            </div>
          )}

          {product.description && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Mô tả sản phẩm</h3>
              <p className="text-gray-700 whitespace-pre-line">{product.description}</p>
            </div>
          )}

          <div className="mt-4 flex gap-2">
            <a
              href={product.shopeeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
            >
              Xem trên Shopee
            </a>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}