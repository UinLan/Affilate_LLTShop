'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const HomePageClient = dynamic(() => import('@/components/HomePageClient'), {
  ssr: false,
});

interface Props {
  categories: any[]; // sửa nếu có type cụ thể
}

export default function HomeWrapper({ categories }: Props) {
  return (
    <Suspense fallback={<div>Đang tải sản phẩm...</div>}>
      <HomePageClient categories={categories} />
    </Suspense>
  );
}
