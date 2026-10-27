'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Star,
  MapPin,
  MessageSquare,
  ShoppingBag,
  Heart,
} from 'lucide-react';
import { useStore } from '@/store';
import { useUser } from '@/hooks/useUser';
import { useLocationTracking } from '@/hooks/useLocation';
import { useDevice } from '@/hooks/useDevice';
import { sendKafkaEvent } from '@/actions/track-user';
import LoginRequiredModal from '@/shared/components/modals/login-required-modal';

interface ProductDetailsCardProps {
  data: any;
  setOpen: (open: boolean) => void;
}

const ProductDetailsCard: React.FC<ProductDetailsCardProps> = ({
  data,
  setOpen,
}) => {
  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedSize, setSelectedSize] = useState<string>(
    data?.sizes && data.sizes.length > 0 ? data.sizes[0] : '',
  );
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

  const { user } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDevice();

  const { wishlist, addToCart, addToWishlist, removeFromWishlist } = useStore();
  const isWishlist = wishlist?.some((item) => item.id === data?.id);

  useEffect(() => {
    if (data?.id) {
      sendKafkaEvent({
        userId: user?.id,
        productId: data.id,
        shopId: data.shopId || data.shop?.id || '',
        action: 'product_view',
        device: deviceInfo || '',
        country: location?.country || '',
        city: location?.city || '',
      });
    }
  }, [data?.id, user?.id, deviceInfo, location?.country]);

  const images =
    data?.images && data.images.length > 0
      ? data.images
      : [{ url: '/placeholder-product.png' }];

  const activeImageUrl =
    images[selectedImage]?.url || images[0]?.url || '/placeholder-product.png';

  const shopAvatar =
    data?.shop?.avatar?.url ||
    data?.shop?.avatar ||
    'https://api.dicebear.com/7.x/bottts/svg?seed=shop';

  const handleWishlist = () => {
    if (isWishlist) {
      removeFromWishlist(data?.id, user, location, deviceInfo);
    } else if (data) {
      addToWishlist(
        {
          id: data.id,
          title: data.title,
          price: data.sale_price,
          image: activeImageUrl,
          shopId: data.shopId || data.shop?.id || '',
        },
        user,
        location,
        deviceInfo,
      );
    }
  };

  const handleAddToCart = () => {
    if (data) {
      if (!user) {
        setShowLoginModal(true);
        return;
      }
      addToCart(
        {
          id: data.id,
          title: data.title,
          price: data.sale_price,
          image: activeImageUrl,
          quantity,
          shopId: data.shopId || data.shop?.id || '',
        },
        user,
        location,
        deviceInfo,
      );
      setOpen(false);
    }
  };

  return (
    <div
      className="fixed flex items-center justify-center top-0 left-0 h-screen w-full bg-[#0000004b] z-50 p-4"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-[92%] md:w-[75%] lg:w-[65%] max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl relative p-5 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 p-1 text-gray-700 hover:text-black cursor-pointer transition-colors"
          aria-label="Close"
        >
          <X size={24} />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="w-full flex flex-col items-center">
            <div className="w-full h-[320px] flex items-center justify-center p-2">
              <img
                src={activeImageUrl}
                alt={data?.title || 'Product'}
                className="w-full h-full object-contain"
              />
            </div>

            {images.length > 1 && (
              <div className="flex items-center gap-2 mt-4 overflow-x-auto max-w-full pb-1">
                {images.map((img: any, index: number) => (
                  <div
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-[60px] h-[60px] rounded border ${
                      selectedImage === index
                        ? 'border-gray-900 shadow-xs'
                        : 'border-gray-200 hover:border-gray-400'
                    } p-1 cursor-pointer flex items-center justify-center bg-white shrink-0 transition-all`}
                  >
                    <img
                      src={img?.url}
                      alt=""
                      className="w-full h-full object-contain"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="w-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center">
                  <img
                    src={shopAvatar}
                    alt={data?.shop?.name || 'Seller'}
                    className="w-[50px] h-[50px] rounded-full object-cover bg-purple-100 mr-3 border border-purple-200"
                  />
                  <div>
                    <h4 className="font-semibold text-base text-gray-900 leading-tight">
                      {data?.shop?.name || 'Becodemy'}
                    </h4>
                    <div className="flex items-center gap-0.5 my-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={14}
                          className={`w-3.5 h-3.5 ${
                            star <= Math.round(data?.shop?.ratings ?? data?.ratings ?? 0)
                              ? 'text-[#f59e0b] fill-[#f59e0b]'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex items-center text-xs text-gray-500 gap-1">
                      <MapPin size={12} className="text-gray-400 shrink-0" />
                      <span>{data?.shop?.address || '653 Banani, Dhaka'}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs sm:text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <MessageSquare size={16} />
                  <span>Chat with Seller</span>
                </button>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-5">
                {data?.title}
              </h2>

              <p className="text-gray-600 text-sm mt-1 leading-relaxed">
                {data?.description || data?.detailedDescription || ''}
              </p>

              {data?.sizes && data.sizes.length > 0 && (
                <div className="mt-4">
                  <span className="font-semibold text-sm text-gray-800 block mb-2">
                    Size:
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {data.sizes.map((size: string, idx: number) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`px-3 py-1 rounded text-xs font-semibold uppercase cursor-pointer transition-colors ${
                          selectedSize === size
                            ? 'bg-black text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-baseline gap-3 mt-4">
                <span className="text-2xl font-bold text-gray-900">
                  ${data?.sale_price}
                </span>
                {data?.regular_price && data.regular_price > data.sale_price && (
                  <span className="text-base text-red-500 line-through">
                    ${data.regular_price}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 mt-5 flex-wrap sm:flex-nowrap">
                <div className="flex items-center bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    className="px-3.5 py-2 text-slate-700 font-bold hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-4 text-xs sm:text-sm font-bold text-slate-900">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((prev) =>
                        data?.stock ? Math.min(data.stock, prev + 1) : prev + 1,
                      )
                    }
                    className="px-3.5 py-2 text-slate-700 font-bold hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex-1 py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                >
                  <ShoppingBag size={18} />
                  <span>Add to Cart</span>
                </button>

                <button
                  type="button"
                  onClick={handleWishlist}
                  className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                  title="Wishlist"
                >
                  <Heart
                    size={20}
                    className={`${
                      isWishlist
                        ? 'text-red-500 fill-red-500'
                        : 'text-slate-400 hover:text-red-500'
                    }`}
                  />
                </button>
              </div>

              <div className="mt-4">
                <span className="text-sm font-semibold text-[#27b374]">
                  {data?.stock && data.stock > 0 ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  );
};

export default ProductDetailsCard;