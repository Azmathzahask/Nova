import React from 'react';

export function Button({ children, onClick, variant = 'default', className = '' }) {
  const base = 'px-4 py-2 rounded font-medium';
  const styles = variant === 'default'
    ? 'bg-blue-600 text-white hover:bg-blue-700'
    : 'border border-gray-300 text-gray-700 hover:bg-gray-100';
  return (
    <button onClick={onClick} className={`${base} ${styles} ${className}`}>
      {children}
    </button>
  );
}
