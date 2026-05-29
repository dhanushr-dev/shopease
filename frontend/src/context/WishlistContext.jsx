import { createContext, useState, useEffect, useContext } from 'react';
import { wishlistAPI } from '../services/api';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';
import toast from 'react-hot-toast';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const { fetchCart } = useCart();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchWishlist();
    } else {
      setWishlist([]);
    }
  }, [user]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await wishlistAPI.get();
      setWishlist(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch wishlist', err);
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (productId) => {
    if (!user) {
      toast.error('Please login to add to wishlist');
      return false;
    }
    try {
      const res = await wishlistAPI.add(productId);
      toast.success('Added to wishlist');
      setWishlist((prev) => [res.data.data, ...prev]);
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to wishlist');
      return false;
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      await wishlistAPI.remove(productId);
      toast.success('Removed from wishlist');
      setWishlist((prev) => prev.filter((item) => item.productId !== productId));
      return true;
    } catch (err) {
      toast.error('Failed to remove from wishlist');
      return false;
    }
  };

  const toggleWishlist = async (productId) => {
    const isInList = wishlist.some((item) => item.productId === productId);
    if (isInList) {
      return await removeFromWishlist(productId);
    } else {
      return await addToWishlist(productId);
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some((item) => item.productId === productId);
  };

  const moveToCart = async (productId) => {
    try {
      await wishlistAPI.moveToCart(productId);
      toast.success('Product moved to cart successfully!');
      setWishlist((prev) => prev.filter((item) => item.productId !== productId));
      await fetchCart();
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to move to cart');
      return false;
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        loading,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        moveToCart,
        fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};
