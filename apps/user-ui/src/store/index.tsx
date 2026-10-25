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

type Store = {
  cart: Product[];
  wishlist: Product[];
  wishList: Product[];
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
          const updated = [...get().wishlist, product];
          set({
            wishlist: updated,
            wishList: updated,
          });
        }
      };

      const removeFromWishlist = (
        id: string,
        user?: any,
        location?: any,
        deviceInfo?: any,
      ) => {
        const updated = get().wishlist.filter((item) => item.id !== id);
        set({
          wishlist: updated,
          wishList: updated,
        });
      };

      return {
        cart: [],
        wishlist: [],
        wishList: [],
        addToCart: (product, user, location, deviceInfo) => {
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
        },
        removeFromCart: (id, user, location, deviceInfo) => {
          set({
            cart: get().cart.filter((item) => item.id !== id),
          });
        },
        addToWishlist,
        addToWishList: addToWishlist,
        removeFromWishlist,
        removeFromWishList: removeFromWishlist,
      };
    },
    {
      name: 'store',
    },
  ),
);
