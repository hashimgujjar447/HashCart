'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, Eye, ShoppingBag, Star, Clock } from 'lucide-react';
import ProductDetailsCard from './product-details.card';
import { useStore } from '@/store';
import { useUser } from '@/hooks/useUser';
import { useLocationTracking } from '@/hooks/useLocation';
import { useDevice } from '@/hooks/useDevice';

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
  const product = dataProp || productProp;
  const [open, setOpen] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<string>('');

  const { user } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDevice();

  const addToCart = useStore((state: any) => state.addToCart);
  const addToWishlist = useStore((state: any) => state.addToWishlist);
  const removeFromCart = useStore((state: any) => state.removeFromCart);
  const removeFromWishlist = useStore((state: any) => state.removeFromWishlist);
  const wishlist = useStore((state: any) => state.wishlist);
  const isWishlisted = wishlist?.some((item: any) => item.id === product?.id);
  const cart = useStore((state: any) => state.cart);
  const isInCart = cart?.some((item: any) => item.id === product?.id);

  useEffect(() => {
    if (!isEvent || !product?.ending_date) {
      return;
    }

    const calculateTimeLeft = () => {
      const endTime = new Date(product.ending_date as string | Date).getTime();
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
  }, [isEvent, product?.ending_date]);

  const imageUrl =
    product?.images && product.images.length > 0 && product.images[0]?.url
      ? product.images[0].url
      : '/placeholder-product.png';

  const handleWishlistToggle = () => {
    if (!product) return;
    if (isWishlisted) {
      removeFromWishlist(product.id, user, location, deviceInfo);
    } else {
      addToWishlist(
        {
          id: product.id,
          title: product.title,
          price: product.sale_price,
          image: imageUrl,
          quantity: 1,
          shopId: product.shopId || product.shop?.id || '',
        },
        user,
        location,
        deviceInfo,
      );
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    if (isInCart) {
      removeFromCart(product.id, user, location, deviceInfo);
    } else {
      addToCart(
        {
          id: product.id,
          title: product.title,
          price: product.sale_price,
          image: imageUrl,
          quantity: 1,
          shopId: product.shopId || product.shop?.id || '',
        },
        user,
        location,
        deviceInfo,
      );
    }
  };

  return (
    <>
      <div className="w-full min-h-[350px] h-max bg-white rounded-lg relative shadow-xs p-3 hover:shadow-lg transition-all border border-gray-100 flex flex-col justify-between group">
        {isEvent && (
          <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow z-10">
            OFFER
          </div>
        )}

        {product?.stock <= 5 && (
          <div className="absolute top-2 right-2 bg-yellow-400 text-black text-[10px] font-bold px-2 py-0.5 rounded shadow z-10">
            Limited Stock
          </div>
        )}

        <div
          className={`flex flex-col gap-2 absolute ${
            product?.stock <= 5 ? 'top-9' : 'top-2'
          } right-2 z-10`}
        >
          <div
            onClick={handleWishlistToggle}
            className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
            title="Wishlist"
          >
            <Heart
              size={20}
              fill={isWishlisted ? 'red' : 'transparent'}
              stroke={isWishlisted ? 'red' : '#4B5563'}
              className="transition-colors cursor-pointer"
            />
          </div>

          <div
            onClick={() => setOpen(!open)}
            className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
            title="Quick view"
          >
            <Eye
              size={20}
              className="text-[#4b5563] hover:text-black cursor-pointer"
            />
          </div>

          <div
            onClick={handleAddToCart}
            className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
            title={isInCart ? 'In cart' : 'Add to cart'}
          >
            <ShoppingBag
              size={20}
              className={`cursor-pointer transition-colors ${
                isInCart ? 'text-blue-600' : 'text-[#4b5563] hover:text-black'
              }`}
            />
          </div>
        </div>

        <div className="w-full h-[200px] flex items-center justify-center overflow-hidden relative">
          <Link
            href={`/product/${product?.slug || product?.id}`}
            className="w-full h-full flex items-center justify-center p-2"
          >
            <img
              src={imageUrl}
              alt={product?.title || 'Product'}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            />
          </Link>
        </div>

        <div className="mt-2">
          <Link href={product?.shop?.id ? `/shop/${product.shop.id}` : '#'}>
            <h5 className="text-[#3858f6] font-medium text-xs truncate hover:underline">
              {product?.shop?.name || 'Becodemy'}
            </h5>
          </Link>

          <Link href={`/product/${product?.slug || product?.id}`}>
            <h4
              className="font-bold text-gray-900 text-sm mt-1 line-clamp-1 hover:text-[#3858f6] transition-colors"
              title={product?.title}
            >
              {product?.title}
            </h4>
          </Link>

          <div className="flex items-center gap-0.5 my-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={14}
                className={`w-3.5 h-3.5 ${
                  star <= Math.round(product?.ratings ?? 5)
                    ? 'text-[#f59e0b] fill-[#f59e0b]'
                    : 'text-gray-300 fill-gray-200'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center">
              <h5 className="font-bold text-base text-gray-900">
                ${product?.sale_price}
              </h5>
              {product?.regular_price &&
              product.regular_price > product.sale_price ? (
                <h4 className="text-xs text-gray-400 line-through ml-2 font-normal">
                  ${product.regular_price}
                </h4>
              ) : null}
            </div>
            <span className="text-xs font-semibold text-[#27b374]">
              {product?.totalSales || 0} sold
            </span>
          </div>

          {isEvent && timeLeft && (
            <div className="mt-2 text-xs text-red-600 font-medium flex items-center gap-1.5 bg-red-50 p-1.5 rounded border border-red-100">
              <Clock size={14} className="shrink-0" />
              <span className="truncate">{timeLeft}</span>
            </div>
          )}
        </div>

        {open && <ProductDetailsCard data={product} setOpen={setOpen} />}
      </div>
    </>
  );
};

export default ProductCard;
