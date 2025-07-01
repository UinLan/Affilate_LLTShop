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
    <div className="mb-6">
      <input
        type="text"
        value={input}
        onChange={handleChange}
        placeholder="Tìm kiếm sản phẩm..."
        className="w-full px-4 py-2 border rounded shadow-sm"
      />
    </div>
  );
}
