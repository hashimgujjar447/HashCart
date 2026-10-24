'use client';

import React, { useEffect, useMemo } from 'react';
import { AlertTriangle, Clock, Loader2, RotateCcw, Trash2, X } from 'lucide-react';

interface ProductImage {
  id: string;
  file_id: string;
  url: string;
  shopId?: string | null;
  userId?: string | null;
  productId?: string | null;
}

interface Product {
  id: string;
  title: string;
  description?: string;
  slug?: string;
  category?: string;
  sale_price?: number;
  stock?: number;
  images?: ProductImage[];
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface DeleteConfirmationModalProps {
  product: Product | null;
  onClose: () => void;
  onConfirm: () => void;
  onRestore?: () => void;
  isDeleting?: boolean;
  isRestoring?: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  product,
  onClose,
  onConfirm,
  onRestore,
  isDeleting = false,
  isRestoring = false,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDeleting && !isRestoring) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDeleting, isRestoring, onClose]);

  const timeLeft = useMemo(() => {
    if (!product?.isDeleted || !product?.updatedAt) return null;
    const deletedTime = new Date(product.updatedAt).getTime();
    const now = new Date().getTime();
    const diffHours = (now - deletedTime) / (1000 * 60 * 60);
    const remainingHours = Math.max(0, 24 - diffHours);
    if (remainingHours <= 0) return 'Expired';
    const hours = Math.floor(remainingHours);
    const minutes = Math.floor((remainingHours - hours) * 60);
    return `${hours}h ${minutes}m`;
  }, [product?.isDeleted, product?.updatedAt]);

  if (!product) return null;

  const isTrash = Boolean(product.isDeleted);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150"
      onClick={() => {
        if (!isDeleting && !isRestoring) onClose();
      }}
    >
      <div
        className="w-full max-w-[460px] rounded-xl bg-[#0e131d] border border-[#232b3b] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1f2838]">
          <div className="flex items-center gap-2.5">
            {isTrash ? (
              <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 flex items-center justify-center shrink-0">
                <RotateCcw className="w-4 h-4" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-red-950/60 border border-red-800/40 text-red-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
            )}
            <h3 className="text-base font-semibold text-white tracking-tight">
              {isTrash ? 'Restore Product' : 'Delete Product'}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting || isRestoring}
            className="text-gray-400 hover:text-white transition disabled:opacity-50 cursor-pointer p-1 rounded-md hover:bg-[#1a2231]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="text-sm text-gray-300 leading-relaxed">
            {isTrash ? (
              <p>
                Are you sure you want to restore{' '}
                <span className="font-semibold text-white">
                  "{product.title}"
                </span>
                ? It will be moved back to your active products catalog.
              </p>
            ) : (
              <p>
                Are you sure you want to delete{' '}
                <span className="font-semibold text-white">
                  "{product.title}"
                </span>
                ? This product will be moved to trash and can be restored within
                24 hours.
              </p>
            )}
          </div>

          {isTrash && timeLeft && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-[#141c2c] border border-[#223049] text-xs text-gray-300">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                Restore window:{' '}
                <strong className="text-amber-300 font-semibold">
                  {timeLeft} remaining
                </strong>{' '}
                before permanent deletion.
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 pb-5 pt-2 border-t border-[#1a2333] bg-[#0c121e]">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting || isRestoring}
            className="px-4 py-2 rounded-lg bg-[#18202f] hover:bg-[#202b3e] text-gray-300 text-sm font-medium transition disabled:opacity-50 cursor-pointer border border-[#263347]"
          >
            Cancel
          </button>

          {isTrash ? (
            <button
              type="button"
              onClick={onRestore}
              disabled={isRestoring || isDeleting}
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-medium transition disabled:opacity-50 cursor-pointer flex items-center gap-2 shadow-sm"
            >
              {isRestoring ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Restoring...</span>
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4" />
                  <span>Restore Product</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting || isRestoring}
              className="px-5 py-2 rounded-lg bg-[#e53935] hover:bg-[#d32f2f] active:bg-[#c62828] text-white text-sm font-medium transition disabled:opacity-50 cursor-pointer flex items-center gap-2 shadow-sm"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Moving to trash...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Move to Trash</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
