import React from 'react';

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Slider({ label, className = '', ...props }: SliderProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm text-gray-400 font-medium">{label}</label>
      )}
      <input
        type="range"
        className={`w-full h-2 bg-surface-700 rounded-lg appearance-none cursor-pointer slider-thumb ${className}`}
        {...props}
      />
      <style>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          background: rgb(var(--color-primary-500));
          border-radius: 50%;
          cursor: pointer;
        }
        .slider-thumb::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: rgb(var(--color-primary-500));
          border-radius: 50%;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
}
