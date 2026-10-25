'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/utils/axiosInstance';
import Hero from '@/shared/modules/Hero';
import ProductCard from '@/shared/cards/product-card';

const Page = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['suggested-products'],
    queryFn: async () => {
      const res = await axiosInstance.get('/product/get-all-products');
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const products = data?.products || [];

  return (
    <div className="bg-[#f8f9fa] min-h-screen">
      <Hero />
      <div className="md:w-[85%] w-[92%] max-w-7xl my-14 m-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
              Suggested Products
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Explore handpicked, high quality items from verified sellers
            </p>
          </div>
          {products.length > 0 && (
            <Link
              href="/products"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1 self-start sm:self-auto"
            >
              View all products &rarr;
            </Link>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-6">
            {Array.from({ length: 10 }).map((_, index) => (
              <div
                key={index}
                className="w-full min-h-[350px] bg-white rounded-lg p-3 border border-gray-100 shadow-xs flex flex-col justify-between animate-pulse"
              >
                <div className="w-full h-[200px] bg-gray-200 rounded-md mb-3" />
                <div>
                  <div className="h-3 bg-gray-200 rounded w-1/3 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-3" />
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="bg-white rounded-2xl border border-red-100 p-12 text-center shadow-xs">
            <h3 className="text-lg font-bold text-gray-800">
              Failed to load products
            </h3>
            <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
              Please check your connection and try refreshing the page.
            </p>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-xs">
            <h3 className="text-lg font-bold text-gray-800">
              No products found yet
            </h3>
            <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
              Check back soon! New products and top deals are being added daily.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-6">
            {products.map((product: any) => (
              <ProductCard key={product.id} data={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;