import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext.jsx';
import { cartAPI } from '../services/api.js';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

/**
 * CartProvider manages shopping cart state globally.
 * Syncs with backend when user is authenticated,
 * falls back to localStorage for guest users.
 */
export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState({ items: [], totalAmount: 0, totalItems: 0 });
  const [loading, setLoading] = useState(false);

  // Fetch cart from backend when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      // Load guest cart from localStorage
      const guestCart = localStorage.getItem('shopease_guest_cart');
      if (guestCart) {
        try {
          setCart(JSON.parse(guestCart));
        } catch {
          setCart({ items: [], totalAmount: 0, totalItems: 0 });
        }
      }
    }
  }, [isAuthenticated]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await cartAPI.get();
      if (response.data.success) {
        setCart(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1, selectedVariant = null) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return false;
    }
    try {
      setLoading(true);
      const response = await cartAPI.addItem({ productId, quantity, selectedVariant });
      if (response.data.success) {
        setCart(response.data.data);
        toast.success('Added to cart!');
        return true;
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to add to cart';
      toast.error(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (itemId, quantity) => {
    try {
      setLoading(true);
      const response = await cartAPI.updateItem(itemId, { quantity });
      if (response.data.success) {
        setCart(response.data.data);
        toast.success('Cart updated');
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update cart';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      setLoading(true);
      const response = await cartAPI.removeItem(itemId);
      if (response.data.success) {
        setCart(response.data.data);
        toast.success('Item removed from cart');
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to remove item';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      await cartAPI.clear();
      setCart({ items: [], totalAmount: 0, totalItems: 0 });
      toast.success('Cart cleared');
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to clear cart';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    cart,
    loading,
    fetchCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    cartItemCount: cart.totalItems || 0,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

/**
 * Custom hook for accessing cart context.
 */
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export default CartContext;
