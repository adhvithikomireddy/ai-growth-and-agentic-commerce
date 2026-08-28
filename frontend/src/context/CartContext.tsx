import React, { createContext, useContext, useState, useEffect } from "react";
import { Cart, CartItem } from "../types/index.js";
import { api } from "../api/client.js";
import { useAuth } from "./AuthContext.js";

interface CartContextType {
  cart: Cart | null;
  itemCount: number;
  loading: boolean;
  addToCart: (productId: string, quantity?: number, discountPercent?: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  applyDiscount: (productId: string, discountPercent: number, offerToken?: string) => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType>({
  cart: null,
  itemCount: 0,
  loading: false,
  addToCart: async () => {},
  updateQuantity: async () => {},
  removeFromCart: async () => {},
  applyDiscount: async () => {},
  refreshCart: async () => {},
});

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const refreshCart = async () => {
    if (!user) {
      setCart(null);
      return;
    }
    try {
      setLoading(true);
      const data = await api.getCart();
      setCart(data);
    } catch {
      // Cart fetch might fail if not logged in
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      refreshCart();
    } else {
      setCart(null);
    }
  }, [user]);

  const addToCart = async (productId: string, quantity: number = 1, discountPercent: number = 0) => {
    await api.addToCart(productId, quantity, discountPercent);
    await refreshCart();
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    await api.updateCartItem(productId, quantity);
    await refreshCart();
  };

  const removeFromCart = async (productId: string) => {
    await api.removeCartItem(productId);
    await refreshCart();
  };

  const applyDiscount = async (productId: string, discountPercent: number, offerToken?: string) => {
    await api.applyOffer(productId, discountPercent, offerToken);
    await refreshCart();
  };

  const itemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        applyDiscount,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
