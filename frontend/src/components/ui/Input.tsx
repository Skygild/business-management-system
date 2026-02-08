'use client';

import { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, fullWidth = true, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              block rounded-lg border bg-white px-3 py-2 text-sm text-gray-900
              placeholder:text-gray-400
              focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500
              disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500
              ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'}
              ${icon ? 'pl-10' : ''}
              ${fullWidth ? 'w-full' : ''}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';
