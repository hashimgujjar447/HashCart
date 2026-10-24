'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  BarChart2,
  ChevronRight,
  Eye,
  Package,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Star,
  Trash2,
  X,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/app/utils/axiosInstance';
import DeleteConfirmationModal from '@/app/shared/components/delete-confirmation-modal';

interface ProductImage {
  id: string;
  file_id: string;
  url: string;
  shopId?: string | null;
  userId?: string | null;
  productId?: string | null;
}

interface Product {
  id: string;
  title: string;
  description: string;
  detailedDescription?: string;
  tags?: string[] | string;
  warranty?: string;
  slug: string;
  brand?: string | null;
  cashOnDelivery?: string;
  category: string;
  subCategory?: string;
  video_url?: string | null;
  regular_price?: number | null;
  sale_price: number;
  stock: number;
  sizes?: string[];
  discountCodes?: string[];
  colors?: string[];
  specifications?: any;
  customProperties?: any;
  images: ProductImage[];
  sellerId: string;
  shopId?: string | null;
  status: 'Active' | 'Pending' | 'Draft' | 'OutOfStock' | 'Discontinued';
  ratings?: number;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

const ProductsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeTab, setActiveTab] = useState<'all' | 'trash'>('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const queryClient = useQueryClient();

  const {
    data: products = [],
    isLoading,
    isError,
    error,
  } = useQuery<Product[]>({
    queryKey: ['seller-products', activeTab],
    queryFn: async () => {
      const endpoint =
        activeTab === 'trash'
          ? '/product/get-products?deletedOnly=true'
          : '/product/get-products';
      const response = await axiosInstance.get(endpoint);
      return response.data?.products || [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id?: string) => {
      if (!id) return;
      const response = await axiosInstance.delete(`/product/delete-product/${id}`);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['seller-products'] });
      setShowDeleteModal(false);
      setSelectedProduct(null);
      setNotification({
        type: 'success',
        message:
          data?.message ||
          'Product moved to trash. You can restore it within 24 hours.',
      });
      setTimeout(() => setNotification(null), 4000);
    },
    onError: (err: any) => {
      setNotification({
        type: 'error',
        message:
          err?.response?.data?.message ||
          'Failed to delete product. Please try again.',
      });
      setTimeout(() => setNotification(null), 5000);
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async (id?: string) => {
      if (!id) return;
      const response = await axiosInstance.put(`/product/restore-product/${id}`);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['seller-products'] });
      setShowDeleteModal(false);
      setSelectedProduct(null);
      setNotification({
        type: 'success',
        message: data?.message || 'Product restored successfully.',
      });
      setTimeout(() => setNotification(null), 4000);
    },
    onError: (err: any) => {
      setNotification({
        type: 'error',
        message:
          err?.response?.data?.message ||
          'Failed to restore product. The 24-hour restore window may have expired.',
      });
      setTimeout(() => setNotification(null), 5000);
    },
  });

  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(products.map((p) => p.category).filter(Boolean)),
    );
    return ['All', ...unique];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.category &&
          product.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.brand &&
          product.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.slug &&
          product.slug.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory =
        selectedCategory === 'All' || product.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  const openDeleteModal = (product: Product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  return (
    <div className="w-full min-h-screen bg-[#070b12] text-white p-4 md:p-8">
      <div className="max-w-[1400px] mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              All Products
            </h1>
            <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
              <Link
                href="/dashboard"
                className="hover:text-blue-400 transition-colors"
              >
                Dashboard
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
              <span className="text-blue-500 font-medium">All Products</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/create-product"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-medium text-sm transition-all shadow-md shadow-blue-900/20 active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Product</span>
            </Link>
          </div>
        </div>

        {notification && (
          <div
            className={`flex items-center justify-between p-3.5 rounded-lg text-sm border animate-in fade-in duration-200 ${
              notification.type === 'success'
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
                : 'bg-red-950/40 text-red-300 border-red-800/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              )}
              <span>{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-gray-400 hover:text-white p-1 rounded transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="flex items-center gap-2 border-b border-[#1f2838] pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              activeTab === 'all'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Active Catalog
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('trash')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'trash'
                ? 'bg-amber-600/20 text-amber-300 border border-amber-500/30'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Trash (24h Restore)</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#0d131f] border border-[#1f2838] text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {categories.length > 2 && (
            <div className="sm:w-48 shrink-0">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#0d131f] border border-[#1f2838] text-gray-300 text-sm focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'All' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-[#1a2333] bg-[#0c121e] shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#1a2333] bg-[#0e1626]/80 text-gray-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-20">Image</th>
                  <th className="py-3.5 px-4 min-w-[200px]">Product Name</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Rating</th>
                  <th className="py-3.5 px-4 text-right pr-6">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#162032] text-sm">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="py-4 px-4">
                        <div className="w-11 h-11 rounded-lg bg-[#162032]" />
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-4 w-40 bg-[#162032] rounded mb-1.5" />
                        <div className="h-3 w-24 bg-[#162032] rounded" />
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-4 w-16 bg-[#162032] rounded" />
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-4 w-20 bg-[#162032] rounded" />
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-4 w-24 bg-[#162032] rounded" />
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-4 w-12 bg-[#162032] rounded" />
                      </td>
                      <td className="py-4 px-4 text-right pr-6">
                        <div className="h-4 w-24 bg-[#162032] rounded ml-auto" />
                      </td>
                    </tr>
                  ))
                ) : isError ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-400">
                      <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                      <p className="text-base text-gray-300 font-medium">
                        Failed to load products
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {(error as any)?.response?.data?.message ||
                          'Could not connect to product service.'}
                      </p>
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <div className="max-w-xs mx-auto space-y-3">
                        <div className="w-12 h-12 rounded-full bg-[#162032] text-gray-400 flex items-center justify-center mx-auto">
                          <Package className="w-6 h-6 text-gray-500" />
                        </div>
                        <h3 className="text-base font-medium text-gray-200">
                          {searchTerm
                            ? 'No matching products found'
                            : activeTab === 'trash'
                            ? 'Trash is empty'
                            : 'No products uploaded yet'}
                        </h3>
                        <p className="text-xs text-gray-400">
                          {searchTerm
                            ? 'Try adjusting your search terms or filters.'
                            : activeTab === 'trash'
                            ? 'Deleted products eligible for restoration will appear here.'
                            : 'Create your first product to display it in your shop.'}
                        </p>
                        {!searchTerm && activeTab === 'all' && (
                          <Link
                            href="/dashboard/create-product"
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs text-white font-medium transition cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Product</span>
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => {
                    const firstImage = product.images?.[0]?.url;
                    const stock = Number(product.stock) || 0;
                    const ratings = product.ratings || 5;

                    return (
                      <tr
                        key={product.id}
                        className="hover:bg-[#101828]/60 transition-colors group"
                      >
                        <td className="py-3 px-4">
                          <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-[#162032] border border-[#212d42] shrink-0 flex items-center justify-center">
                            {firstImage ? (
                              <img
                                src={firstImage}
                                alt={product.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-5 h-5 text-gray-500" />
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => setPreviewProduct(product)}
                            className="text-left font-medium text-blue-400 hover:text-blue-300 hover:underline transition cursor-pointer max-w-[260px] truncate block"
                            title={product.title}
                          >
                            {product.title}
                          </button>
                          <span className="text-[11px] text-gray-500 block truncate max-w-[240px] mt-0.5">
                            {product.brand ? `${product.brand} • ` : ''}
                            {product.slug}
                          </span>
                        </td>

                        <td className="py-3 px-4 font-medium text-gray-200 whitespace-nowrap">
                          ${product.sale_price}
                          {product.regular_price &&
                            product.regular_price > product.sale_price && (
                              <span className="text-xs text-gray-500 line-through ml-1.5">
                                ${product.regular_price}
                              </span>
                            )}
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          {stock > 0 ? (
                            <span
                              className={`text-xs font-medium ${
                                stock <= 10
                                  ? 'text-amber-400'
                                  : 'text-gray-300'
                              }`}
                            >
                              {stock} left
                            </span>
                          ) : (
                            <span className="text-xs font-medium text-red-400 bg-red-950/40 px-2 py-0.5 rounded border border-red-900/40">
                              Out of stock
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-gray-300 whitespace-nowrap">
                          {product.category || '—'}
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-gray-200 text-xs font-medium">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span>{ratings}</span>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-right pr-6 whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2.5">
                            {activeTab === 'trash' ? (
                              <button
                                type="button"
                                onClick={() => openDeleteModal(product)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-medium transition cursor-pointer"
                                title="Restore product"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Restore</span>
                              </button>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => setPreviewProduct(product)}
                                  className="p-1.5 rounded-md text-blue-400 hover:text-blue-300 hover:bg-[#1a253a] transition cursor-pointer"
                                  title="View details"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>

                                <Link
                                  href={`/dashboard/create-product?edit=${product.id}`}
                                  className="p-1.5 rounded-md text-amber-400 hover:text-amber-300 hover:bg-[#1a253a] transition cursor-pointer"
                                  title="Edit product"
                                >
                                  <Pencil className="w-4 h-4" />
                                </Link>

                                <button
                                  type="button"
                                  onClick={() => setPreviewProduct(product)}
                                  className="p-1.5 rounded-md text-emerald-400 hover:text-emerald-300 hover:bg-[#1a253a] transition cursor-pointer"
                                  title="Analytics / Status"
                                >
                                  <BarChart2 className="w-4 h-4" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => openDeleteModal(product)}
                                  className="p-1.5 rounded-md text-red-400 hover:text-red-300 hover:bg-[#281519] transition cursor-pointer"
                                  title="Delete product"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {!isLoading && filteredProducts.length > 0 && (
            <div className="px-5 py-3 border-t border-[#1a2333] bg-[#0c121e] flex items-center justify-between text-xs text-gray-400">
              <span>
                Showing {filteredProducts.length} of {products.length} product(s)
              </span>
            </div>
          )}
        </div>
      </div>

      {showDeleteModal && (
        <DeleteConfirmationModal
          product={selectedProduct}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={() => deleteMutation.mutate(selectedProduct?.id)}
          onRestore={() => restoreMutation.mutate(selectedProduct?.id)}
          isDeleting={deleteMutation.isPending}
          isRestoring={restoreMutation.isPending}
        />
      )}

      {previewProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150"
          onClick={() => setPreviewProduct(null)}
        >
          <div
            className="w-full max-w-[620px] max-h-[85vh] rounded-xl bg-[#0e131d] border border-[#232b3b] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#1f2838]">
              <div>
                <h3 className="text-base font-semibold text-white tracking-tight">
                  {previewProduct.title}
                </h3>
                <span className="text-xs text-gray-400">
                  {previewProduct.category}
                  {previewProduct.subCategory
                    ? ` / ${previewProduct.subCategory}`
                    : ''}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewProduct(null)}
                className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-[#1a2231] transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-sm">
              {previewProduct.images && previewProduct.images.length > 0 && (
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                    Product Images ({previewProduct.images.length})
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {previewProduct.images.map((img) => (
                      <div
                        key={img.id || img.file_id}
                        className="w-20 h-20 rounded-lg overflow-hidden border border-[#233149] bg-[#162032] shrink-0"
                      >
                        <img
                          src={img.url}
                          alt="preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-[#121927] border border-[#1f2a3e]">
                  <span className="text-xs text-gray-400 block">Sale Price</span>
                  <span className="text-base font-bold text-white mt-0.5 block">
                    ${previewProduct.sale_price}
                  </span>
                </div>
                {previewProduct.regular_price && (
                  <div className="p-3 rounded-lg bg-[#121927] border border-[#1f2a3e]">
                    <span className="text-xs text-gray-400 block">Regular Price</span>
                    <span className="text-base font-medium text-gray-300 line-through mt-0.5 block">
                      ${previewProduct.regular_price}
                    </span>
                  </div>
                )}
                <div className="p-3 rounded-lg bg-[#121927] border border-[#1f2a3e]">
                  <span className="text-xs text-gray-400 block">Stock Available</span>
                  <span className="text-base font-bold text-white mt-0.5 block">
                    {previewProduct.stock}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-[#121927] border border-[#1f2a3e]">
                  <span className="text-xs text-gray-400 block">Status</span>
                  <span className="text-sm font-semibold text-emerald-400 mt-0.5 block">
                    {previewProduct.status}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-[#121927] border border-[#1f2a3e]">
                  <span className="text-xs text-gray-400 block">Rating</span>
                  <div className="flex items-center gap-1 text-sm font-bold text-white mt-0.5">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{previewProduct.ratings || 5}</span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#121927] border border-[#1f2a3e]">
                  <span className="text-xs text-gray-400 block">Warranty</span>
                  <span className="text-sm font-medium text-white mt-0.5 block truncate">
                    {previewProduct.warranty || 'None'}
                  </span>
                </div>
              </div>

              {previewProduct.description && (
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                    Short Description
                  </label>
                  <p className="text-xs text-gray-300 leading-relaxed bg-[#121927] p-3 rounded-lg border border-[#1f2a3e]">
                    {previewProduct.description}
                  </p>
                </div>
              )}

              {previewProduct.colors && previewProduct.colors.length > 0 && (
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                    Available Colors
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {previewProduct.colors.map((color, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#121927] border border-[#1f2a3e] text-xs text-gray-300"
                      >
                        <span
                          className="w-3 h-3 rounded-full border border-white/20"
                          style={{ backgroundColor: color }}
                        />
                        <span>{color}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {previewProduct.sizes && previewProduct.sizes.length > 0 && (
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                    Available Sizes
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {previewProduct.sizes.map((size, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded bg-[#121927] border border-[#1f2a3e] text-xs font-medium text-gray-300"
                      >
                        {size}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#1f2838] bg-[#0c121e]">
              <button
                type="button"
                onClick={() => setPreviewProduct(null)}
                className="px-4 py-2 rounded-lg bg-[#18202f] hover:bg-[#202b3e] text-gray-300 text-sm font-medium transition cursor-pointer border border-[#263347]"
              >
                Close
              </button>
              <Link
                href={`/dashboard/create-product?edit=${previewProduct.id}`}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition cursor-pointer flex items-center gap-1.5"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit Product</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
