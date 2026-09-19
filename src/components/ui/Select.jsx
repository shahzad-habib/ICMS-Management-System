import React from 'react';

export function Select({ className = '', children, ...props }) {
  return (
    <select
      className={`icms-input bg-white appearance-none ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}
