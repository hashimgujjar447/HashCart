'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  Layers,
  Loader2,
  RotateCcw,
  Scissors,
  Sparkles,
  Wand2,
  X,
  Zap,
} from 'lucide-react';
import { enhancements } from '@/app/utils/AI.enhancements';

interface EnhanceImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
  onApply?: (newUrl: string) => void;
  setSelectedImage?: (url: string) => void;
}

const getEffectIcon = (effect: string) => {
  switch (effect) {
    case 'e-removedotbg':
      return <Scissors className="w-3.5 h-3.5" />;
    case 'e-shadowdrop':
      return <Layers className="w-3.5 h-3.5" />;
    case 'e-retouch':
      return <Sparkles className="w-3.5 h-3.5" />;
    case 'e-upscale':
      return <Zap className="w-3.5 h-3.5" />;
    default:
      return <Wand2 className="w-3.5 h-3.5" />;
  }
};

const EnhanceImageModal: React.FC<EnhanceImageModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  onApply,
  setSelectedImage,
}) => {
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [originalUrl, setOriginalUrl] = useState<string>('');
  const [activeEffect, setActiveEffect] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(false);

  useEffect(() => {
    if (imageUrl) {
      setCurrentUrl(imageUrl);
      try {
        const urlObj = new URL(imageUrl);
        const existingTr = urlObj.searchParams.get('tr');
        setActiveEffect(existingTr);
        urlObj.searchParams.delete('tr');
        setOriginalUrl(urlObj.toString());
      } catch {
        setOriginalUrl(imageUrl);
        setActiveEffect(null);
      }
    }
  }, [imageUrl]);

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

  const applyTransformation = (transformation: string) => {
    setIsImageLoading(true);

    if (activeEffect === transformation) {
      setActiveEffect(null);
      setCurrentUrl(originalUrl);
      if (setSelectedImage) setSelectedImage(originalUrl);
      return;
    }

    try {
      const urlObj = new URL(originalUrl);
      urlObj.searchParams.set('tr', transformation);
      const transformed = urlObj.toString();
      setActiveEffect(transformation);
      setCurrentUrl(transformed);
      if (setSelectedImage) setSelectedImage(transformed);
    } catch {
      const sep = originalUrl.includes('?') ? '&' : '?';
      const transformed = `${originalUrl}${sep}tr=${transformation}`;
      setActiveEffect(transformation);
      setCurrentUrl(transformed);
      if (setSelectedImage) setSelectedImage(transformed);
    }
  };

  const handleReset = () => {
    setIsImageLoading(true);
    setActiveEffect(null);
    setCurrentUrl(originalUrl);
    if (setSelectedImage) setSelectedImage(originalUrl);
  };

  const handleSave = () => {
    if (onApply) {
      onApply(currentUrl);
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-[#0e131d] border border-[#232b3b] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1f2838] bg-[#0e131d] shrink-0">
          <div className="flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-white tracking-tight">
              Enhance Product Image
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white transition p-1.5 rounded-lg hover:bg-[#1a2231] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          <div className="relative w-full h-[220px] sm:h-[250px] rounded-xl overflow-hidden bg-[#070a10] border border-[#1d2535] flex items-center justify-center">
            {isImageLoading && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center gap-2 z-10">
                <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                <span className="text-xs text-gray-200 font-medium">
                  Applying AI enhancement...
                </span>
              </div>
            )}

            {currentUrl && (
              <Image
                src={currentUrl}
                alt="Enhanced Preview"
                fill
                unoptimized
                onLoadingComplete={() => setIsImageLoading(false)}
                onLoad={() => setIsImageLoading(false)}
                className="object-contain p-2"
              />
            )}

            {activeEffect && (
              <div className="absolute top-2.5 left-2.5 bg-blue-600/90 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-md z-10">
                <Sparkles className="w-3 h-3" />
                <span>
                  {enhancements.find((e) => e.effect === activeEffect)?.label ||
                    activeEffect}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                AI Enhancements
              </span>
              {activeEffect && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-[11px] text-gray-400 hover:text-blue-400 flex items-center gap-1 transition cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset to original</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {enhancements.map((enhancement) => {
                const isActive = activeEffect === enhancement.effect;
                return (
                  <button
                    key={enhancement.effect}
                    type="button"
                    onClick={() => applyTransformation(enhancement.effect)}
                    className={`px-3 py-2.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer border ${
                      isActive
                        ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/30 font-semibold'
                        : 'bg-[#141b27] hover:bg-[#1a2333] border-[#222e42] text-gray-300 hover:text-white'
                    }`}
                  >
                    {getEffectIcon(enhancement.effect)}
                    <span className="truncate">{enhancement.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 px-5 py-3 border-t border-[#1f2838] bg-[#0c1017] shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#141b27] hover:bg-[#1c2536] border border-[#232f42] text-gray-300 text-xs font-medium transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold transition cursor-pointer shadow-md shadow-blue-600/20"
          >
            Apply Enhancement
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnhanceImageModal;
