'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { IProduct } from '@/types/product';
import { FiArrowLeft, FiEdit, FiTrash2 } from 'react-icons/fi';

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params?.id as string;

  const [product, setProduct] = useState<IProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${productId}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to fetch product');
        }

        setProduct(data.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleDelete = async () => {
    if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      try {
        const res = await fetch(`/api/products/${productId}`, {
          method: 'DELETE',
        });

        if (!res.ok) {
          throw new Error('Failed to delete product');
        }

        router.push('/admin/products');
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
        >
          Quay lại
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <p>Sản phẩm không tồn tại</p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
        >
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center text-indigo-600 hover:text-indigo-800"
        >
          <FiArrowLeft className="mr-1" /> Quay lại
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{product.productName}</h1>

          {product.shopeeUrl && (
            <div className="mb-4">
              <a
                href={product.shopeeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {product.shopeeUrl}
              </a>
            </div>
          )}

          {product.videoUrl && (
  <div className="mb-6">
    <h2 className="text-lg font-semibold mb-2">Video sản phẩm</h2>
    <div className="relative pt-[56.25%] rounded-lg overflow-hidden bg-black">
      <video
        controls
        className="absolute top-0 left-0 w-full h-full"
        src={product.videoUrl}
        onError={(e) => {
          console.error('Lỗi tải video:', e);
          // Có thể thêm fallback UI ở đây
        }}
      >
        <source src={product.videoUrl} type="video/mp4" />
        Trình duyệt của bạn không hỗ trợ video HTML5.
      </video>
    </div>
  </div>
)}

          {product.images && product.images.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Hình ảnh sản phẩm</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {product.images.map((img, index) => (
                  <div key={index} className="rounded-lg overflow-hidden">
                    <img
                      src={img}
                      alt={`${product.productName} ${index + 1}`}
                      className="w-full h-auto object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            {product.description && (
              <div>
                <h2 className="text-lg font-semibold mb-1">Mô tả sản phẩm</h2>
                <p className="text-gray-700 whitespace-pre-line">{product.description}</p>
              </div>
            )}

            {product.price && (
              <div>
                <h2 className="text-lg font-semibold mb-1">Giá</h2>
                <p className="text-gray-700">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(product.price)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
