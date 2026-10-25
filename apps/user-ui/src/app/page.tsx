import Hero from '@/shared/modules/Hero';
import ProductCard from '@/shared/cards/product-card';
import React from 'react';
import Link from 'next/link';
import { Sparkles, TrendingUp, Flame } from 'lucide-react';

async function getProducts() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:8080'}/product/get-all-products`,
      { cache: 'no-store' },
    );
    if (!res.ok) return { products: [], top10Products: [] };
    const data = await res.json();
    return data;
  } catch (error) {
    return { products: [], top10Products: [] };
  }
}

const page = async () => {
  const data = await getProducts();
  const products = data?.products || [];
  const top10Products = data?.top10Products || [];

  return (
    <div className="bg-[#f8f9fa] min-h-screen">
      <Hero />
      <div className="md:w-[85%] w-[92%] max-w-7xl my-14 m-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Curated Selection
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
              Featured Products
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Explore handpicked, high quality items from top verified sellers
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

        {products.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-xs">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400">
              <Flame className="w-8 h-8 text-amber-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">
              No products found yet
            </h3>
            <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
              Check back soon! New products and top deals are being added by sellers daily.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-6">
            {products.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {top10Products.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-extrabold text-gray-900">
                  Best Sellers
                </h3>
                <p className="text-xs text-gray-500">
                  Top performing items loved by customers
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-6">
              {top10Products.map((product: any) => (
                <ProductCard key={`top-${product.id}`} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default page;