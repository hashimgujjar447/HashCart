'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import {
  Store,
  Upload,
  Globe,
  MapPin,
  Clock,
  Phone,
  User,
  CheckCircle2,
  AlertCircle,
  Save,
  ExternalLink,
  Sparkles,
  Camera,
  Layers,
  Image as ImageIcon,
} from 'lucide-react';
import { useSeller } from '@/app/hooks/useSeller';
import axiosInstance from '@/app/utils/axiosInstance';
import Image from 'next/image';

const CATEGORIES = [
  'Electronics & Gadgets',
  'Fashion & Apparel',
  'Home & Kitchen',
  'Health & Beauty',
  'Sports & Outdoors',
  'Books & Stationery',
  'Toys & Games',
  'Groceries & Gourmet',
  'Jewelry & Accessories',
  'Automotive & Industrial',
  'Art & Handcrafted',
  'General Marketplace',
];

export default function ShopSettingsPage() {
  const { seller, isLoading } = useSeller();
  const queryClient = useQueryClient();

  const [shopName, setShopName] = useState('');
  const [sellerName, setSellerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [bio, setBio] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [address, setAddress] = useState('');
  const [website, setWebsite] = useState('');
  const [openingHours, setOpeningHours] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [coverBannerUrl, setCoverBannerUrl] = useState('');

  const [avatarUploading, setAvatarUploading] = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Pre-fill form when seller data loads
  useEffect(() => {
    if (seller) {
      setShopName(seller.shop?.name || '');
      setSellerName(seller.name || '');
      setPhoneNumber(seller.phone_number || '');
      setBio(seller.shop?.bio || '');
      setCategory(seller.shop?.category || CATEGORIES[0]);
      setAddress(seller.shop?.address || '');
      setWebsite(seller.shop?.website || '');
      setOpeningHours(
        seller.shop?.opening_hours || 'Mon - Sat: 09:00 AM - 08:00 PM',
      );
      setAvatarUrl(seller.shop?.avatar?.url || '');
      setCoverBannerUrl(seller.shop?.coverBanner || '');
    }
  }, [seller]);

  // Convert File to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
    });
  };

  // Upload logo/avatar
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setAvatarUploading(true);
      setStatusMessage(null);
      const base64 = await fileToBase64(file);
      const res = await axiosInstance.post('/product/upload-product-image', {
        fileName: base64,
      });
      const uploadedUrl = res.data?.file_url || res.data?.url;
      if (uploadedUrl) {
        setAvatarUrl(uploadedUrl);
      }
    } catch (err: any) {
      console.error('Avatar upload error:', err);
      setStatusMessage({
        type: 'error',
        text: 'Failed to upload logo image. Please try again.',
      });
    } finally {
      setAvatarUploading(false);
    }
  };

  // Upload cover banner
  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setBannerUploading(true);
      setStatusMessage(null);
      const base64 = await fileToBase64(file);
      const res = await axiosInstance.post('/product/upload-product-image', {
        fileName: base64,
      });
      const uploadedUrl = res.data?.file_url || res.data?.url;
      if (uploadedUrl) {
        setCoverBannerUrl(uploadedUrl);
      }
    } catch (err: any) {
      console.error('Banner upload error:', err);
      setStatusMessage({
        type: 'error',
        text: 'Failed to upload banner image. Please try again.',
      });
    } finally {
      setBannerUploading(false);
    }
  };

  // Mutation to save settings
  const updateSettingsMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: shopName,
        bio,
        category,
        address,
        opening_hours: openingHours,
        website,
        coverBanner: coverBannerUrl,
        avatar: avatarUrl
          ? {
              url: avatarUrl,
              fileId: `avatar_${seller?.shop?.id || 'shop'}_${Date.now()}`,
            }
          : undefined,
        sellerName,
        phone_number: phoneNumber,
      };

      const response = await axiosInstance.put(
        '/auth/update-shop-profile',
        payload,
      );
      return response.data;
    },
    onSuccess: (data) => {
      setStatusMessage({
        type: 'success',
        text: 'Shop settings updated successfully! Changes are live.',
      });
      queryClient.invalidateQueries({ queryKey: ['seller'] });
      setTimeout(() => setStatusMessage(null), 5000);
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.message ||
        'Failed to save shop settings. Please verify all required fields.';
      setStatusMessage({
        type: 'error',
        text: message,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName.trim()) {
      setStatusMessage({
        type: 'error',
        text: 'Shop Name is required.',
      });
      return;
    }
    updateSettingsMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-[1400px] mx-auto py-8 px-4 text-white">
        <div className="h-9 w-64 bg-slate-800/60 rounded-lg animate-pulse mb-3" />
        <div className="h-5 w-96 bg-slate-800/40 rounded-lg animate-pulse mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-[500px] bg-slate-800/30 rounded-2xl animate-pulse" />
          <div className="h-[400px] bg-slate-800/30 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1400px] mx-auto py-8 px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Shop Settings
              </h1>
              <p className="text-sm text-slate-400">
                Manage your store profile, branding, contact details, and
                operating hours
              </p>
            </div>
          </div>
        </div>

        {seller?.shop?.id && (
          <a
            href={`http://localhost:3000/shop/${seller.shop.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 transition-colors w-fit"
          >
            <span>View Public Storefront</span>
            <ExternalLink className="w-4 h-4 text-slate-400" />
          </a>
        )}
      </div>

      {/* Status Alert Banner */}
      {statusMessage && (
        <div
          className={`mb-6 p-4 rounded-xl border flex items-center gap-3 transition-all ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
          )}
          <span className="text-sm font-medium">{statusMessage.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Branding Section */}
            <div className="p-6 rounded-2xl bg-[#0c121e] border border-slate-800/80 shadow-sm space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b border-slate-800">
                <Sparkles className="w-5 h-5 text-blue-400" />
                <h2 className="text-base font-semibold text-white">
                  Store Branding & Imagery
                </h2>
              </div>

              {/* Cover Banner */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Store Banner / Header
                </label>
                <div className="relative w-full h-44 rounded-xl overflow-hidden border border-dashed border-slate-700 bg-slate-900/60 flex items-center justify-center group">
                  {coverBannerUrl ? (
                    <Image
                      src={coverBannerUrl}
                      alt="Shop Banner"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-500">
                      <ImageIcon className="w-8 h-8" />
                      <span className="text-xs">
                        Recommended: 1200 x 400px (JPG/PNG/WebP)
                      </span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => bannerInputRef.current?.click()}
                      disabled={bannerUploading}
                      className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-2 transition"
                    >
                      <Camera className="w-4 h-4" />
                      <span>
                        {bannerUploading ? 'Uploading...' : 'Change Banner'}
                      </span>
                    </button>
                    {coverBannerUrl && (
                      <button
                        type="button"
                        onClick={() => setCoverBannerUrl('')}
                        className="px-3 py-2 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-medium transition"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <input
                    ref={bannerInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleBannerUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Store Logo / Avatar */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Store Logo / Avatar
                </label>
                <div className="flex items-center gap-6">
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-blue-500/30 bg-slate-900 flex items-center justify-center group flex-shrink-0">
                    {avatarUrl ? (
                      <Image
                        src={avatarUrl}
                        alt="Store Logo"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <Store className="w-10 h-10 text-slate-500" />
                    )}

                    <div
                      onClick={() => avatarInputRef.current?.click()}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                    >
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={avatarUploading}
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-medium transition"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>
                        {avatarUploading ? 'Uploading...' : 'Upload Logo'}
                      </span>
                    </button>
                    <p className="text-xs text-slate-500">
                      Square format recommended (500x500px). Visible across
                      product cards & search.
                    </p>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Basic Store Info */}
            <div className="p-6 rounded-2xl bg-[#0c121e] border border-slate-800/80 shadow-sm space-y-5">
              <div className="flex items-center gap-2 pb-4 border-b border-slate-800">
                <Store className="w-5 h-5 text-blue-400" />
                <h2 className="text-base font-semibold text-white">
                  Basic Store Profile
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Store Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    required
                    placeholder="e.g. Apex Tech Haven"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Business Category
                  </label>
                  <div className="relative">
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-blue-500 transition appearance-none cursor-pointer"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat} className="bg-slate-900">
                          {cat}
                        </option>
                      ))}
                    </select>
                    <Layers className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Store Bio & Tagline
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Introduce your store, product focus, and brand philosophy to buyers..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Official Website / Portfolio
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://example.com"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition"
                    />
                    <Globe className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Opening / Support Hours
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={openingHours}
                      onChange={(e) => setOpeningHours(e.target.value)}
                      placeholder="e.g. Mon - Sat: 9:00 AM - 8:00 PM"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition"
                    />
                    <Clock className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Contact & Location */}
            <div className="p-6 rounded-2xl bg-[#0c121e] border border-slate-800/80 shadow-sm space-y-5">
              <div className="flex items-center gap-2 pb-4 border-b border-slate-800">
                <MapPin className="w-5 h-5 text-blue-400" />
                <h2 className="text-base font-semibold text-white">
                  Location & Contact Details
                </h2>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Physical Store Address
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 742 Evergreen Terrace, Suite 100, Springfield"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition"
                  />
                  <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Seller / Manager Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={sellerName}
                      onChange={(e) => setSellerName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition"
                    />
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Customer Support Phone
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition"
                    />
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-end gap-4 pt-2">
              <button
                type="submit"
                disabled={
                  updateSettingsMutation.isPending ||
                  avatarUploading ||
                  bannerUploading
                }
                className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {updateSettingsMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Shop Profile</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Live Store Preview Card */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-[#0c121e] border border-slate-800/80 sticky top-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Live Customer Preview
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Public Card
                </span>
              </div>

              {/* Preview Box */}
              <div className="rounded-xl overflow-hidden border border-slate-800 bg-[#080c14] shadow-md">
                {/* Banner */}
                <div className="relative w-full h-28 bg-gradient-to-r from-blue-900/40 via-slate-800 to-slate-900">
                  {coverBannerUrl && (
                    <Image
                      src={coverBannerUrl}
                      alt="Preview Banner"
                      fill
                      className="object-cover"
                    />
                  )}
                </div>

                {/* Avatar & Header */}
                <div className="px-5 pb-5 pt-0 relative">
                  <div className="relative -mt-10 mb-3 w-16 h-16 rounded-full border-2 border-[#0c121e] overflow-hidden bg-slate-900 shadow-md">
                    {avatarUrl ? (
                      <Image
                        src={avatarUrl}
                        alt="Preview Logo"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Store className="w-7 h-7" />
                      </div>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-white tracking-tight truncate">
                    {shopName || 'Your Store Name'}
                  </h3>

                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {category}
                  </span>

                  <p className="mt-2.5 text-xs text-slate-400 line-clamp-3 leading-relaxed">
                    {bio ||
                      'Store bio and product description will be displayed here for buyers.'}
                  </p>

                  <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-2 text-xs text-slate-400">
                    <div className="flex items-center gap-2 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                      <span className="truncate">
                        {address || 'Location not specified'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 truncate">
                      <Clock className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                      <span className="truncate">
                        {openingHours || 'Schedule not specified'}
                      </span>
                    </div>

                    {website && (
                      <div className="flex items-center gap-2 truncate text-blue-400">
                        <Globe className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{website}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-5 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400">
                <p className="leading-relaxed">
                  💡 This preview simulates how your storefront branding
                  appears in the marketplace directory, customer order receipts,
                  and shop detail pages.
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
