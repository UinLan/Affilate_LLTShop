'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FiSave, FiX, FiPlus, FiTrash2, FiLoader } from 'react-icons/fi';
import Image from 'next/image';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface IProduct {
  _id: string;
  productName: string;
  shopeeUrl: string;
  description: string;
  price: number;
  images: string[];
  videoUrl?: string;
  categories?: string[];
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string;

  const [product, setProduct] = useState<IProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [generatedDesc, setGeneratedDesc] = useState('');
  const [showDescModal, setShowDescModal] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${productId}`);
        if (!res.ok) throw new Error('Failed to fetch product');
        const data = await res.json();
        setProduct(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProduct(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleRemoveImage = (index: number) => {
    if (product) {
      setProduct({
        ...product,
        images: product.images.filter((_, i) => i !== index)
      });
    }
  };

  const handleAddImage = () => {
    if (!newImageUrl.trim()) {
      toast.warning('Vui lòng nhập URL hình ảnh');
      return;
    }

    try {
      new URL(newImageUrl);
    } catch {
      toast.error('URL hình ảnh không hợp lệ');
      return;
    }

    if (product) {
      if (product.images.includes(newImageUrl)) {
        toast.warning('Hình ảnh đã tồn tại');
        return;
      }

      setProduct({
        ...product,
        images: [...product.images, newImageUrl]
      });
      setNewImageUrl('');
      toast.success('Đã thêm hình ảnh');
    }
  };

const generateDescription = async () => {
   if (!product || !product.description || product.description.trim().length < 20) {
    toast.warning('Vui lòng nhập mô tả đầy đủ trước khi tạo tóm tắt');
    return;
  }
  
  setIsGeneratingDesc(true);
  try {
    const response = await fetch('/api/ai/generate-description', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        currentDescription: product.description || '',
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate description');
    }

    const { description } = await response.json();
    setGeneratedDesc(description);
    setShowDescModal(true);
    toast.success('Đã tạo mô tả tóm tắt! Vui lòng xem và xác nhận.');
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to generate description';
    setError(message);
    toast.error(`Lỗi: ${message}`);
  } finally {
    setIsGeneratingDesc(false);
  }
};

  const applyGeneratedDesc = () => {
    if (generatedDesc && product) {
      setProduct({
        ...product,
        description: generatedDesc
      });
    }
    setShowDescModal(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    setIsSaving(true);
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update product');
      }

      toast.success('Cập nhật sản phẩm thành công!');
      router.push('/admin');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      toast.error(`Lỗi: ${message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p>Đang tải sản phẩm...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded">
        <p className="font-bold">Lỗi:</p>
        <p>{error}</p>
        <button 
          onClick={() => router.back()}
          className="mt-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Quay lại
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-4 text-center">
        <p>Sản phẩm không tồn tại</p>
        <button 
          onClick={() => router.back()}
          className="mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Chỉnh sửa sản phẩm</h1>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <FiX size={20} /> Đóng
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm</label>
              <input
                type="text"
                name="productName"
                value={product.productName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL Shopee</label>
              <input
                type="url"
                name="shopeeUrl"
                value={product.shopeeUrl}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giá sản phẩm</label>
              <input
                type="number"
                name="price"
                value={product.price || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL Video (nếu có)</label>
              <input
                type="url"
                name="videoUrl"
                value={product.videoUrl || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hình ảnh sản phẩm</label>

<div className="grid grid-cols-3 gap-2 mb-2">
  {product.images.map((img, index) => (
    <div key={index} className="relative group aspect-[3/4] w-full overflow-hidden rounded border">
      <Image
        src={img}
        alt={`Product image ${index + 1}`}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 33vw"
      />
      <button
        type="button"
        onClick={() => handleRemoveImage(index)}
        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <FiTrash2 size={14} />
      </button>
    </div>
  ))}
</div>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="Thêm URL hình ảnh"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleAddImage}
                  className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  <FiPlus size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">Mô tả sản phẩm</label>
            <button
              type="button"
              onClick={generateDescription}
              disabled={isGeneratingDesc}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
            >
              {isGeneratingDesc ? (
                <>
                  <FiLoader className="animate-spin" /> Đang tạo mô tả...
                </>
              ) : (
                'Tạo mô tả tự động'
              )}
            </button>
          </div>
          <textarea
            name="description"
            value={product.description || ''}
            onChange={handleChange}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mt-8 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Đang lưu...
              </>
            ) : (
              <>
                <FiSave /> Lưu thay đổi
              </>
            )}
          </button>
        </div>
      </form>

      {/* Modal xem trước mô tả */}
      {showDescModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Xem trước mô tả được tạo</h2>
              <button 
                onClick={() => setShowDescModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto mb-4 p-4 bg-gray-50 rounded">
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: generatedDesc }}
              />
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDescModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Hủy bỏ
              </button>
              <button
                onClick={applyGeneratedDesc}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Áp dụng mô tả
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}