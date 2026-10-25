'use client';

import React from 'react';
import Link from 'next/link';
import { Star, ShoppingBag, Store } from 'lucide-react';

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
}

export interface Product {
  id: string;
  title: string;
  description: string;
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
  sellerId: string;
  shopId?: string | null;
  shop?: Shop | null;
  ratings?: number;
  totalSales?: number;
  createdAt: string;
  updatedAt: string;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const imageUrl =
    product.images && product.images.length > 0 && product.images[0]?.url
      ? product.images[0].url
      : '/placeholder-product.png';

  const discountPercent =
    product.regular_price && product.regular_price > product.sale_price
      ? Math.round(
          ((product.regular_price - product.sale_price) /
            product.regular_price) *
            100,
        )
      : 0;

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative w-full aspect-square bg-[#f8f9fa] overflow-hidden">
          {imageUrl.startsWith('http') || imageUrl.startsWith('/') ? (
            <img
              src={imageUrl}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <ShoppingBag className="w-12 h-12 stroke-[1.5]" />
            </div>
          )}

          {discountPercent > 0 && (
            <div className="absolute top-3 left-3 bg-rose-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
              -{discountPercent}%
            </div>
          )}

          {product.category && (
            <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-gray-700 text-[11px] font-medium px-2 py-0.5 rounded-md shadow-xs">
              {product.category}
            </div>
          )}
        </div>
      </Link>

      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          {product.shop?.name && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1.5">
              <Store className="w-3.5 h-3.5 text-gray-400" />
              <span className="truncate hover:text-blue-600 transition-colors">
                {product.shop.name}
              </span>
            </div>
          )}

          <Link href={`/product/${product.slug}`} className="block group-hover:text-blue-600 transition-colors">
            <h3 className="font-semibold text-gray-800 text-sm md:text-base line-clamp-2 leading-snug">
              {product.title}
            </h3>
          </Link>

          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex items-center text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
              <span className="text-xs font-semibold text-gray-700 ml-1">
                {(product.ratings ?? 5).toFixed(1)}
              </span>
            </div>
            {product.totalSales !== undefined && product.totalSales > 0 && (
              <>
                <span className="text-gray-300">•</span>
                <span className="text-xs text-gray-500">
                  {product.totalSales} sold
                </span>
              </>
            )}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-gray-900">
              ${product.sale_price.toFixed(2)}
            </span>
            {product.regular_price && product.regular_price > product.sale_price && (
              <span className="text-xs text-gray-400 line-through">
                ${product.regular_price.toFixed(2)}
              </span>
            )}
          </div>

          <Link
            href={`/product/${product.slug}`}
            className="p-2 rounded-xl bg-gray-100 hover:bg-blue-600 text-gray-600 hover:text-white transition-all shadow-xs"
            aria-label="View product"
          >
            <ShoppingBag className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;