'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  SlidersHorizontal,
  Search,
  X,
  ChevronRight,
  RotateCcw,
  Check,
  ChevronDown,
  ShoppingBag,
} from 'lucide-react';
import axiosInstance from '@/utils/axiosInstance';
import ProductCard from '@/shared/cards/product-card';

const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];

const AVAILABLE_COLORS = [
  { name: 'Black', hex: '#111827' },
  { name: 'White', hex: '#FFFFFF', border: true },
  { name: 'Red', hex: '#EF4444' },
  { name: 'Blue', hex: '#3B82F6' },
  { name: 'Green', hex: '#10B981' },
  { name: 'Yellow', hex: '#F59E0B' },
  { name: 'Gray', hex: '#6B7280' },
  { name: 'Purple', hex: '#8B5CF6' },
  { name: 'Pink', hex: '#EC4899' },
  { name: 'Navy', hex: '#1E3A8A' },
];

const DEFAULT_CATEGORIES = [
  'Electronics',
  'Fashion',
  'Home & Kitchen',
  'Beauty & Personal Care',
  'Sports & Outdoors',
  'Books',
  'Toys & Games',
  'Health & Wellness',
];

const ProductsContent = () => {
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);

  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    const cat = searchParams.get('category') || searchParams.get('categories');
    return cat ? cat.split(',').filter(Boolean) : [];
  });

  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(10000);
  const [searchQuery, setSearchQuery] = useState<string>(
    searchParams.get('search') || '',
  );
  const [selectedSort, setSelectedSort] = useState<string>('latest');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axiosInstance.get('/product/get-categories');
        if (res.data?.categories && Array.isArray(res.data.categories)) {
          setCategories(res.data.categories);
        }
      } catch (e) {}
    };
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      query.set('priceRange', `${minPrice},${maxPrice}`);
      query.set('page', String(currentPage));
      query.set('limit', '12');

      if (selectedCategories.length > 0) {
        query.set('categories', selectedCategories.join(','));
      }
      if (selectedSizes.length > 0) {
        query.set('sizes', selectedSizes.join(','));
      }
      if (selectedColors.length > 0) {
        query.set('colors', selectedColors.join(','));
      }
      if (searchQuery.trim()) {
        query.set('search', searchQuery.trim());
      }
      if (selectedSort) {
        query.set('sort', selectedSort);
      }

      const res = await axiosInstance.get(
        `/product/get-filtered-products?${query.toString()}`,
      );
      setProducts(res.data.products || []);
      setTotalProducts(res.data.total || 0);
      setTotalPages(res.data.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch filtered products', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [
    selectedCategories,
    selectedSizes,
    selectedColors,
    minPrice,
    maxPrice,
    selectedSort,
    currentPage,
  ]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProducts();
  };

  const handleCategoryToggle = (category: string) => {
    setCurrentPage(1);
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  };

  const handleSizeToggle = (size: string) => {
    setCurrentPage(1);
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size],
    );
  };

  const handleColorToggle = (color: string) => {
    setCurrentPage(1);
    setSelectedColors((prev) =>
      prev.includes(color)
        ? prev.filter((c) => c !== color)
        : [...prev, color],
    );
  };

  const handleResetFilters = () => {
    setSelectedCategories([]);
    setSelectedSizes([]);
    setSelectedColors([]);
    setMinPrice(0);
    setMaxPrice(10000);
    setSearchQuery('');
    setSelectedSort('latest');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedSizes.length > 0 ||
    selectedColors.length > 0 ||
    minPrice > 0 ||
    maxPrice < 10000 ||
    searchQuery.trim() !== '';

  const renderFilterSidebar = () => (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={18} className="text-gray-700" />
          <h2 className="text-base font-bold text-gray-900">Filters</h2>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-semibold cursor-pointer transition-colors"
          >
            <RotateCcw size={13} />
            Reset All
          </button>
        )}
      </div>

      <div>
        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">
          Categories
        </h3>
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {categories.map((cat) => {
            const isChecked = selectedCategories.includes(cat);
            return (
              <label
                key={cat}
                className="flex items-center gap-2.5 text-xs text-gray-700 hover:text-black cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleCategoryToggle(cat)}
                  className="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                />
                <span className={isChecked ? 'font-semibold text-blue-600' : ''}>
                  {cat}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="border-t border-gray-200 pt-5">
        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">
          Price Range ($)
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-gray-600 font-medium">
            <span>${minPrice}</span>
            <span>${maxPrice}</span>
          </div>
          <input
            type="range"
            min={0}
            max={10000}
            step={50}
            value={maxPrice}
            onChange={(e) => {
              setMaxPrice(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="w-full accent-blue-600 cursor-pointer"
          />
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <span className="block text-[10px] text-gray-500 mb-0.5">Min</span>
              <input
                type="number"
                min={0}
                max={maxPrice}
                value={minPrice}
                onChange={(e) => {
                  setMinPrice(Math.max(0, Number(e.target.value)));
                  setCurrentPage(1);
                }}
                className="w-full text-xs px-2.5 py-1.5 border border-gray-300 rounded focus:border-blue-600 focus:outline-none"
              />
            </div>
            <span className="text-gray-400 mt-3">-</span>
            <div className="flex-1">
              <span className="block text-[10px] text-gray-500 mb-0.5">Max</span>
              <input
                type="number"
                min={minPrice}
                max={10000}
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(Math.max(minPrice, Number(e.target.value)));
                  setCurrentPage(1);
                }}
                className="w-full text-xs px-2.5 py-1.5 border border-gray-300 rounded focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-5">
        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">
          Sizes
        </h3>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_SIZES.map((size) => {
            const isSelected = selectedSizes.includes(size);
            return (
              <button
                key={size}
                type="button"
                onClick={() => handleSizeToggle(size)}
                className={`min-w-[40px] px-2.5 py-1 text-xs font-semibold rounded border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-gray-900 text-white border-gray-900 shadow-xs'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-500'
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-gray-200 pt-5">
        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">
          Colors
        </h3>
        <div className="flex flex-wrap gap-2.5">
          {AVAILABLE_COLORS.map((col) => {
            const isSelected = selectedColors.includes(col.name);
            return (
              <button
                key={col.name}
                type="button"
                onClick={() => handleColorToggle(col.name)}
                title={col.name}
                className={`w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                  col.border ? 'border border-gray-300' : ''
                } ${
                  isSelected
                    ? 'ring-2 ring-blue-600 ring-offset-2 scale-110'
                    : 'hover:scale-105'
                }`}
                style={{ backgroundColor: col.hex }}
              >
                {isSelected && (
                  <Check
                    size={14}
                    className={
                      col.name === 'White' || col.name === 'Yellow'
                        ? 'text-gray-900'
                        : 'text-white'
                    }
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-[#f8f9fa] min-h-screen py-8 font-poppins">
      <div className="w-[90%] max-w-7xl mx-auto">
        <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-6 flex-wrap">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Home
          </Link>
          <ChevronRight size={14} />
          <span className="text-gray-900 font-semibold">All Products</span>
          {selectedCategories.length > 0 && (
            <>
              <ChevronRight size={14} />
              <span className="text-blue-600 font-medium">
                {selectedCategories.join(', ')}
              </span>
            </>
          )}
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <aside className="hidden lg:block lg:col-span-3 bg-white rounded-xl border border-gray-200/80 p-6 shadow-xs sticky top-24">
            {renderFilterSidebar()}
          </aside>

          <main className="lg:col-span-9 flex flex-col">
            <div className="bg-white rounded-xl border border-gray-200/80 p-4 mb-6 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="flex items-center justify-between sm:justify-start gap-4">
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="lg:hidden flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-800 cursor-pointer"
                >
                  <SlidersHorizontal size={15} />
                  Filters
                  {hasActiveFilters && (
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                  )}
                </button>
                <span className="text-xs sm:text-sm font-medium text-gray-600">
                  Showing{' '}
                  <span className="font-bold text-gray-900">
                    {totalProducts}
                  </span>{' '}
                  Products
                </span>
              </div>

              <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                <form
                  onSubmit={handleSearchSubmit}
                  className="relative flex-1 sm:w-56"
                >
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
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
                    <option value="latest">Latest Products</option>
                    <option value="price-low-to-high">Price: Low to High</option>
                    <option value="price-high-to-low">Price: High to Low</option>
                    <option value="top-sales">Top Best Selling</option>
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500"
                  />
                </div>
              </div>
            </div>

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
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-200 hover:bg-blue-100 cursor-pointer"
                  >
                    <span>{c}</span>
                    <X size={12} />
                  </button>
                ))}
                {selectedSizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleSizeToggle(s)}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded-full border border-gray-200 hover:bg-gray-200 cursor-pointer"
                  >
                    <span>Size: {s}</span>
                    <X size={12} />
                  </button>
                ))}
                {selectedColors.map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => handleColorToggle(col)}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded-full border border-gray-200 hover:bg-gray-200 cursor-pointer"
                  >
                    <span>Color: {col}</span>
                    <X size={12} />
                  </button>
                ))}
                {(minPrice > 0 || maxPrice < 10000) && (
                  <button
                    type="button"
                    onClick={() => {
                      setMinPrice(0);
                      setMaxPrice(10000);
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded-full border border-gray-200 hover:bg-gray-200 cursor-pointer"
                  >
                    <span>
                      ${minPrice} - ${maxPrice}
                    </span>
                    <X size={12} />
                  </button>
                )}
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

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse flex flex-col justify-between h-[360px]"
                  >
                    <div className="w-full h-48 bg-gray-200 rounded-lg mb-4" />
                    <div className="space-y-2">
                      <div className="w-3/4 h-4 bg-gray-200 rounded" />
                      <div className="w-1/2 h-3 bg-gray-200 rounded" />
                      <div className="w-1/3 h-5 bg-gray-200 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center flex flex-col items-center justify-center shadow-xs">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-4">
                  <ShoppingBag size={28} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  No Products Found
                </h3>
                <p className="text-xs text-gray-500 max-w-sm mb-6">
                  We couldn't find any products matching your current filters. Try
                  adjusting your search or clearing some filters.
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

      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          <div className="relative ml-auto w-[85%] max-w-xs h-full bg-white shadow-2xl p-6 overflow-y-auto flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-5">
                <span className="font-bold text-gray-900 text-sm">Filters</span>
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
                Apply Filters ({totalProducts})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ProductsPage = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
};

export default ProductsPage;
