'use client';

import { useState } from 'react';

export default function EmployeeSearch() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="🔍 Search employees..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
        🔍
      </div>
    </div>
  );
}

