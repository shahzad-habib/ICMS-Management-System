import React from 'react';

export function Modal({ isOpen, onClose, title, description, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm transition-opacity">
      <div className="bg-surface w-full max-w-md rounded-xl2 shadow-xl p-6 relative">
        <div className="mb-5">
          <h3 className="text-xl font-bold text-[#0f172a]">{title}</h3>
          {description && <p className="text-sm text-[#475569] mt-1.5">{description}</p>}
        </div>
        <div>
          {children}
        </div>
      </div>
    </div>
  );
}
