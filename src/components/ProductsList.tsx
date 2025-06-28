// components/ProductsList.tsx
'use client';

import { useEffect, useState } from 'react';
import { IProductClient } from '@/types/product';
import ProductCard from './ProductCard';

export default function ProductsList() {
  const [products, setProducts] = useState<IProductClient[]>([]);
  // ... giữ nguyên phần còn lại
}