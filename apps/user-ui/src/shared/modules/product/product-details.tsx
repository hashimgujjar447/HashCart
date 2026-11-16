'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Heart,
  Star,
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
  Store as StoreIcon,
  Zap,
  ArrowRight,
  Share2,
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
  const [activeTab, setActiveTab] = useState<'details' | 'specs' | 'reviews'>('details');
  const [addedSuccess, setAddedSuccess] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [priceRange] = useState<[number, number]>([0, 10000]);

  // Review states
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewsList, setReviewsList] = useState<ShopReview[]>(
    product.shop?.reviews || [],
  );
  const [reviewFilter, setReviewFilter] = useState<'ALL' | number>('ALL');
  const [eligibility, setEligibility] = useState<{
    checked: boolean;
    eligible: boolean;
    isLoggedIn?: boolean;
    order?: any;
    existingReview?: any;
    message?: string;
  }>({ checked: false, eligible: false });

  const { user } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();

  const addToCart = useStore((state) => state.addToCart);
  const addToWishlist = useStore((state) => state.addToWishlist);
  const removeFromWishlist = useStore((state) => state.removeFromWishlist);
  const wishlist = useStore((state) => state.wishlist || []);
  const isWishlisted = wishlist.some((item) => item.id === product?.id);

  // Check buyer review eligibility
  const checkBuyerEligibility = async () => {
    if (!user) {
      setEligibility({ checked: true, eligible: false, isLoggedIn: false });
      return;
    }
    try {
      const res = await axiosInstance.get(
        `/auth/check-review-eligibility?productId=${product?.id}&shopId=${
          product?.shopId || product?.shop?.id || ''
        }`,
      );
      setEligibility({
        checked: true,
        eligible: res.data?.eligible ?? false,
        isLoggedIn: true,
        order: res.data?.order,
        existingReview: res.data?.existingReview,
        message: res.data?.message,
      });
    } catch {
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

  // Fetch recommended products
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

  const savingsAmount =
    product.regular_price && product.regular_price > product.sale_price
      ? (product.regular_price - product.sale_price).toFixed(2)
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

  const handleBuyNow = () => {
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
    window.location.href = '/checkout';
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const shopName = product.shop?.name || 'Verified Merchant';
  const shopRating = product.shop?.ratings
    ? Math.round(product.shop.ratings * 20)
    : 95;

  return (
    <div className="bg-[#f8fafc] min-h-screen py-6 font-poppins text-slate-800">
      <div className="w-[92%] max-w-7xl mx-auto">
        {/* 1. Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6 flex-wrap">
          <Link
            href="/"
            className="hover:text-blue-600 transition-colors flex items-center gap-1 font-medium"
          >
            Home
          </Link>
          <ChevronRight size={13} className="text-slate-400" />
          {product.category && (
            <>
              <Link
                href={`/products?category=${encodeURIComponent(product.category)}`}
                className="hover:text-blue-600 transition-colors font-medium text-slate-600"
              >
                {product.category}
              </Link>
              <ChevronRight size={13} className="text-slate-400" />
            </>
          )}
          {product.subCategory && (
            <>
              <span className="text-slate-600 font-medium">
                {product.subCategory}
              </span>
              <ChevronRight size={13} className="text-slate-400" />
            </>
          )}
          <span className="text-slate-900 font-semibold truncate max-w-xs sm:max-w-md">
            {product.title}
          </span>
        </nav>

        {/* 2. Main Product Hero Showcase Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-6 sm:p-8 lg:p-10 mb-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* ── LEFT: Product Visual Gallery ── */}
            <div className="lg:col-span-7 flex flex-col">
              {/* Main Image Showcase */}
              <div className="relative w-full h-[400px] sm:h-[480px] lg:h-[520px] rounded-2xl bg-gradient-to-b from-slate-50/80 to-slate-100/40 border border-slate-200/80 flex items-center justify-center p-6 overflow-hidden group shadow-inner">
                <img
                  src={activeImageUrl}
                  alt={product.title}
                  className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                />

                {/* Floating Badges (Top Left) */}
                <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                  {discountPercent && (
                    <span className="px-3 py-1.5 rounded-full bg-rose-600 text-white font-extrabold text-xs tracking-wider uppercase shadow-md shadow-rose-600/20">
                      -{discountPercent}% OFF
                    </span>
                  )}
                  {product.stock <= 5 && product.stock > 0 && (
                    <span className="px-3 py-1 rounded-full bg-amber-500 text-white font-bold text-[11px] tracking-wide shadow-xs">
                      Only {product.stock} Left
                    </span>
                  )}
                </div>

                {/* Floating Wishlist Heart (Top Right) */}
                <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 text-slate-600 hover:text-blue-600 flex items-center justify-center cursor-pointer transition-all hover:scale-110 shadow-xs"
                    title="Share product link"
                  >
                    {copiedLink ? (
                      <Check size={18} className="text-emerald-600" />
                    ) : (
                      <Share2 size={18} />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleWishlistToggle}
                    className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 flex items-center justify-center cursor-pointer transition-all hover:scale-110 shadow-xs"
                    title={
                      isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'
                    }
                  >
                    <Heart
                      size={20}
                      fill={isWishlisted ? '#ef4444' : 'transparent'}
                      stroke={isWishlisted ? '#ef4444' : '#64748b'}
                      className="transition-colors"
                    />
                  </button>
                </div>
              </div>

              {/* Thumbnail Gallery Strip */}
              {images.length > 1 && (
                <div className="flex items-center gap-3 mt-4 overflow-x-auto max-w-full pb-2 w-full justify-start scrollbar-thin">
                  {images.map((img: ProductImage, idx: number) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImage(idx)}
                      className={`relative w-20 h-20 rounded-xl border p-1 shrink-0 bg-white cursor-pointer transition-all overflow-hidden ${
                        selectedImage === idx
                          ? 'border-blue-600 ring-2 ring-blue-600/30 shadow-md scale-102'
                          : 'border-slate-200 hover:border-slate-400 opacity-75 hover:opacity-100'
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

            {/* ── RIGHT: Conversions, Pricing & Buy Box ── */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
              <div>
                {/* Verified Merchant Badge Pill */}
                {product.shop && (
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <Link
                      href={`/shop/${product.shopId || product.shop.id}`}
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 hover:bg-blue-100 transition-colors text-xs font-semibold"
                    >
                      <StoreIcon size={13} className="text-blue-600" />
                      <span>{shopName}</span>
                      <span className="w-1 h-1 rounded-full bg-blue-400" />
                      <span className="text-[11px] text-blue-600 font-medium">
                        {shopRating}% Positive
                      </span>
                    </Link>

                    {product.brand && (
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-medium border border-slate-200">
                        Brand: {product.brand}
                      </span>
                    )}
                  </div>
                )}

                {/* Product Title */}
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug mb-3">
                  {product.title}
                </h1>

                {/* Rating & Review Counter */}
                <div className="flex items-center gap-3 mb-5 flex-wrap text-sm">
                  <div className="flex items-center text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={17}
                        fill={
                          i < Math.floor(product.ratings || 5)
                            ? '#facc15'
                            : 'transparent'
                        }
                        stroke="#facc15"
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-slate-800">
                    {(product.ratings || 5).toFixed(1)}
                  </span>
                  <span className="text-slate-300">•</span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('reviews')}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                  >
                    {reviewsList.length} Verified Customer{' '}
                    {reviewsList.length === 1 ? 'Review' : 'Reviews'}
                  </button>
                </div>

                {/* Pricing Box */}
                <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 sm:p-5 mb-6">
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                      ${product.sale_price}
                    </span>
                    {product.regular_price &&
                      product.regular_price > product.sale_price && (
                        <span className="text-lg text-slate-400 line-through font-medium">
                          ${product.regular_price}
                        </span>
                      )}
                    {savingsAmount && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold">
                        Save ${savingsAmount}
                      </span>
                    )}
                  </div>

                  {/* Stock Availability Indicator */}
                  <div className="mt-3 pt-3 border-t border-slate-200/70 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      {product.stock > 0 ? (
                        <>
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                          </span>
                          <span className="font-semibold text-emerald-700">
                            In Stock • Ready to dispatch
                          </span>
                        </>
                      ) : (
                        <span className="font-bold text-rose-600">
                          Out of Stock
                        </span>
                      )}
                    </div>
                    <span className="text-slate-400 text-[11px]">
                      SKU: #{product.id.slice(-6).toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Size Selector */}
                {product.sizes && product.sizes.length > 0 && (
                  <div className="mb-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Select Size
                      </span>
                      {selectedSize && (
                        <span className="text-xs text-blue-600 font-semibold">
                          Selected: {selectedSize}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {product.sizes.map((s: string) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSelectedSize(s)}
                          className={`min-w-[48px] px-4 py-2 text-xs font-bold rounded-xl border cursor-pointer transition-all ${
                            selectedSize === s
                              ? 'bg-slate-900 text-white border-slate-900 shadow-sm scale-102'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400 hover:bg-slate-50'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Color Selector */}
                {product.colors && product.colors.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Select Color
                      </span>
                      {selectedColor && (
                        <span className="text-xs text-blue-600 font-semibold">
                          Selected: {selectedColor}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {product.colors.map((c: string) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setSelectedColor(c)}
                          className={`px-4 py-1.5 text-xs font-semibold rounded-full border cursor-pointer transition-all flex items-center gap-2 ${
                            selectedColor === c
                              ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400 hover:bg-slate-50'
                          }`}
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0"
                            style={{
                              backgroundColor: c.toLowerCase(),
                            }}
                          />
                          <span>{c}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity Stepper & Add to Cart Controls */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    {/* Stepper */}
                    <div className="flex items-center border border-slate-200 rounded-xl bg-white shadow-2xs p-1">
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        disabled={quantity <= 1}
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 cursor-pointer transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={15} />
                      </button>
                      <span className="w-10 text-center font-bold text-sm text-slate-900">
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
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 cursor-pointer transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus size={15} />
                      </button>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      disabled={product.stock <= 0}
                      className={`flex-1 flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl text-white font-bold text-sm tracking-wide shadow-md transition-all cursor-pointer ${
                        product.stock <= 0
                          ? 'bg-slate-300 cursor-not-allowed shadow-none'
                          : addedSuccess
                          ? 'bg-emerald-600 shadow-emerald-600/20'
                          : 'bg-blue-600 hover:bg-blue-700 active:scale-98 shadow-blue-600/25'
                      }`}
                    >
                      {addedSuccess ? (
                        <>
                          <Check size={18} />
                          <span>Added to Cart!</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag size={18} />
                          <span>Add to Cart</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Buy Now Direct Button */}
                  <button
                    type="button"
                    onClick={handleBuyNow}
                    disabled={product.stock <= 0}
                    className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs tracking-wider uppercase transition-all shadow-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Zap size={14} className="text-amber-400" />
                    <span>Instant Checkout • Buy Now</span>
                  </button>
                </div>

                {/* Trust & Guarantee Highlights (2x2 Grid) */}
                <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-slate-200/80">
                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="w-8 h-8 rounded-lg bg-blue-100/70 text-blue-600 flex items-center justify-center shrink-0">
                      <Truck size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">
                        Fast Delivery
                      </h4>
                      <p className="text-[10px] text-slate-500">
                        Tracked dispatched
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100/70 text-emerald-600 flex items-center justify-center shrink-0">
                      <RotateCcw size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">
                        Easy Returns
                      </h4>
                      <p className="text-[10px] text-slate-500">
                        7-day guarantee
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100/70 text-indigo-600 flex items-center justify-center shrink-0">
                      <ShieldCheck size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">
                        100% Authentic
                      </h4>
                      <p className="text-[10px] text-slate-500">
                        Verified store item
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="w-8 h-8 rounded-lg bg-amber-100/70 text-amber-600 flex items-center justify-center shrink-0">
                      <Lock size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">
                        Safe Checkout
                      </h4>
                      <p className="text-[10px] text-slate-500">
                        Stripe 256-bit SSL
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Modern Interactive Tabbed Section */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-6 sm:p-8 mb-12">
          {/* Tab Navigation Pill Bar */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-4 mb-6 overflow-x-auto scrollbar-thin">
            <button
              type="button"
              onClick={() => setActiveTab('details')}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm tracking-tight transition-all cursor-pointer ${
                activeTab === 'details'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              Description & Overview
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('specs')}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm tracking-tight transition-all cursor-pointer ${
                activeTab === 'specs'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              Full Specifications
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('reviews')}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm tracking-tight transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'reviews'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Customer Reviews</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === 'reviews'
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {reviewsList.length}
              </span>
            </button>
          </div>

          {/* Tab 1: Product Description */}
          {activeTab === 'details' && (
            <div className="prose max-w-none text-slate-700 text-sm leading-relaxed py-2">
              {product.detailedDescription ? (
                <div
                  dangerouslySetInnerHTML={{
                    __html: product.detailedDescription,
                  }}
                  className="space-y-4"
                />
              ) : (
                <p className="text-slate-600 text-base leading-relaxed">
                  {product.description ||
                    'Premium quality multi-vendor marketplace item curated for authentic customer satisfaction.'}
                </p>
              )}
            </div>
          )}

          {/* Tab 2: Full Specifications Table */}
          {activeTab === 'specs' && (
            <div className="py-2">
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs sm:text-sm">
                  <tbody className="divide-y divide-slate-100">
                    <tr className="bg-slate-50/70">
                      <td className="w-1/3 py-3 px-5 font-bold text-slate-700">
                        Category
                      </td>
                      <td className="py-3 px-5 text-slate-900 font-medium">
                        {product.category}
                      </td>
                    </tr>
                    {product.subCategory && (
                      <tr>
                        <td className="py-3 px-5 font-bold text-slate-700">
                          Subcategory
                        </td>
                        <td className="py-3 px-5 text-slate-900 font-medium">
                          {product.subCategory}
                        </td>
                      </tr>
                    )}
                    <tr className="bg-slate-50/70">
                      <td className="py-3 px-5 font-bold text-slate-700">
                        Brand
                      </td>
                      <td className="py-3 px-5 text-slate-900 font-medium">
                        {product.brand || 'HashCart Verified'}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-5 font-bold text-slate-700">
                        Warranty
                      </td>
                      <td className="py-3 px-5 text-slate-900 font-medium">
                        {product.warranty || 'Standard 1-Year Manufacturer Warranty'}
                      </td>
                    </tr>
                    <tr className="bg-slate-50/70">
                      <td className="py-3 px-5 font-bold text-slate-700">
                        Cash on Delivery
                      </td>
                      <td className="py-3 px-5 text-slate-900 font-medium">
                        {product.cashOnDelivery === 'no'
                          ? 'Not Available'
                          : 'Available'}
                      </td>
                    </tr>
                    {product.specifications &&
                      typeof product.specifications === 'object' &&
                      Object.entries(product.specifications).map(
                        ([k, v], idx) => (
                          <tr
                            key={k}
                            className={idx % 2 === 0 ? '' : 'bg-slate-50/70'}
                          >
                            <td className="py-3 px-5 font-bold text-slate-700 capitalize">
                              {k}
                            </td>
                            <td className="py-3 px-5 text-slate-900 font-medium">
                              {String(v)}
                            </td>
                          </tr>
                        ),
                      )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 3: Verified Buyer Reviews */}
          {activeTab === 'reviews' && (
            <div className="py-2 space-y-8 text-left">
              {/* Ratings Summary & Verified Buyer Action Banner */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
                {/* Score & Star Breakdown */}
                <div className="flex flex-col items-center justify-center text-center p-4 border-b lg:border-b-0 lg:border-r border-slate-200">
                  <div className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                    {reviewsList.length > 0
                      ? (
                          reviewsList.reduce(
                            (acc, r) => acc + (r.rating || 0),
                            0,
                          ) / reviewsList.length
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
                              : 'text-slate-300'
                          }
                        />
                      );
                    })}
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    Based on {reviewsList.length} verified buyer{' '}
                    {reviewsList.length === 1 ? 'review' : 'reviews'}
                  </p>
                </div>

                {/* 5-Star Breakdown Bars */}
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
                      <div
                        key={num}
                        className="flex items-center gap-2.5 text-xs"
                      >
                        <span className="w-8 font-semibold text-slate-700 flex items-center gap-1">
                          {num}{' '}
                          <Star
                            size={11}
                            className="fill-amber-400 text-amber-400"
                          />
                        </span>
                        <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-8 text-right text-slate-400 font-mono text-[11px]">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Verified Buyer Eligibility Action Card */}
                <div className="flex flex-col justify-between p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                        Verified Purchase Guarantee
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed mb-4">
                      {eligibility.eligible
                        ? 'You are a verified buyer for this product! Share your honest review with the community.'
                        : eligibility.isLoggedIn
                        ? 'Only buyers who have completed a delivered order for this product can write a review.'
                        : 'Have you purchased this product? Sign in to write a verified buyer review.'}
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
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition"
                      >
                        <span>Sign In to Review</span>
                      </Link>
                    ) : (
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-center gap-2">
                        <Lock size={13} className="text-slate-400 shrink-0" />
                        <span>Requires a completed delivered order</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Review Filter Pills */}
              <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-200">
                <h3 className="text-sm font-bold text-slate-900">
                  Customer Feedback ({reviewsList.length})
                </h3>

                <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                  <button
                    type="button"
                    onClick={() => setReviewFilter('ALL')}
                    className={`px-3 py-1 rounded-full font-semibold transition cursor-pointer ${
                      reviewFilter === 'ALL'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    All ({reviewsList.length})
                  </button>
                  {[5, 4, 3, 2, 1].map((s) => {
                    const count = reviewsList.filter(
                      (r) => Math.round(r.rating) === s,
                    ).length;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setReviewFilter(s)}
                        className={`px-3 py-1 rounded-full font-semibold transition flex items-center gap-1 cursor-pointer ${
                          reviewFilter === s
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        <span>{s}</span>
                        <Star size={10} className="fill-amber-400 text-amber-400" />
                        <span className="text-[10px] opacity-75">({count})</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Reviews List */}
              {reviewsList.length === 0 ? (
                <div className="py-12 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-3">
                    <Star size={24} />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">
                    No Customer Reviews Yet
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Be the first verified customer to purchase and share feedback on this product!
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 space-y-4">
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
                                <span className="text-xs sm:text-sm font-bold text-slate-900">
                                  {rev.user?.name || 'Verified Customer'}
                                </span>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <CheckCircle2
                                    size={11}
                                    className="text-emerald-600"
                                  />
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
                                <span className="text-[11px] text-slate-400">
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

                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pl-13">
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

        {/* 4. Recommended Products Carousel / Grid */}
        {recommendedProducts.length > 0 && (
          <div className="mb-14">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  You May Also Like
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Similar curated products from authentic marketplace stores
                </p>
              </div>
              <Link
                href="/products"
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition"
              >
                <span>View More</span>
                <ArrowRight size={13} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
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
