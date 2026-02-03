import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
}

export function Card({ title, className = '', children, ...props }: CardProps) {
  return (
    <div
      className={`bg-surface-800 border border-surface-700 rounded-lg p-4 ${className}`}
      {...props}
    >
      {title && <h3 className="text-lg font-semibold mb-3">{title}</h3>}
      {children}
    </div>
  );
}
