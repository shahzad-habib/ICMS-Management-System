import React from 'react';

export function Modal({ isOpen, onClose, title, description, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity">
      {/* Backdrop tap to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Sheet / Dialog */}
      <div className="relative bg-white w-full sm:max-w-md sm:rounded-xl rounded-t-2xl shadow-xl p-5 sm:p-6 max-h-[92vh] overflow-y-auto">
        {/* Mobile drag handle */}
        <div className="sm:hidden w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />

        <div className="mb-4">
          <h3 className="text-lg font-bold text-[#0f172a]">{title}</h3>
          {description && <p className="text-sm text-[#475569] mt-1">{description}</p>}
        </div>
        <div>
          {children}
        </div>
      </div>
    </div>
  );
}
