'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, Eye, ShoppingBag, Star, Clock } from 'lucide-react';
import ProductDetailsCard from './product-details.card';

export interface ProductImage {
  id?: string;
  file_id?: string;
  url: string;
}

export interface Shop {
  id: string;
  name: string;
  category?: string;
  ratings?: number;
  avatar?: any;
  address?: string;
}

export interface Product {
  id: string;
  title: string;
  description?: string;
  slug: string;
  brand?: string | null;
  category?: string;
  subCategory?: string;
  regular_price?: number | null;
  sale_price: number;
  stock: number;
  sizes?: string[];
  colors?: string[];
  images: ProductImage[];
  sellerId?: string;
  shopId?: string | null;
  shop?: Shop | null;
  ratings?: number;
  totalSales?: number;
  starting_date?: string | Date | null;
  ending_date?: string | Date | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

interface ProductCardProps {
  data?: Product | any;
  product?: Product | any;
  isEvent?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  data: dataProp,
  product: productProp,
  isEvent = false,
}) => {
  const data = dataProp || productProp;
  const [open, setOpen] = useState<boolean>(false);
  const [isWishlist, setIsWishlist] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (!isEvent || !data?.ending_date) {
      return;
    }

    const calculateTimeLeft = () => {
      const endTime = new Date(data.ending_date as string | Date).getTime();
      const now = Date.now();
      const diff = endTime - now;

      if (diff <= 0) {
        setTimeLeft('Expired');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      setTimeLeft(`${days}d ${hours}h ${minutes}m left with this price`);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [isEvent, data?.ending_date]);

  const imageUrl =
    data?.images && data.images.length > 0 && data.images[0]?.url
      ? data.images[0].url
      : '/placeholder-product.png';

  return (
    <>
      <div className="w-full min-h-[350px] h-max bg-white rounded-lg relative shadow-xs p-3 hover:shadow-lg transition-all border border-gray-100 flex flex-col justify-between group">
        {isEvent && (
          <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow z-10">
            OFFER
          </div>
        )}

        {data?.stock <= 5 && (
          <div className="absolute top-2 right-2 bg-yellow-400 text-black text-[10px] font-bold px-2 py-0.5 rounded shadow z-10">
            Limited Stock
          </div>
        )}

        <div
          className={`flex flex-col gap-2 absolute ${
            data?.stock <= 5 ? 'top-9' : 'top-2'
          } right-2 z-10`}
        >
          <div
            onClick={() => setIsWishlist(!isWishlist)}
            className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
            title="Wishlist"
          >
            <Heart
              size={20}
              className={`transition-colors ${
                isWishlist
                  ? 'text-red-600 fill-red-600'
                  : 'text-[#4b5563] hover:text-red-500'
              }`}
            />
          </div>

          <div
            onClick={() => setOpen(!open)}
            className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
            title="Quick view"
          >
            <Eye size={20} className="text-[#4b5563] hover:text-black" />
          </div>

          <div
            onClick={() => {}}
            className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
            title="Add to cart"
          >
            <ShoppingBag size={20} className="text-[#4b5563] hover:text-black" />
          </div>
        </div>

        <div className="w-full h-[200px] flex items-center justify-center overflow-hidden relative">
          <Link
            href={`/product/${data?.slug || data?.id}`}
            className="w-full h-full flex items-center justify-center p-2"
          >
            <img
              src={imageUrl}
              alt={data?.title || 'Product'}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            />
          </Link>
        </div>

        <div className="mt-2">
          <Link href={data?.shop?.id ? `/shop/${data.shop.id}` : '#'}>
            <h5 className="text-[#3858f6] font-medium text-xs truncate hover:underline">
              {data?.shop?.name || 'Becodemy'}
            </h5>
          </Link>

          <Link href={`/product/${data?.slug || data?.id}`}>
            <h4
              className="font-bold text-gray-900 text-sm mt-1 line-clamp-1 hover:text-[#3858f6] transition-colors"
              title={data?.title}
            >
              {data?.title}
            </h4>
          </Link>

          <div className="flex items-center gap-0.5 my-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={14}
                className={`w-3.5 h-3.5 ${
                  star <= Math.round(data?.ratings ?? 5)
                    ? 'text-[#f59e0b] fill-[#f59e0b]'
                    : 'text-gray-300 fill-gray-200'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center">
              <h5 className="font-bold text-base text-gray-900">
                ${data?.sale_price}
              </h5>
              {data?.regular_price && data.regular_price > data.sale_price ? (
                <h4 className="text-xs text-gray-400 line-through ml-2 font-normal">
                  ${data.regular_price}
                </h4>
              ) : null}
            </div>
            <span className="text-xs font-semibold text-[#27b374]">
              {data?.totalSales || 0} sold
            </span>
          </div>

          {isEvent && timeLeft && (
            <div className="mt-2 text-xs text-red-600 font-medium flex items-center gap-1.5 bg-red-50 p-1.5 rounded border border-red-100">
              <Clock size={14} className="shrink-0" />
              <span className="truncate">{timeLeft}</span>
            </div>
          )}
        </div>

        {open && <ProductDetailsCard data={data} setOpen={setOpen} />}
      </div>
    </>
  );
};

export default ProductCard;