'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  X,
  SlidersHorizontal,
  RotateCcw,
  ChevronDown,
  Store,
} from 'lucide-react';
import axiosInstance from '@/utils/axiosInstance';
import { categories } from '@/configs/categories';
import ShopCard, { ShopType } from '@/shared/cards/shop-card';

const ShopsContent = () => {
  const searchParams = useSearchParams();

  const [shops, setShops] = useState<ShopType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    const cat = searchParams.get('category') || searchParams.get('categories');
    return cat ? cat.split(',').filter(Boolean) : [];
  });
  const [searchQuery, setSearchQuery] = useState<string>(
    searchParams.get('search') || '',
  );
  const [selectedSort, setSelectedSort] = useState<string>('latest');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalShops, setTotalShops] = useState<number>(0);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);

  const fetchShops = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      query.set('page', String(currentPage));
      query.set('limit', '12');

      if (selectedCategories.length > 0) {
        query.set('categories', selectedCategories.join(','));
      }
      if (searchQuery.trim()) {
        query.set('search', searchQuery.trim());
      }
      if (selectedSort) {
        query.set('sort', selectedSort);
      }

      // Try /shop/get-all-shops, with fallbacks to /auth/get-all-shops and /product/get-all-shops
      let res;
      try {
        res = await axiosInstance.get(`/shop/get-all-shops?${query.toString()}`);
      } catch (err) {
        try {
          res = await axiosInstance.get(`/auth/get-all-shops?${query.toString()}`);
        } catch (err2) {
          res = await axiosInstance.get(`/product/get-all-shops?${query.toString()}`);
        }
      }

      setShops(res.data.shops || []);
      setTotalShops(res.data.total || 0);
      setTotalPages(res.data.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch shops', error);
      setShops([]);
      setTotalShops(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, [selectedCategories, selectedSort, currentPage]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchShops();
  };

  const handleCategoryToggle = (categoryValue: string) => {
    setCurrentPage(1);
    setSelectedCategories((prev) =>
      prev.includes(categoryValue)
        ? prev.filter((c) => c !== categoryValue)
        : [...prev, categoryValue],
    );
  };

  const handleResetFilters = () => {
    setSelectedCategories([]);
    setSearchQuery('');
    setSelectedSort('latest');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    selectedCategories.length > 0 || searchQuery.trim() !== '';

  const renderFilterSidebar = () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-gray-200 pb-3">
        <h2 className="text-sm font-bold text-gray-900 tracking-tight">
          Categories
        </h2>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-semibold cursor-pointer transition-colors"
          >
            <RotateCcw size={12} />
            Reset
          </button>
        )}
      </div>

      <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
        {categories.map((cat) => {
          const isChecked = selectedCategories.includes(cat.value);
          return (
            <label
              key={cat.value}
              className="flex items-center gap-2.5 text-xs text-gray-700 hover:text-black cursor-pointer select-none py-0.5"
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => handleCategoryToggle(cat.value)}
                className="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
              />
              <span
                className={`capitalize ${
                  isChecked ? 'font-semibold text-blue-600' : ''
                }`}
              >
                {cat.value}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="bg-[#f8f9fa] min-h-screen py-8 font-poppins">
      <div className="w-[90%] max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 mb-2 flex-wrap">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Home
          </Link>
          <span className="text-gray-400">.</span>
          <span className="text-gray-900 font-medium">All Shops</span>
          {selectedCategories.length > 0 && (
            <>
              <span className="text-gray-400">.</span>
              <span className="text-blue-600 font-medium capitalize">
                {selectedCategories.join(', ')}
              </span>
            </>
          )}
        </nav>

        {/* Heading */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-8 tracking-tight">
          All Shops
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Desktop Left Sidebar: Categories */}
          <aside className="hidden lg:block lg:col-span-3 bg-white rounded-xl border border-gray-200/80 p-5 shadow-xs sticky top-24">
            {renderFilterSidebar()}
          </aside>

          {/* Right Main Content */}
          <main className="lg:col-span-9 flex flex-col">
            {/* Toolbar */}
            <div className="bg-white rounded-xl border border-gray-200/80 p-4 mb-6 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="flex items-center justify-between sm:justify-start gap-4">
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="lg:hidden flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-800 cursor-pointer"
                >
                  <SlidersHorizontal size={15} />
                  Categories
                  {hasActiveFilters && (
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                  )}
                </button>
                <span className="text-xs sm:text-sm font-medium text-gray-600">
                  Showing{' '}
                  <span className="font-bold text-gray-900">{totalShops}</span>{' '}
                  Shops
                </span>
              </div>

              <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                <form
                  onSubmit={handleSearchSubmit}
                  className="relative flex-1 sm:w-60"
                >
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search shops..."
                    className="w-full text-xs pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                  />
                  <Search
                    size={15}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                </form>

                <div className="relative flex items-center">
                  <select
                    value={selectedSort}
                    onChange={(e) => {
                      setSelectedSort(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="text-xs bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-700 font-medium focus:border-blue-600 focus:outline-none cursor-pointer pr-7 appearance-none"
                  >
                    <option value="latest">Latest Shops</option>
                    <option value="ratings">Highest Rated</option>
                    <option value="oldest">Oldest</option>
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500"
                  />
                </div>
              </div>
            </div>

            {/* Active Filter Badges */}
            {hasActiveFilters && (
              <div className="flex items-center gap-2 mb-6 flex-wrap">
                <span className="text-xs text-gray-500 font-medium">
                  Active Filters:
                </span>
                {selectedCategories.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleCategoryToggle(c)}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-200 hover:bg-blue-100 cursor-pointer capitalize"
                  >
                    <span>{c}</span>
                    <X size={12} />
                  </button>
                ))}
                {searchQuery.trim() && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded-full border border-gray-200 hover:bg-gray-200 cursor-pointer"
                  >
                    <span>Search: {searchQuery}</span>
                    <X size={12} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs text-red-600 hover:underline font-semibold ml-1 cursor-pointer"
                >
                  Clear All
                </button>
              </div>
            )}

            {/* Content Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl border border-gray-200 p-0 animate-pulse overflow-hidden h-[300px] flex flex-col justify-between"
                  >
                    <div className="w-full h-[120px] bg-gray-200" />
                    <div className="relative -mt-9 flex justify-center">
                      <div className="w-18 h-18 rounded-full bg-gray-300 border-4 border-white" />
                    </div>
                    <div className="px-5 py-3 space-y-2 text-center flex flex-col items-center">
                      <div className="w-1/2 h-4 bg-gray-200 rounded" />
                      <div className="w-1/3 h-3 bg-gray-200 rounded" />
                      <div className="w-2/3 h-3 bg-gray-200 rounded mt-2" />
                    </div>
                    <div className="p-3 border-t border-gray-100 flex justify-center">
                      <div className="w-24 h-4 bg-gray-200 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : shops.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                {shops.map((shop) => (
                  <ShopCard key={shop.id} shop={shop} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center flex flex-col items-center justify-center shadow-xs">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-4">
                  <Store size={28} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  No Shops Found
                </h3>
                <p className="text-xs text-gray-500 max-w-sm mb-6">
                  We couldn't find any shops matching your current category
                  filters or search query.
                </p>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    Reset All Filters
                  </button>
                )}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentPage((p) => Math.max(1, p - 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={currentPage <= 1}
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
                >
                  Previous
                </button>
                {[...Array(totalPages)].map((_, i) => {
                  const pNum = i + 1;
                  return (
                    <button
                      key={pNum}
                      type="button"
                      onClick={() => {
                        setCurrentPage(pNum);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`w-9 h-9 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        currentPage === pNum
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => {
                    setCurrentPage((p) => Math.min(totalPages, p + 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={currentPage >= totalPages}
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
                >
                  Next
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          <div className="relative ml-auto w-[85%] max-w-xs h-full bg-white shadow-2xl p-6 overflow-y-auto flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-5">
                <span className="font-bold text-gray-900 text-sm">
                  Categories
                </span>
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1 text-gray-500 hover:text-black cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>
              {renderFilterSidebar()}
            </div>
            <div className="border-t border-gray-200 pt-4 mt-6">
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                Apply ({totalShops})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ShopsPage = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ShopsContent />
    </Suspense>
  );
};

export default ShopsPage;
