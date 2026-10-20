'use client';

import React from 'react';
import Image from 'next/image';
import { Loader2, Pencil, WandSparkles, X } from 'lucide-react';

interface ImagePlaceholderProps {
  size: string;
  small?: boolean;
  onImageChange: (file: File | null, index: number) => void;
  onImageRemove: (index: number) => void;
  defaultImage?: string | null;
  index?: number | null;
  setOpenImageModel?: (open: boolean) => void;
  onEdit?: (index: number) => void;
  isUploading?: boolean;
}

const ImagePlaceholder = ({
  size,
  small = false,
  onImageChange,
  onImageRemove,
  defaultImage = null,
  index = 0,
  setOpenImageModel,
  onEdit,
  isUploading = false,
}: ImagePlaceholderProps) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event?.target?.files?.[0];
    if (file) {
      onImageChange(file, index ?? 0);
    }
    event.target.value = '';
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onImageRemove(index ?? 0);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(index ?? 0);
    } else if (setOpenImageModel) {
      setOpenImageModel(true);
    }
  };

  const inputId = `image-upload-${index ?? 0}`;

  return (
    <div
      className={`relative w-full ${
        small ? 'h-[110px]' : 'aspect-[765/850] min-h-[280px]'
      } rounded-xl bg-[#12151c] border border-[#232936] flex flex-col justify-center items-center overflow-hidden transition-all duration-200 group hover:border-[#333c4d]`}
    >
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        id={inputId}
        disabled={isUploading}
      />

      {isUploading ? (
        <div className="w-full h-full flex flex-col justify-center items-center gap-2 select-none">
          <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
          <span className="text-[11px] text-gray-400 font-medium">
            Uploading...
          </span>
        </div>
      ) : defaultImage ? (
        <>
          <Image
            src={defaultImage}
            alt="Product Preview"
            fill
            unoptimized
            className="object-cover w-full h-full rounded-xl"
          />

          <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-20">
            <button
              type="button"
              onClick={handleEdit}
              className="w-7 h-7 rounded-lg bg-blue-600/90 hover:bg-blue-600 text-white flex items-center justify-center shadow-lg transition-colors cursor-pointer"
              title="Enhance image"
            >
              <WandSparkles className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="w-7 h-7 rounded-lg bg-red-600/90 hover:bg-red-600 text-white flex items-center justify-center shadow-lg transition-colors cursor-pointer"
              title="Remove image"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </>
      ) : (
        <label
          htmlFor={inputId}
          className="w-full h-full flex flex-col justify-center items-center cursor-pointer p-4 select-none"
        >
          <div className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-[#182844] border border-[#24395c] text-[#60a5fa] flex items-center justify-center shadow-sm group-hover:bg-[#1e345b] transition-colors">
            <Pencil className="w-3.5 h-3.5" />
          </div>

          <span
            className={`font-bold text-gray-200 tracking-wider mb-2 ${
              small ? 'text-sm' : 'text-3xl'
            }`}
          >
            {size}
          </span>
          <p
            className={`text-gray-400 text-center font-normal leading-relaxed ${
              small ? 'text-[10px] max-w-[120px]' : 'text-xs max-w-[210px]'
            }`}
          >
            Please choose an image according to the expected ratio
          </p>
        </label>
      )}
    </div>
  );
};

export default ImagePlaceholder;
