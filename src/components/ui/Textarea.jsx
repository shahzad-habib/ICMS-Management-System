import React from 'react';

export function Textarea({ className = '', ...props }) {
  return (
    <textarea
      className={`icms-input min-h-[100px] resize-y ${className}`}
      {...props}
    />
  );
}
