'use client';

import React, { useEffect } from 'react';
import { Loader2, X } from 'lucide-react';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  itemName?: string;
  description?: string;
  isDeleting?: boolean;
}

const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Delete Confirmation',
  itemName,
  description,
  isDeleting = false,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDeleting) {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isDeleting, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150"
      onClick={() => {
        if (!isDeleting) onClose();
      }}
    >
      <div
        className="w-full max-w-[440px] rounded-xl bg-[#0e131d] border border-[#232b3b] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1f2838]">
          <h3 className="text-base font-semibold text-white tracking-tight">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="text-gray-400 hover:text-white transition disabled:opacity-50 cursor-pointer p-1 rounded-md hover:bg-[#1a2231]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 text-sm text-gray-300 leading-relaxed space-y-1">
          {description ? (
            <p>{description}</p>
          ) : (
            <>
              <p>
                Are you sure you want to delete{' '}
                <span className="font-semibold text-white">
                  {itemName || 'this item'}
                </span>
                ?
              </p>
              <p className="text-gray-400">
                This action{' '}
                <span className="text-gray-200 font-medium">
                  cannot be undone
                </span>
                .
              </p>
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 pb-5 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 rounded-lg bg-[#18202f] hover:bg-[#202b3e] text-gray-200 text-sm font-medium transition disabled:opacity-50 cursor-pointer border border-[#263347]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-5 py-2 rounded-lg bg-[#e53935] hover:bg-[#d32f2f] active:bg-[#c62828] text-white text-sm font-medium transition disabled:opacity-50 cursor-pointer flex items-center gap-2 shadow-sm"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <span>Delete</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
