'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ShoppingCart, X } from 'lucide-react';

interface LoginRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginRequiredModal: React.FC<LoginRequiredModalProps> = ({
  isOpen,
  onClose,
}) => {
  const router = useRouter();
  const pathname = usePathname();

  if (!isOpen) return null;

  const handleSignIn = () => {
    const redirectUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
    router.push(redirectUrl);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center font-poppins"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Panel */}
      <div className="relative z-10 w-full max-w-sm mx-4 bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-5">
          <ShoppingCart size={32} className="text-blue-600" />
        </div>

        {/* Heading */}
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Sign in to continue
        </h2>

        {/* Message */}
        <p className="text-sm text-gray-500 mb-7 leading-relaxed">
          You need to be logged in to add items to your cart.
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={handleSignIn}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg transition-colors cursor-pointer"
          >
            Sign In
          </button>
          <button
            onClick={onClose}
            className="w-full py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium text-sm rounded-lg transition-colors cursor-pointer"
          >
            Continue Browsing
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginRequiredModal;
