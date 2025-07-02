// components/SearchBar.tsx
'use client';

import { useState } from 'react';

interface SearchBarProps {
  onSearch: (term: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [input, setInput] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    onSearch(value);
  };

  return (
   <div className="mb-6 flex justify-center">
  <input
    type="text"
    value={input}
    onChange={handleChange}
    placeholder="🔍 Tìm kiếm sản phẩm..."
    className="w-full max-w-xl px-5 py-3 border border-gray-300 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
  />
</div>
  );
}
