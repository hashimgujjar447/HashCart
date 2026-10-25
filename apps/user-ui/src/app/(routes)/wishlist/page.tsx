'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import useUser from '@/hooks/useUser';
import { useStore } from '@/store';
import { useLocationTracking } from '@/hooks/useLocation';
import { useDeviceTracking } from '@/hooks/useDevice';
import {
  ShoppingBag,
  Trash2,
  Heart,
  Plus,
  Minus,
  ArrowRight,
} from 'lucide-react';

const WishlistPage = () => {
  const { user } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();
  const addToCart = useStore((state: any) => state.addToCart);
  const removeFromWishlist = useStore((state: any) => state.removeFromWishlist);
  const updateWishlistQuantity = useStore(
    (state: any) => state.updateWishlistQuantity,
  );
  const wishlist = useStore((state: any) => state.wishlist) || [];

  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});

  const handleAddToCart = (item: any) => {
    addToCart(
      {
        id: item.id,
        title: item.title,
        price: item.price,
        image: item.image,
        quantity: item.quantity || 1,
        shopId: item.shopId || '',
      },
      user,
      location,
      deviceInfo,
    );
    setAddedItems((prev) => ({ ...prev, [item.id]: true }));
    removeFromWishlist(item.id, user, location, deviceInfo);
    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [item.id]: false }));
    }, 2000);
  };

  const handleRemove = (id: string) => {
    removeFromWishlist(id, user, location, deviceInfo);
  };

  return (
    <div className="bg-[#f8f9fa] min-h-screen py-10">
      <div className="w-[88%] max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Wishlist
          </h1>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1.5">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              Home
            </Link>
            <span>.</span>
            <span className="text-gray-800 font-medium">Wishlist</span>
          </div>
        </div>

        {wishlist.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center shadow-xs">
            <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-red-50 flex items-center justify-center text-red-500">
              <Heart size={36} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Your Wishlist is Empty
            </h2>
            <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
              You haven't saved any items yet. Explore our suggested products
              and save your favorites!
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all shadow hover:shadow-md cursor-pointer"
            >
              <span>Explore Products</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
            <div className="hidden md:grid grid-cols-12 bg-gray-50 py-3.5 px-6 text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-gray-100">
              <div className="col-span-5">Product</div>
              <div className="col-span-3 text-center">Price</div>
              <div className="col-span-2 text-center">Quantity</div>
              <div className="col-span-2 text-center">Action</div>
            </div>

            <div className="divide-y divide-gray-100">
              {wishlist.map((item: any) => {
                const qty = item.quantity || 1;
                const isAdded = addedItems[item.id];

                return (
                  <div
                    key={item.id}
                    className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-center hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="col-span-5 flex items-center gap-4">
                      <div className="w-16 h-16 bg-gray-50 rounded-lg p-2 flex items-center justify-center shrink-0 border border-gray-100 overflow-hidden">
                        <img
                          src={item.image || '/placeholder-product.png'}
                          alt={item.title}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <Link
                        href={`/product/${item.slug || item.id}`}
                        className="font-medium text-sm text-gray-900 hover:text-blue-600 transition-colors line-clamp-2"
                      >
                        {item.title}
                      </Link>
                    </div>

                    <div className="col-span-3 md:text-center flex md:block items-center justify-between">
                      <span className="text-xs text-gray-400 md:hidden">
                        Price:
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        ${Number(item.price || 0).toFixed(2)}
                      </span>
                    </div>

                    <div className="col-span-2 flex md:justify-center items-center justify-between">
                      <span className="text-xs text-gray-400 md:hidden">
                        Quantity:
                      </span>
                      <div className="inline-flex items-center border border-gray-200 rounded-lg bg-white overflow-hidden shadow-xs">
                        <button
                          type="button"
                          onClick={() =>
                            updateWishlistQuantity(item.id, 'decrease')
                          }
                          className="p-1.5 hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="px-3 text-xs font-semibold text-gray-800">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateWishlistQuantity(item.id, 'increase')
                          }
                          className="p-1.5 hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="col-span-2 flex items-center justify-end md:justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleAddToCart(item)}
                        className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-xs ${
                          isAdded
                            ? 'bg-emerald-600 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                        title="Add to Cart"
                      >
                        <ShoppingBag size={14} />
                        <span>{isAdded ? 'Added' : 'Add to Cart'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemove(item.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Remove from Wishlist"
                        aria-label="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
