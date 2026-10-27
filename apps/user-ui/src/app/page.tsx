'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/utils/axiosInstance';
import Hero from '@/shared/modules/Hero';
import ProductCard from '@/shared/cards/product-card';
import ShopCard, { ShopType } from '@/shared/cards/shop-card';
import {
  Flame,
  Store,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  ShoppingBag,
} from 'lucide-react';

const HomePage = () => {
  // 1. Fetch Suggested Products
  const {
    data: productsData,
    isLoading: isProductsLoading,
    isError: isProductsError,
  } = useQuery({
    queryKey: ['suggested-products'],
    queryFn: async () => {
      const res = await axiosInstance.get('/product/get-all-products');
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // 2. Fetch Offer Products
  const { data: offersData, isLoading: isOffersLoading } = useQuery({
    queryKey: ['home-offer-products'],
    queryFn: async () => {
      const res = await axiosInstance.get('/product/get-offer-products');
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // 3. Fetch Featured Shops
  const { data: shopsData, isLoading: isShopsLoading } = useQuery({
    queryKey: ['home-featured-shops'],
    queryFn: async () => {
      const res = await axiosInstance.get('/auth/get-all-shops?limit=4');
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const products = productsData?.products || [];
  const offerProducts = offersData?.products || [];
  const shops: ShopType[] = shopsData?.shops || [];

  return (
    <div className="bg-[#f8f9fa] min-h-screen font-poppins text-slate-800">
      {/* ── 1. Hero Banner ────────────────────────────────────────────────── */}
      <Hero />

      {/* ── 2. Limited Time Flash Deals (if available) ────────────────────── */}
      {offerProducts.length > 0 && (
        <section className="w-[92%] sm:w-[88%] max-w-7xl mx-auto my-10 sm:my-14">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 pb-3 border-b border-slate-200/80">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-semibold mb-1.5">
                <Flame size={13} className="text-rose-600" />
                <span>Special Offers</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Flash Deals & Discounts
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Limited-time promotions on select products from verified sellers
              </p>
            </div>

            <Link
              href="/offers"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1 self-start sm:self-auto shrink-0"
            >
              <span>View All Offers</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          {isOffersLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-[340px] bg-white rounded-2xl border border-slate-200/70 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5">
              {offerProducts.slice(0, 5).map((product: any) => (
                <ProductCard key={product.id} data={product} isEvent={true} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── 3. Featured Verified Shops ────────────────────────────────────── */}
      {(isShopsLoading || shops.length > 0) && (
        <section className="w-[92%] sm:w-[88%] max-w-7xl mx-auto my-10 sm:my-14">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 pb-3 border-b border-slate-200/80">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold mb-1.5">
                <Store size={13} className="text-blue-600" />
                <span>Verified Vendors</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Featured Marketplace Shops
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Discover curated collections directly from our highest-rated merchant stores
              </p>
            </div>

            <Link
              href="/shops"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1 self-start sm:self-auto shrink-0"
            >
              <span>Explore All Shops</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          {isShopsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-64 bg-white rounded-2xl border border-slate-200/70 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {shops.slice(0, 4).map((shop) => (
                <ShopCard key={shop.id} shop={shop} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── 4. Suggested Products ─────────────────────────────────────────── */}
      <section className="w-[92%] sm:w-[88%] max-w-7xl mx-auto my-10 sm:my-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 pb-3 border-b border-slate-200/80">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold mb-1.5">
              <ShoppingBag size={13} className="text-slate-600" />
              <span>Catalog</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Suggested Products
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Handpicked selections from verified sellers across all categories
            </p>
          </div>

          {products.length > 0 && (
            <Link
              href="/products"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1 self-start sm:self-auto shrink-0"
            >
              <span>View All Products ({products.length})</span>
              <ArrowRight size={13} />
            </Link>
          )}
        </div>

        {isProductsLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5">
            {Array.from({ length: 10 }).map((_, index) => (
              <div
                key={index}
                className="w-full min-h-[320px] bg-white rounded-2xl p-3 border border-slate-200/70 shadow-xs flex flex-col justify-between animate-pulse"
              >
                <div className="w-full h-[180px] bg-slate-100 rounded-xl mb-3" />
                <div className="space-y-2">
                  <div className="h-3 bg-slate-200 rounded w-1/3" />
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div className="h-4 bg-slate-200 rounded w-1/4" />
                    <div className="h-3 bg-slate-200 rounded w-1/5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : isProductsError ? (
          <div className="bg-white rounded-2xl border border-rose-100 p-10 text-center shadow-xs max-w-lg mx-auto">
            <h3 className="text-sm font-bold text-slate-800">
              Unable to load products
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Please check your internet connection and refresh the page.
            </p>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/70 p-10 text-center shadow-xs max-w-lg mx-auto">
            <h3 className="text-sm font-bold text-slate-800">
              No products found
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Check back soon for new arrivals from our verified merchants.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5">
            {products.map((product: any) => (
              <ProductCard key={product.id} data={product} />
            ))}
          </div>
        )}
      </section>

      {/* ── 5. Marketplace Trust Strip ────────────────────────────────────── */}
      <section className="border-t border-slate-200/80 bg-white py-12 mt-16">
        <div className="w-[92%] sm:w-[88%] max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          <div className="flex items-center gap-3.5 p-3 rounded-xl">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Truck size={20} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Fast & Reliable Delivery
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Free standard delivery on eligible orders
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-xl">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Buyer Protection
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Full refund if items are not as described
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-xl">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <RotateCcw size={20} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                30-Day Easy Returns
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Simple and hassle-free return policy
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-xl">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Headphones size={20} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Dedicated Support
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Friendly customer support 7 days a week
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
