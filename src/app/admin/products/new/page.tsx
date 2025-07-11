'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IProductForm } from '@/types/product';

export default function NewProductPage() {
  const router = useRouter();
  const [form, setForm] = useState<IProductForm>({
    shopeeUrl: '',
    productName: '',
    images: [''],
    postingTemplates: [],
    videoUrl: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const validateForm = () => {
    if (!form.productName.trim()) {
      setError('Tên sản phẩm là bắt buộc');
      return false;
    }
    
    if (form.images.length === 0 || form.images.some(img => !img.trim())) {
      setError('Vui lòng cung cấp ít nhất 1 hình ảnh hợp lệ');
      return false;
    }
    
    if (form.videoUrl && !form.videoUrl.match(/\.(mp4|mov|avi|mpeg)$/i)) {
      setError('Video phải là link trực tiếp đến file (mp4, mov, avi, mpeg)');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          images: form.images.filter(img => img.trim() !== '')
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Có lỗi xảy ra khi lưu sản phẩm');
      }

      const data = await response.json();
      router.push(`/admin/products/${data.data.product._id}`);
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi lưu sản phẩm');
      console.error('Lỗi khi submit:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddImage = () => {
    if (form.images.length >= 4) return;
    setForm(prev => ({ ...prev, images: [...prev.images, ''] }));
  };

  const handleRemoveImage = (index: number) => {
    const newImages = form.images.filter((_, i) => i !== index);
    setForm({ ...form, images: newImages });
  };

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...form.images];
    newImages[index] = value;
    setForm({ ...form, images: newImages });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Thêm sản phẩm mới</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 rounded-xl shadow-md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Link Shopee Affiliate <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={form.shopeeUrl}
              onChange={(e) => setForm({ ...form, shopeeUrl: e.target.value })}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm px-3 py-2"
              placeholder="https://shope.ee/..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên sản phẩm <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.productName}
              onChange={(e) => setForm({ ...form, productName: e.target.value })}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm px-3 py-2"
              placeholder="Nhập tên sản phẩm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Video URL (tùy chọn)</label>
            <input
              type="url"
              value={form.videoUrl}
              onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm px-3 py-2"
              placeholder="https://example.com/video.mp4"
            />
            <p className="mt-1 text-xs text-gray-500">
              Chỉ hỗ trợ link trực tiếp đến file video (mp4, mov, avi, mpeg)
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hình ảnh sản phẩm (tối đa 4) <span className="text-red-500">*</span>
          </label>
          <div className="space-y-3">
            {form.images.map((img, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="url"
                  value={img}
                  onChange={(e) => handleImageChange(index, e.target.value)}
                  className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm px-3 py-2"
                  placeholder="URL hình ảnh"
                  required
                />
                {form.images.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium px-2 py-1 rounded"
                  >
                    Xóa
                  </button>
                )}
              </div>
            ))}

            {form.images.length < 4 && (
              <button
                type="button"
                onClick={handleAddImage}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Thêm hình ảnh
              </button>
            )}
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg shadow-md disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang xử lý...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
                Lưu và đăng bài
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}