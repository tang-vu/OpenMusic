import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export function Select({ label, className = '', children, ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm text-gray-400 font-medium">{label}</label>
      )}
      <select
        className={`bg-surface-800 border border-surface-700 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent cursor-pointer ${className}`}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}
