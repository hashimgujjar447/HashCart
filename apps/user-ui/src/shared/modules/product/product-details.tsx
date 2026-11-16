'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Heart,
  Star,
  MapPin,
  MessageSquare,
  ShoppingBag,
  Plus,
  Minus,
  RotateCcw,
  ShieldCheck,
  Truck,
  ChevronRight,
  Check,
  CheckCircle2,
  Lock,
  Edit3,
} from 'lucide-react';
import axiosInstance from '@/utils/axiosInstance';
import { useStore } from '@/store';
import useUser from '@/hooks/useUser';
import { useLocationTracking } from '@/hooks/useLocation';
import { useDeviceTracking } from '@/hooks/useDevice';
import { sendKafkaEvent } from '@/actions/track-user';
import ProductCard from '@/shared/cards/product-card';
import WriteReviewModal from '../review/write-review-modal';

interface ProductImage {
  id?: string;
  file_id?: string;
  url: string;
}

interface ShopReview {
  id: string;
  rating: number;
  reviews?: string;
  createdAt: string;
  user?: {
    name: string;
    avatar?: {
      url: string;
    };
  };
}

interface Shop {
  id: string;
  name: string;
  avatar?: {
    url: string;
  };
  ratings?: number;
  reviews?: ShopReview[];
  address?: string;
}

interface Product {
  id: string;
  title: string;
  description?: string;
  detailedDescription?: string;
  slug: string;
  brand?: string | null;
  category: string;
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
  warranty?: string;
  cashOnDelivery?: string;
  specifications?: Record<string, any>;
  createdAt?: string;
}

interface ProductDetailsProps {
  product: Product;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ product }) => {
  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [selectedSize, setSelectedSize] = useState<string>(
    product?.sizes && product.sizes.length > 0 ? product.sizes[0] : '',
  );
  const [selectedColor, setSelectedColor] = useState<string>(
    product?.colors && product.colors.length > 0 ? product.colors[0] : '',
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');
  const [priceRange] = useState<number[]>([0, 10000]);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [addedSuccess, setAddedSuccess] = useState<boolean>(false);

  const { user } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();

  const addToCart = useStore((state: any) => state.addToCart);
  const addToWishlist = useStore((state: any) => state.addToWishlist);
  const removeFromWishlist = useStore((state: any) => state.removeFromWishlist);
  const wishlist = useStore((state: any) => state.wishlist) || [];
  const isWishlisted = wishlist.some((item: any) => item.id === product?.id);

  // Reviews & Verified Buyer State
  const [reviewsList, setReviewsList] = useState<any[]>(
    product?.shop?.reviews || [],
  );
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<'ALL' | number>('ALL');
  const [eligibility, setEligibility] = useState<{
    checked: boolean;
    eligible: boolean;
    isLoggedIn: boolean;
    matchedOrder?: any;
    existingReview?: any;
    message?: string;
  }>({
    checked: false,
    eligible: false,
    isLoggedIn: Boolean(user),
  });

  const checkBuyerEligibility = async () => {
    if (!user?.id || !product?.id) {
      setEligibility({ checked: true, eligible: false, isLoggedIn: false });
      return;
    }
    try {
      const shopId = product.shopId || product.shop?.id || '';
      const res = await axiosInstance.get(
        `/auth/check-review-eligibility?productId=${product.id}&shopId=${shopId}`,
      );
      setEligibility({
        checked: true,
        eligible: Boolean(res.data?.eligible),
        isLoggedIn: true,
        matchedOrder: res.data?.matchedOrder,
        existingReview: res.data?.existingReview,
        message: res.data?.message,
      });
    } catch (err) {
      setEligibility({ checked: true, eligible: false, isLoggedIn: true });
    }
  };

  useEffect(() => {
    checkBuyerEligibility();
  }, [user?.id, product?.id]);

  useEffect(() => {
    if (product?.id) {
      sendKafkaEvent({
        userId: user?.id,
        productId: product.id,
        shopId: product.shopId || product.shop?.id || '',
        action: 'product_view',
        device: deviceInfo || '',
        country: location?.country || '',
        city: location?.city || '',
      });
    }
  }, [product?.id, user?.id, deviceInfo, location?.country]);

  const fetchFilteredProducts = async () => {
    try {
      const query = new URLSearchParams();
      query.set('priceRange', priceRange.join(','));
      query.set('page', '1');
      query.set('limit', '6');
      if (product?.category) {
        query.set('categories', product.category);
      }
      const res = await axiosInstance.get(
        `/product/api/get-filtered-products?${query.toString()}`,
      );
      let filtered = (res.data.products || []).filter(
        (p: Product) => p.id !== product.id,
      );

      if (filtered.length === 0) {
        const fallbackRes = await axiosInstance.get(
          `/product/api/get-filtered-products?limit=6`,
        );
        filtered = (fallbackRes.data.products || []).filter(
          (p: Product) => p.id !== product.id,
        );
      }

      setRecommendedProducts(filtered.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch filtered products', error);
    }
  };

  useEffect(() => {
    fetchFilteredProducts();
  }, [product?.id, product?.category]);

  const images =
    product?.images && product.images.length > 0
      ? product.images
      : [{ url: '/placeholder-product.png' }];

  const activeImageUrl =
    images[selectedImage]?.url || images[0]?.url || '/placeholder-product.png';

  const discountPercent =
    product.regular_price && product.regular_price > product.sale_price
      ? Math.round(
          ((product.regular_price - product.sale_price) /
            product.regular_price) *
            100,
        )
      : null;

  const handleWishlistToggle = () => {
    if (isWishlisted) {
      removeFromWishlist(product.id, user, location, deviceInfo);
    } else {
      addToWishlist(
        {
          id: product.id,
          title: product.title,
          price: product.sale_price,
          image: activeImageUrl,
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
    if (product.stock <= 0) return;
    addToCart(
      {
        id: product.id,
        title: product.title,
        price: product.sale_price,
        image: activeImageUrl,
        quantity,
        shopId: product.shopId || product.shop?.id || '',
      },
      user,
      location,
      deviceInfo,
    );
    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
    }, 2500);
  };

  const deliveryLocation =
    location?.city && location?.country
      ? `${location.city}, ${location.country}`
      : location?.country || 'Petaling Jaya, Malaysia';

  const shopName = product.shop?.name || 'Becodemy';
  const shopRating = product.shop?.ratings
    ? Math.round(product.shop.ratings * 20)
    : 88;

  return (
    <div className="bg-[#f8f9fa] min-h-screen py-6">
      <div className="w-[90%] max-w-7xl mx-auto">
        <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-6 flex-wrap">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Home
          </Link>
          <ChevronRight size={14} />
          {product.category && (
            <>
              <span className="hover:text-blue-600 cursor-pointer">
                {product.category}
              </span>
              <ChevronRight size={14} />
            </>
          )}
          {product.subCategory && (
            <>
              <span className="hover:text-blue-600 cursor-pointer">
                {product.subCategory}
              </span>
              <ChevronRight size={14} />
            </>
          )}
          <span className="text-gray-900 font-medium truncate max-w-xs">
            {product.title}
          </span>
        </nav>

        <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-6 md:p-8 mb-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-4 flex flex-col items-center">
              <div className="w-full h-[380px] sm:h-[420px] rounded-lg border border-gray-100 flex items-center justify-center p-4 bg-white shadow-xs overflow-hidden">
                <img
                  src={activeImageUrl}
                  alt={product.title}
                  className="w-full h-full object-contain transition-transform duration-300 hover:scale-105"
                />
              </div>

              {images.length > 1 && (
                <div className="flex items-center gap-3 mt-4 overflow-x-auto max-w-full pb-2 w-full justify-start">
                  {images.map((img: ProductImage, idx: number) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImage(idx)}
                      className={`w-[68px] h-[68px] rounded-md border p-1 shrink-0 bg-white cursor-pointer transition-all ${
                        selectedImage === idx
                          ? 'border-gray-900 ring-2 ring-gray-900/20'
                          : 'border-gray-200 hover:border-gray-400 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img.url}
                        alt={`thumb-${idx}`}
                        className="w-full h-full object-contain"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="lg:col-span-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                    {product.title}
                  </h1>
                  <button
                    type="button"
                    onClick={handleWishlistToggle}
                    className="w-10 h-10 rounded-full border border-gray-200 hover:border-red-300 bg-white flex items-center justify-center cursor-pointer transition-all shrink-0 hover:scale-110 shadow-xs"
                    title={
                      isWishlisted
                        ? 'Remove from wishlist'
                        : 'Add to wishlist'
                    }
                  >
                    <Heart
                      size={20}
                      fill={isWishlisted ? '#ef4444' : 'transparent'}
                      stroke={isWishlisted ? '#ef4444' : '#6b7280'}
                      className="transition-colors"
                    />
                  </button>
                </div>

                <div className="flex items-center gap-3 mb-2 flex-wrap text-sm">
                  <div className="flex items-center text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        fill={
                          i < Math.floor(product.ratings || 5)
                            ? '#facc15'
                            : 'transparent'
                        }
                        stroke="#facc15"
                      />
                    ))}
                  </div>
                  <span className="text-blue-600 hover:underline cursor-pointer text-xs font-medium">
                    ({product.shop?.reviews?.length || 0} Reviews)
                  </span>
                </div>

                <div className="text-xs text-gray-500 mb-6">
                  <span>Brand: </span>
                  <span className="text-blue-600 font-medium">
                    {product.brand || 'No Brand'}
                  </span>
                </div>

                <div className="bg-gray-50/70 p-4 rounded-lg mb-6 border border-gray-100">
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="text-3xl font-extrabold text-[#ff5252]">
                      ${product.sale_price}
                    </span>
                    {product.regular_price &&
                      product.regular_price > product.sale_price && (
                        <span className="text-base text-gray-400 line-through">
                          ${product.regular_price}
                        </span>
                      )}
                    {discountPercent && (
                      <span className="bg-red-50 text-red-600 text-xs font-bold px-2 py-0.5 rounded border border-red-200">
                        -{discountPercent}%
                      </span>
                    )}
                  </div>
                </div>

                {product.sizes && product.sizes.length > 0 && (
                  <div className="mb-6">
                    <span className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Size:
                    </span>
                    <div className="flex items-center gap-2 flex-wrap">
                      {product.sizes.map((s: string) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSelectedSize(s)}
                          className={`min-w-[44px] px-3.5 py-1.5 text-xs font-medium rounded border cursor-pointer transition-all ${
                            selectedSize === s
                              ? 'bg-gray-900 text-white border-gray-900 shadow-xs'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-gray-500'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {product.colors && product.colors.length > 0 && (
                  <div className="mb-6">
                    <span className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Color:
                    </span>
                    <div className="flex items-center gap-2 flex-wrap">
                      {product.colors.map((c: string) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setSelectedColor(c)}
                          className={`px-3 py-1 text-xs font-medium rounded-full border cursor-pointer transition-all ${
                            selectedColor === c
                              ? 'bg-gray-900 text-white border-gray-900'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-gray-500'
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4 mb-6 flex-wrap">
                  <div className="flex items-center border border-gray-300 rounded bg-white">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="w-9 h-9 flex items-center justify-center text-gray-600 hover:text-black hover:bg-gray-100 disabled:opacity-40 cursor-pointer transition-colors"
                    >
                      <Minus size={15} />
                    </button>
                    <span className="w-12 text-center font-semibold text-sm text-gray-800">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity((q) =>
                          Math.min(product.stock || 1, q + 1),
                        )
                      }
                      disabled={quantity >= product.stock}
                      className="w-9 h-9 flex items-center justify-center text-gray-600 hover:text-black hover:bg-gray-100 disabled:opacity-40 cursor-pointer transition-colors"
                    >
                      <Plus size={15} />
                    </button>
                  </div>

                  <span className="text-xs font-medium text-emerald-600 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    In Stock (Stock {product.stock})
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={product.stock <= 0}
                    className={`flex-1 sm:flex-initial sm:min-w-[200px] flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-lg text-white font-bold text-sm tracking-wide shadow-md transition-all cursor-pointer ${
                      product.stock <= 0
                        ? 'bg-gray-400 cursor-not-allowed'
                        : addedSuccess
                        ? 'bg-emerald-600'
                        : 'bg-[#ff5252] hover:bg-[#e04545] hover:shadow-lg active:scale-98'
                    }`}
                  >
                    {addedSuccess ? (
                      <>
                        <Check size={18} />
                        Added to Cart!
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={18} />
                        Add to Cart
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3 flex flex-col gap-5">
              <div className="bg-gray-50/80 border border-gray-200/80 rounded-xl p-5 text-xs text-gray-700">
                <div className="mb-4">
                  <div className="flex items-center justify-between text-gray-500 uppercase tracking-wider font-bold text-[11px] mb-2">
                    <span>Delivery Option</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-gray-800">
                    <MapPin size={16} className="text-gray-500 shrink-0 mt-0.5" />
                    <span className="font-medium leading-relaxed">
                      {deliveryLocation}
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-200/80 pt-4 mb-4">
                  <div className="flex items-center justify-between text-gray-500 uppercase tracking-wider font-bold text-[11px] mb-2.5">
                    <span>Return & Warranty</span>
                  </div>
                  <div className="space-y-2 text-gray-800">
                    <div className="flex items-center gap-2">
                      <RotateCcw size={15} className="text-gray-500 shrink-0" />
                      <span>7 Days Returns</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={15} className="text-gray-500 shrink-0" />
                      <span>
                        {product.warranty
                          ? `Warranty: ${product.warranty}`
                          : 'Warranty not available'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Truck size={15} className="text-gray-500 shrink-0" />
                      <span>
                        Cash on delivery:{' '}
                        {product.cashOnDelivery === 'no'
                          ? 'Not Available'
                          : 'Available'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200/80 pt-4">
                  <div className="text-gray-500 uppercase tracking-wider font-bold text-[11px] mb-2">
                    <span>Sold by</span>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-gray-900 text-sm">
                      {shopName}
                    </span>
                    <button
                      type="button"
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-semibold cursor-pointer"
                    >
                      <MessageSquare size={13} />
                      Chat Now
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-white rounded-lg p-2.5 border border-gray-200 text-center mb-3.5">
                    <div>
                      <div className="text-[10px] text-gray-500">
                        Positive Seller Ratings
                      </div>
                      <div className="text-sm font-extrabold text-gray-900 mt-0.5">
                        {shopRating}%
                      </div>
                    </div>
                    <div className="border-x border-gray-200 px-1">
                      <div className="text-[10px] text-gray-500">
                        Ship on Time
                      </div>
                      <div className="text-sm font-extrabold text-gray-900 mt-0.5">
                        100%
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-500">
                        Chat Response Rate
                      </div>
                      <div className="text-sm font-extrabold text-gray-900 mt-0.5">
                        100%
                      </div>
                    </div>
                  </div>

                  {product.shopId && (
                    <Link
                      href={`/shop/${product.shopId}`}
                      className="block text-center text-xs font-bold text-blue-600 hover:text-blue-800 tracking-wider uppercase py-1"
                    >
                      GO TO STORE
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-6 md:p-8 mb-12">
          <div className="border-b border-gray-200 flex items-center gap-8 mb-6">
            <button
              type="button"
              onClick={() => setActiveTab('details')}
              className={`pb-3 font-bold text-sm tracking-wide transition-all border-b-2 cursor-pointer ${
                activeTab === 'details'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              Product details of {product.title}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('reviews')}
              className={`pb-3 font-bold text-sm tracking-wide transition-all border-b-2 cursor-pointer ${
                activeTab === 'reviews'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              Ratings & Reviews of {product.title}
            </button>
          </div>

          {activeTab === 'details' ? (
            <div className="prose max-w-none text-gray-700 text-sm leading-relaxed">
              {product.detailedDescription ? (
                <div
                  dangerouslySetInnerHTML={{
                    __html: product.detailedDescription,
                  }}
                />
              ) : (
                <p>{product.description || 'No description available.'}</p>
              )}

              {product.specifications &&
                typeof product.specifications === 'object' &&
                Object.keys(product.specifications).length > 0 && (
                  <div className="mt-8">
                    <h3 className="font-bold text-gray-900 text-base mb-3">
                      Specifications
                    </h3>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      {Object.entries(product.specifications).map(
                        ([key, val], i) => (
                          <div
                            key={key}
                            className={`flex py-2.5 px-4 text-xs ${
                              i % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                            }`}
                          >
                            <span className="w-1/3 font-semibold text-gray-600 capitalize">
                              {key}
                            </span>
                            <span className="w-2/3 text-gray-900">
                              {String(val)}
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}
            </div>
          ) : (
            <div className="py-6 space-y-8 text-left">
              {/* Ratings Summary & Verified Buyer Action Banner */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 rounded-2xl bg-gray-50/80 border border-gray-200/80">
                {/* 1. Big Score & Star Visualizer */}
                <div className="flex flex-col items-center justify-center text-center p-4 border-b lg:border-b-0 lg:border-r border-gray-200">
                  <div className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight">
                    {reviewsList.length > 0
                      ? (
                          reviewsList.reduce((acc, r) => acc + (r.rating || 0), 0) /
                          reviewsList.length
                        ).toFixed(1)
                      : (product.ratings || 5).toFixed(1)}
                  </div>
                  <div className="flex items-center justify-center gap-1 my-2">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const avg =
                        reviewsList.length > 0
                          ? reviewsList.reduce(
                              (acc, r) => acc + (r.rating || 0),
                              0,
                            ) / reviewsList.length
                          : product.ratings || 5;
                      return (
                        <Star
                          key={star}
                          size={18}
                          className={
                            star <= Math.round(avg)
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-gray-300'
                          }
                        />
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-500 font-medium">
                    Based on {reviewsList.length} verified buyer{' '}
                    {reviewsList.length === 1 ? 'review' : 'reviews'}
                  </p>
                </div>

                {/* 2. 5-Star Breakdown Bars */}
                <div className="flex flex-col justify-center space-y-2 px-2">
                  {[5, 4, 3, 2, 1].map((num) => {
                    const count = reviewsList.filter(
                      (r) => Math.round(r.rating) === num,
                    ).length;
                    const pct =
                      reviewsList.length > 0
                        ? Math.round((count / reviewsList.length) * 100)
                        : num === 5
                        ? 100
                        : 0;
                    return (
                      <div key={num} className="flex items-center gap-2.5 text-xs">
                        <span className="w-8 font-semibold text-gray-700 flex items-center gap-1">
                          {num} <Star size={11} className="fill-amber-400 text-amber-400" />
                        </span>
                        <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-8 text-right text-gray-400 font-mono text-[11px]">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* 3. Verified Buyer Verification & Action Card */}
                <div className="flex flex-col justify-between p-4 rounded-xl bg-white border border-gray-200 shadow-2xs">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                      <h4 className="text-xs sm:text-sm font-bold text-gray-900">
                        Verified Purchase Guarantee
                      </h4>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed mb-4">
                      {eligibility.eligible
                        ? 'You are a verified buyer for this product! Share your genuine experience with the community.'
                        : eligibility.isLoggedIn
                        ? 'Only verified buyers who have received this product in a delivered order can submit a review.'
                        : 'Have you purchased this product? Sign in to submit a verified buyer review.'}
                    </p>
                  </div>

                  <div>
                    {eligibility.eligible ? (
                      <button
                        type="button"
                        onClick={() => setIsReviewModalOpen(true)}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition cursor-pointer"
                      >
                        <Edit3 size={14} />
                        <span>
                          {eligibility.existingReview
                            ? 'Update Your Review'
                            : 'Write a Verified Review'}
                        </span>
                      </button>
                    ) : !eligibility.isLoggedIn ? (
                      <Link
                        href="/login"
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs transition"
                      >
                        <span>Sign In to Review</span>
                      </Link>
                    ) : (
                      <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200 text-[11px] text-gray-500 flex items-center gap-2">
                        <Lock size={13} className="text-gray-400 shrink-0" />
                        <span>Requires a completed delivered order</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-gray-200">
                <h3 className="text-sm font-bold text-gray-900">
                  Customer Reviews ({reviewsList.length})
                </h3>

                <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                  <button
                    onClick={() => setReviewFilter('ALL')}
                    className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                      reviewFilter === 'ALL'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    All ({reviewsList.length})
                  </button>
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const c = reviewsList.filter(
                      (r) => Math.round(r.rating) === stars,
                    ).length;
                    return (
                      <button
                        key={stars}
                        onClick={() => setReviewFilter(stars)}
                        className={`px-3 py-1 rounded-lg font-medium flex items-center gap-1 transition cursor-pointer ${
                          reviewFilter === stars
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        <span>{stars}</span>
                        <Star size={11} className="fill-current" />
                        <span className="text-[10px] opacity-80">({c})</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Reviews List */}
              {reviewsList.length === 0 ? (
                <div className="py-12 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                  <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-3">
                    <Star size={24} />
                  </div>
                  <h4 className="text-sm font-bold text-gray-900 mb-1">
                    No Reviews Yet
                  </h4>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    Be the first verified buyer to receive and review this product!
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 space-y-4">
                  {reviewsList
                    .filter((rev) =>
                      reviewFilter === 'ALL'
                        ? true
                        : Math.round(rev.rating) === reviewFilter,
                    )
                    .map((rev: ShopReview) => (
                      <div key={rev.id} className="pt-4 first:pt-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                              {rev.user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs sm:text-sm font-bold text-gray-900">
                                  {rev.user?.name || 'Verified Customer'}
                                </span>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <CheckCircle2 size={11} className="text-emerald-600" />
                                  <span>Verified Purchase</span>
                                </span>
                              </div>

                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex items-center text-amber-400">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      size={13}
                                      fill={
                                        i < rev.rating
                                          ? '#facc15'
                                          : 'transparent'
                                      }
                                      stroke="#facc15"
                                    />
                                  ))}
                                </div>
                                <span className="text-[11px] text-gray-400">
                                  {new Date(
                                    rev.createdAt,
                                  ).toLocaleDateString(undefined, {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed pl-13">
                          {rev.reviews}
                        </p>
                      </div>
                    ))}
                </div>
              )}

              {/* Write Review Modal */}
              <WriteReviewModal
                isOpen={isReviewModalOpen}
                onClose={() => setIsReviewModalOpen(false)}
                shopId={product.shopId || product.shop?.id || ''}
                shopName={product.shop?.name || ''}
                productId={product.id}
                productTitle={product.title}
                productImage={product.images?.[0]?.url || ''}
                initialRating={eligibility.existingReview?.rating || 5}
                initialComment={eligibility.existingReview?.comment || ''}
                onSuccess={() => {
                  checkBuyerEligibility();
                  // Re-fetch reviews for the product
                  axiosInstance
                    .get(`/product/get-product/${product.slug || product.id}`)
                    .then((res) => {
                      if (res.data?.product?.shop?.reviews) {
                        setReviewsList(res.data.product.shop.reviews);
                      }
                    })
                    .catch((err) =>
                      console.error('Failed to reload reviews:', err),
                    );
                }}
              />
            </div>
          )}
        </div>

        {recommendedProducts.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                Recommended Products
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {recommendedProducts.map((p: Product) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
