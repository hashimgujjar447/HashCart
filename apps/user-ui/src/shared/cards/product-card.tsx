'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, Eye, ShoppingBag, Star, Clock } from 'lucide-react';
import ProductDetailsCard from './product-details.card';
import { useStore } from '@/store';
import { useUser } from '@/hooks/useUser';
import { useLocationTracking } from '@/hooks/useLocation';
import { useDevice } from '@/hooks/useDevice';
import LoginRequiredModal from '@/shared/components/modals/login-required-modal';

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
  const [showLoginModal, setShowLoginModal] = useState(false);

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
      if (!user) {
        setShowLoginModal(true);
        return;
      }
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
      <div className="w-full min-h-[340px] h-full bg-white rounded-2xl relative shadow-xs hover:shadow-md transition-all duration-300 border border-slate-200/80 hover:border-slate-300 p-3 sm:p-3.5 flex flex-col justify-between group">
        {isEvent && (
          <div className="absolute top-3 left-3 bg-rose-50 text-rose-700 border border-rose-200/80 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-2xs z-10">
            OFFER
          </div>
        )}

        {product?.stock <= 5 && (
          <div className="absolute top-3 right-3 sm:right-auto sm:left-16 bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-2xs z-10">
            Few Left
          </div>
        )}

        <div className="flex flex-col gap-1.5 absolute top-3 right-3 z-10 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
          <button
            type="button"
            onClick={handleWishlistToggle}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/95 backdrop-blur-xs shadow-xs border border-slate-100 flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
            title="Wishlist"
          >
            <Heart
              size={15}
              fill={isWishlisted ? 'red' : 'transparent'}
              stroke={isWishlisted ? 'red' : '#64748B'}
              className="transition-colors"
            />
          </button>

          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/95 backdrop-blur-xs shadow-xs border border-slate-100 flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
            title="Quick view"
          >
            <Eye
              size={15}
              className="text-slate-600 hover:text-slate-900"
            />
          </button>

          <button
            type="button"
            onClick={handleAddToCart}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/95 backdrop-blur-xs shadow-xs border border-slate-100 flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
            title={isInCart ? 'In cart' : 'Add to cart'}
          >
            <ShoppingBag
              size={15}
              className={`transition-colors ${
                isInCart ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'
              }`}
            />
          </button>
        </div>

        <div className="w-full h-[180px] sm:h-[190px] bg-slate-50/80 rounded-xl flex items-center justify-center overflow-hidden relative p-3">
          <Link
            href={`/product/${product?.slug || product?.id}`}
            className="w-full h-full flex items-center justify-center"
          >
            <img
              src={imageUrl}
              alt={product?.title || 'Product'}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            />
          </Link>
        </div>

        <div className="mt-2.5 flex-1 flex flex-col justify-between">
          <div>
            <Link href={product?.shop?.id ? `/shop/${product.shop.id}` : '#'}>
              <span className="text-slate-400 hover:text-blue-600 font-medium text-[11px] truncate block transition-colors">
                {product?.shop?.name || 'Verified Merchant'}
              </span>
            </Link>

            <Link href={`/product/${product?.slug || product?.id}`}>
              <h4
                className="font-semibold text-slate-800 text-xs sm:text-sm mt-0.5 line-clamp-1 hover:text-blue-600 transition-colors"
                title={product?.title}
              >
                {product?.title}
              </h4>
            </Link>

            <div className="flex items-center gap-1 my-1.5">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={12}
                    className={`w-3 h-3 ${
                      star <= Math.round(product?.ratings ?? 5)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-200 fill-slate-100'
                    }`}
                  />
                ))}
              </div>
              <span className="text-[10px] text-slate-400 font-medium ml-1">
                ({product?.ratings ? Number(product.ratings).toFixed(1) : '5.0'})
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 mt-2">
            <div className="flex items-baseline justify-between gap-1">
              <div className="flex items-baseline gap-1.5 truncate">
                <span className="font-bold text-sm sm:text-base text-slate-900">
                  ${product?.sale_price}
                </span>
                {product?.regular_price &&
                product.regular_price > product.sale_price ? (
                  <span className="text-[11px] text-slate-400 line-through font-normal">
                    ${product.regular_price}
                  </span>
                ) : null}
              </div>
              <span className="text-[10px] font-medium text-slate-400 shrink-0">
                {product?.totalSales || 0} sold
              </span>
            </div>

            {isEvent && timeLeft && (
              <div className="mt-2 text-[10px] text-rose-600 font-medium flex items-center gap-1 bg-rose-50/80 px-2 py-1 rounded-lg border border-rose-100">
                <Clock size={11} className="shrink-0" />
                <span className="truncate">{timeLeft}</span>
              </div>
            )}
          </div>
        </div>

        {open && <ProductDetailsCard data={product} setOpen={setOpen} />}
      </div>
      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </>
  );
};

export default ProductCard;
