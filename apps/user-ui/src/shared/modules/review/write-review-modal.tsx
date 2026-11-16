'use client';

import React, { useState } from 'react';
import {
  Star,
  X,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Store,
  Sparkles,
} from 'lucide-react';
import axiosInstance from '@/utils/axiosInstance';
import Image from 'next/image';

interface WriteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  shopId: string;
  shopName?: string;
  productId?: string;
  productTitle?: string;
  productImage?: string;
  initialRating?: number;
  initialComment?: string;
  onSuccess?: () => void;
}

const RATING_LABELS: Record<number, string> = {
  1: '1 Star — Poor quality or service',
  2: '2 Stars — Fair, had notable issues',
  3: '3 Stars — Good, meets expectations',
  4: '4 Stars — Very Good, highly satisfied',
  5: '5 Stars — Excellent! Outstanding product & store',
};

export default function WriteReviewModal({
  isOpen,
  onClose,
  shopId,
  shopName,
  productId,
  productTitle,
  productImage,
  initialRating = 5,
  initialComment = '',
  onSuccess,
}: WriteReviewModalProps) {
  const [rating, setRating] = useState<number>(initialRating);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>(initialComment);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const activeRating = hoverRating > 0 ? hoverRating : rating;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!comment.trim() || comment.trim().length < 3) {
      setErrorMessage('Please write at least a few words describing your experience.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await axiosInstance.post('/auth/add-review', {
        shopId,
        productId,
        rating,
        comment: comment.trim(),
      });

      setSuccessMessage(
        res.data?.message || 'Review submitted successfully! Thank you for your feedback.',
      );

      if (onSuccess) {
        onSuccess();
      }

      setTimeout(() => {
        onClose();
        setSuccessMessage(null);
      }, 1500);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        'Could not submit review. Only verified buyers with a delivered order can review this product.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transform transition-all animate-scaleUp">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center">
              <Star className="w-5 h-5 fill-amber-500" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 leading-tight">
                Verified Buyer Review
              </h3>
              <p className="text-xs text-gray-500">
                Share your genuine product experience
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Product / Shop context card */}
        <div className="px-6 pt-5 pb-2">
          <div className="p-3 rounded-xl bg-gray-50 border border-gray-200/80 flex items-center gap-3">
            {productImage ? (
              <div className="relative w-12 h-12 rounded-lg bg-white border border-gray-200 overflow-hidden shrink-0">
                <Image
                  src={productImage}
                  alt={productTitle || 'Product'}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <Store size={22} />
              </div>
            )}

            <div className="min-w-0 flex-1">
              {productTitle && (
                <h4 className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-1">
                  {productTitle}
                </h4>
              )}
              {shopName && (
                <p className="text-xs text-gray-500 truncate mt-0.5">
                  Sold by: <span className="font-semibold text-gray-700">{shopName}</span>
                </p>
              )}
            </div>

            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verified Purchase</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 pt-3 space-y-5">
          {/* Status Alert Banners */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{successMessage}</span>
            </div>
          )}

          {/* Interactive Star Rating */}
          <div className="text-center py-2 space-y-2">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              Overall Rating
            </label>

            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = star <= activeRating;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 text-gray-300 hover:scale-115 transition-transform focus:outline-none cursor-pointer"
                  >
                    <Star
                      size={32}
                      className={`transition-colors duration-150 ${
                        isFilled
                          ? 'text-amber-400 fill-amber-400 drop-shadow-xs'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            <p className="text-xs font-semibold text-gray-700 h-4 transition-all">
              {RATING_LABELS[activeRating] || ''}
            </p>
          </div>

          {/* Written feedback textarea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Your Review
              </label>
              <span className="text-[11px] text-gray-400">
                {comment.length}/1000
              </span>
            </div>

            <textarea
              rows={4}
              maxLength={1000}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you like or dislike about this product? How was the build quality, sizing, and packaging? Your honest feedback helps other verified buyers."
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-gray-900 placeholder-gray-400 text-xs sm:text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 resize-none transition"
              required
            />
          </div>

          {/* Trust and Anti-Fake Info Box */}
          <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 flex items-start gap-2.5 text-xs text-blue-900 leading-relaxed">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span>
              <strong>Authentic Review Guarantee:</strong> Only buyers who have
              completed and received this order can submit a review. Fake or
              unverified reviews are automatically blocked.
            </span>
          </div>

          {/* Modal Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold text-xs transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !!successMessage}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 disabled:opacity-50 transition cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Publishing Review...</span>
                </>
              ) : (
                <span>Publish Review</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
