import { sendKafkaEvent } from '@/actions/track-user';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Product = {
  id: string;
  title: string;
  price: number;
  image: string;
  quantity?: number;
  shopId: string;
};

type UserState = {
  id: string;
  name: string;
  email: string;
  phone_number?: string | null;
  avatar?: string | null;
  role?: string;
};

type Store = {
  cart: Product[];
  wishlist: Product[];
  wishList: Product[];
  user: UserState | null;
  setUser: (user: UserState) => void;
  clearUser: () => void;
  addToCart: (
    product: Product,
    user?: any,
    location?: any,
    deviceInfo?: any,
  ) => void;
  removeFromCart: (
    id: string,
    user?: any,
    location?: any,
    deviceInfo?: any,
  ) => void;
  addToWishlist: (
    product: Product,
    user?: any,
    location?: any,
    deviceInfo?: any,
  ) => void;
  addToWishList: (
    product: Product,
    user?: any,
    location?: any,
    deviceInfo?: any,
  ) => void;
  removeFromWishlist: (
    id: string,
    user?: any,
    location?: any,
    deviceInfo?: any,
  ) => void;
  removeFromWishList: (
    id: string,
    user?: any,
    location?: any,
    deviceInfo?: any,
  ) => void;
  updateWishlistQuantity: (
    id: string,
    type: 'increase' | 'decrease' | number,
  ) => void;
  updateWishListQuantity: (
    id: string,
    type: 'increase' | 'decrease' | number,
  ) => void;
  increaseWishlistQuantity: (id: string) => void;
  decreaseWishlistQuantity: (id: string) => void;
  updateCartQuantity: (
    id: string,
    type: 'increase' | 'decrease' | number,
  ) => void;
};

export const useStore = create<Store>()(
  persist(
    (set, get) => {
      const addToWishlist = (
        product: Product,
        user?: any,
        location?: any,
        deviceInfo?: any,
      ) => {
        const isExist = get().wishlist.find((item) => item.id === product.id);
        if (!isExist) {
          const updated = [
            ...get().wishlist,
            { ...product, quantity: product.quantity || 1 },
          ];
          set({
            wishlist: updated,
            wishList: updated,
          });
        }

        sendKafkaEvent({
          userId: user?.id,
          productId: product.id,
          shopId: product.shopId,
          action: 'add_to_wishList',
          device: typeof deviceInfo === 'string' ? deviceInfo : deviceInfo?.device || '',
          country: location?.country || '',
          city: location?.city || '',
        });
      };

      const removeFromWishlist = (
        id: string,
        user?: any,
        location?: any,
        deviceInfo?: any,
      ) => {
        const itemToRemove = get().wishlist.find((item) => item.id === id);
        const updated = get().wishlist.filter((item) => item.id !== id);
        set({
          wishlist: updated,
          wishList: updated,
        });

        sendKafkaEvent({
          userId: user?.id,
          productId: id,
          shopId: itemToRemove?.shopId || '',
          action: 'remove_from_wishList',
          device: typeof deviceInfo === 'string' ? deviceInfo : deviceInfo?.device || '',
          country: location?.country || '',
          city: location?.city || '',
        });
      };

      const addToCart = (
        product: Product,
        user?: any,
        location?: any,
        deviceInfo?: any,
      ) => {
        const existingProduct = get().cart.find(
          (item) => item.id === product.id,
        );
        if (existingProduct) {
          set({
            cart: get().cart.map((item) =>
              item.id === product.id
                ? {
                    ...item,
                    quantity: (item.quantity || 1) + (product.quantity || 1),
                  }
                : item,
            ),
          });
        } else {
          set({
            cart: [
              ...get().cart,
              { ...product, quantity: product.quantity || 1 },
            ],
          });
        }

        sendKafkaEvent({
          userId: user?.id,
          productId: product.id,
          shopId: product.shopId,
          action: 'add_to_cart',
          device: typeof deviceInfo === 'string' ? deviceInfo : deviceInfo?.device || '',
          country: location?.country || '',
          city: location?.city || '',
        });
      };

      const removeFromCart = (
        id: string,
        user?: any,
        location?: any,
        deviceInfo?: any,
      ) => {
        const itemToRemove = get().cart.find((item) => item.id === id);
        set({
          cart: get().cart.filter((item) => item.id !== id),
        });

        sendKafkaEvent({
          userId: user?.id,
          productId: id,
          shopId: itemToRemove?.shopId || '',
          action: 'remove_from_cart',
          device: typeof deviceInfo === 'string' ? deviceInfo : deviceInfo?.device || '',
          country: location?.country || '',
          city: location?.city || '',
        });
      };

      const updateWishlistQuantity = (
        id: string,
        type: 'increase' | 'decrease' | number,
      ) => {
        const updated = get().wishlist.map((item) => {
          if (item.id === id) {
            let newQty = item.quantity || 1;
            if (typeof type === 'number') {
              newQty = type;
            } else if (type === 'increase') {
              newQty += 1;
            } else if (type === 'decrease') {
              newQty = Math.max(1, newQty - 1);
            }
            return { ...item, quantity: Math.max(1, newQty) };
          }
          return item;
        });

        set({
          wishlist: updated,
          wishList: updated,
        });
      };

      const updateCartQuantity = (
        id: string,
        type: 'increase' | 'decrease' | number,
      ) => {
        const updated = get().cart.map((item) => {
          if (item.id === id) {
            let newQty = item.quantity || 1;
            if (typeof type === 'number') {
              newQty = type;
            } else if (type === 'increase') {
              newQty += 1;
            } else if (type === 'decrease') {
              newQty = Math.max(1, newQty - 1);
            }
            return { ...item, quantity: Math.max(1, newQty) };
          }
          return item;
        });

        set({
          cart: updated,
        });
      };

      return {
        cart: [],
        wishlist: [],
        wishList: [],
        user: null,
        setUser: (user: UserState) => set({ user }),
        clearUser: () => set({ user: null }),
        addToCart,
        removeFromCart,
        addToWishlist,
        addToWishList: addToWishlist,
        removeFromWishlist,
        removeFromWishList: removeFromWishlist,
        updateWishlistQuantity,
        updateWishListQuantity: updateWishlistQuantity,
        increaseWishlistQuantity: (id: string) =>
          updateWishlistQuantity(id, 'increase'),
        decreaseWishlistQuantity: (id: string) =>
          updateWishlistQuantity(id, 'decrease'),
        updateCartQuantity,
      };
    },
    {
      name: 'store',
    },
  ),
);
