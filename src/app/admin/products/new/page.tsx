'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IProductForm } from '@/types/product';

export default function NewProductPage() {
  const router = useRouter();
  const [form, setForm] = useState<IProductForm>({
    shopeeUrl: '',
    productName: '',
    images: [],
    postingTemplates: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!response.ok) throw new Error(await response.text());

      const data = await response.json();
      router.push(`/admin/products/${data.product._id}`);
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddImage = () => {
    if (form.images.length >= 4) return;
    setForm((prev) => ({ ...prev, images: [...prev.images, ''] }));
  };

  const handleRemoveImage = (index: number) => {
    const newImages = form.images.filter((_, i) => i !== index);
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Link shopee Affiliate</label>
            <input
              type="url"
              value={form.shopeeUrl}
              onChange={(e) => setForm({ ...form, shopeeUrl: e.target.value })}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm px-3 py-2"
              placeholder="https://s.shopee.vn/..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm</label>
            <input
              type="text"
              value={form.productName}
              onChange={(e) => setForm({ ...form, productName: e.target.value })}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm px-3 py-2"
              placeholder="Nhập tên sản phẩm"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh (tối đa 4)</label>
          <div className="space-y-3">
            {form.images.map((img, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="url"
                  value={img}
                  onChange={(e) => {
                    const newImages = [...form.images];
                    newImages[index] = e.target.value;
                    setForm({ ...form, images: newImages });
                  }}
                  className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm px-3 py-2"
                  placeholder="URL hình ảnh"
                  required
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="text-red-500 hover:text-red-700 text-sm font-medium"
                >
                  🗑 Xóa
                </button>
              </div>
            ))}

            {form.images.length < 4 && (
              <button
                type="button"
                onClick={handleAddImage}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium underline"
              >
                + Thêm hình ảnh
              </button>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg shadow-md disabled:opacity-50"
          >
            {isSubmitting ? 'Đang lưu...' : 'Lưu và đăng bài'}
          </button>
        </div>
      </form>
    </div>
  );
}
