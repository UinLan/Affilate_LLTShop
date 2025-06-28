// components/admin/CategoryTable.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import { ICategory } from '@/types/product';

export default function CategoryTable() {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        if (!res.ok) throw new Error('Failed to fetch categories');
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // ... các hàm xử lý khác tương tự ProductTable

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        {/* Tương tự ProductTable nhưng cho danh mục */}
      </table>
    </div>
  );
}