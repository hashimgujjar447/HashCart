'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';

interface EnhanceImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
  onApply?: (newUrl: string) => void;
}

const EnhanceImageModal: React.FC<EnhanceImageModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl bg-[#0f141d] border border-[#242c3d] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1f2838]">
          <h3 className="text-base font-semibold text-white tracking-tight">
            Enhance Product Image
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white transition p-1.5 rounded-lg hover:bg-[#1a2231] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          <div className="relative w-full aspect-[16/9] min-h-[320px] rounded-xl overflow-hidden bg-[#0a0d14] border border-[#1e2636] flex items-center justify-center">
            <Image
              src={imageUrl}
              alt="Enhanced Preview"
              fill
              unoptimized
              className="object-contain w-full h-full rounded-xl"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhanceImageModal;
