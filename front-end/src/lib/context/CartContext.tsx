'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { CART_GET_PAYLOAD, CART_RESPONSE_DATA, CartItem } from '../config/cart.config';
import { addToCart, bulkAddToCart, getCartItems, removeFromCart, updateCartItem } from '../server.actions';
import { getCookie, setCookie } from 'cookies-next';
import { ServerActionStatus } from '../config/app.config';
import { useSession } from 'next-auth/react';
import { ProductVariant } from '../config/product.config';
import { toast } from 'sonner';

interface CartContextType {
  cartItems: CartItem[];
  isLoading: boolean;
  addItemToCart: (productId: number, variantId: number, quantity: number, data: ProductVariant, productName: string) => Promise<void>;
  updateItemQuantity: (cartId: number, quantity: number) => Promise<void>;
  removeItem: (cartId: number) => Promise<void>;
  cartTotal: number;
  itemCount: number;
  syncCookieCart: () => Promise<void>;
  cartCouponCode: string | null;
  error: string | null; 
  bulkAddItems: (items: { product_id: number; variant_id: number; quantity: number }[]) => Promise<void>;
  fetchCartItems: () => Promise<void>;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_COOKIE_NAME = 'guest_cart';
 
export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const [hasAttemptedSync, setHasAttemptedSync] = useState(false);
  const [cartTotal, setCartTotal] = useState<number>(0);
  const [itemCount, setItemCount] = useState<number>(0);
  const [cartCouponCode, setCartCouponCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Calculate cart totals
  const calculateTotals = (items: CartItem[]) => {
    const total = items.reduce((sum, item) => {
      const itemTotal = parseFloat(item.price) * item.quantity;
      return sum + itemTotal;
    }, 0);
    setCartTotal(total);
    setItemCount(items.length);
  };

  const loadCartItems = useCallback(async () => {
    setIsLoading(true);
    try {
      if (isAuthenticated) {
        const response = await getCartItems();
        if (response.status === ServerActionStatus.SUCCESS) {
          const cartItems:CartItem[] = response.data.map(bindCartItem);
          setCartItems(cartItems); 
          calculateTotals(cartItems);
        }
      } else {
        // Load from cookie for guest users
        const cookieCart = getCookie(CART_COOKIE_NAME);
        if (cookieCart) {
          setCartItems(JSON.parse(cookieCart as string));
          calculateTotals(JSON.parse(cookieCart as string));
        }
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      // Load from cookie as fallback
      const cookieCart = getCookie(CART_COOKIE_NAME); 
      if (cookieCart) {
        setCartItems(JSON.parse(cookieCart as string));
        calculateTotals(JSON.parse(cookieCart as string));
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Load cart items on mount and when auth status changes
  useEffect(() => {
    loadCartItems();
  }, [loadCartItems]);

  const bindCartItem = (item: CART_RESPONSE_DATA): CartItem => {
    return {
      id: item.id,
      product_id: item.product_id,
      name: item.product.name,
      price: item.variant.price || '0',
      discount_price: item.variant.discount_price || '0',
      variant_id: item.variant_id,
      stock: item.variant.stock,
      slug: item.product.slug,
      description: item.variant.description,
      ProductImages: item.variant.variantImages[0].image_url || item.product.ProductImages?.[0]?.image_url,
      quantity: item.quantity
    };
  };
  const createGuestCartItem = (productId: number, variantId: number, quantity: number, data: ProductVariant, productName: string): CartItem => {
    const id = Math.random();
    return {
       id: id,
       product_id: productId,
       name: productName,
       price: data.price,
       discount_price: data.discount_price,
       variant_id: variantId,
       stock: data.stock,
       slug: data.slug,
       description: "",
       ProductImages: data.primary_image?.url || "",
       quantity: quantity
    };
  };

  const addItemToCart = async (productId: number, variantId: number, quantity: number, data: ProductVariant, productName: string) => {
    setIsLoading(true);
    try {
      if (isAuthenticated) {
        const response = await addToCart(productId, variantId, quantity);
        if (response.status === ServerActionStatus.SUCCESS) {
          await loadCartItems();
          toast.success(`${productName} added to cart successfully`);
        }
      } else {
        // Handle as guest cart
        const newItem = createGuestCartItem(productId, variantId, quantity, data, productName);
        const updatedCart = [...cartItems, newItem];
        setCartItems(updatedCart);
        setCookie(CART_COOKIE_NAME, JSON.stringify(updatedCart));
        calculateTotals(updatedCart);
        toast.success(`${productName} added to cart successfully`);
      }
    } catch (error) {
      console.error('Error adding item to cart:', error);
      toast.error('Failed to add item to cart. Please try again.');
      // Handle as guest cart as fallback
      const newItem = createGuestCartItem(productId, variantId, quantity, data, productName);
      const updatedCart = [...cartItems, newItem];
      setCartItems(updatedCart);
      setCookie(CART_COOKIE_NAME, JSON.stringify(updatedCart));
      calculateTotals(updatedCart);
    } finally {
      setIsLoading(false);
    }
  };

  const updateItemQuantity = async (cartId: number, quantity: number) => {
    
    const existingItem:CartItem | undefined = cartItems.find(item => item.id === cartId);
    
    if (!existingItem) {
      // toast.error("Product not found in cart")
      return;
    }
    setIsLoading(true);
    try {
      if (isAuthenticated) {
        const response = await updateCartItem(cartId, quantity);
        if (response.status === ServerActionStatus.SUCCESS) {
          await loadCartItems();
          toast.success('Cart updated successfully');
        }
      } else {
        // Handle as guest cart
        const updatedCart = cartItems.map(item =>
          item.id === cartId ? { ...item, quantity } : item
        );
        setCartItems(updatedCart);
        setCookie(CART_COOKIE_NAME, JSON.stringify(updatedCart));
        calculateTotals(updatedCart);
        toast.success('Cart updated successfully');
      }
    } catch (error) {
      console.error('Error updating cart item:', error);
      toast.error('Failed to update cart. Please try again.');
      // Handle as guest cart as fallback
      const updatedCart = cartItems.map(item =>
        item.id === cartId ? { ...item, quantity } : item
      );
      setCartItems(updatedCart);
      setCookie(CART_COOKIE_NAME, JSON.stringify(updatedCart));
      calculateTotals(updatedCart);
    } finally {
      setIsLoading(false);
    }
  };

  const removeItem = async (cartId: number) => {
    setIsLoading(true);
    const itemToRemove = cartItems.find(item => item.id === cartId);
    if (!itemToRemove) {
      return;
    }
    try {
      if (isAuthenticated) {
        const response = await removeFromCart(cartId);
        if (response.status === ServerActionStatus.SUCCESS) {
          await loadCartItems();
          toast.error(`${itemToRemove?.name || 'Item'} removed from cart`);
        }
      } else {
        // Handle as guest cart
        const updatedCart = cartItems.filter(item => item.id !== cartId);
        setCartItems(updatedCart);
        setCookie(CART_COOKIE_NAME, JSON.stringify(updatedCart));
        calculateTotals(updatedCart);
        toast.error(`${itemToRemove?.name || 'Item'} removed from cart`);
      }
    } catch (error) {
      console.error('Error removing item from cart:', error);
      toast.error('Failed to remove item from cart. Please try again.');
      // Handle as guest cart as fallback
      const updatedCart = cartItems.filter(item => item.id !== cartId);
      setCartItems(updatedCart);
      setCookie(CART_COOKIE_NAME, JSON.stringify(updatedCart));
      calculateTotals(updatedCart);
    } finally {
      setIsLoading(false);
    }
  };

  const syncCookieCart = async () => { 

    if (!isAuthenticated) return; // Only sync if user is authenticated

    const cookieCart = getCookie(CART_COOKIE_NAME);
    if (cookieCart) {
      const items: CartItem[] = JSON.parse(cookieCart as string); 
      const cartItems = items.map(item => ({
        product_id: item.product_id,
        variant_id: item.variant_id,
        quantity: item.quantity
      })); 
      try {
        const response = await bulkAddToCart(cartItems);
        
        if (response.status === ServerActionStatus.SUCCESS) {
          setCookie(CART_COOKIE_NAME, ''); // Clear cookie cart after sync
          await loadCartItems();
        } else {
          toast.error(response.message);
        }
      } catch (error) {
        console.error('Failed to sync cart:', error);
      }
    }
  };

  // Add new useEffect to handle automatic cart sync on authentication
  useEffect(() => {
    const handleAuthChange = async () => { 
      if (isAuthenticated && !hasAttemptedSync) {
        setHasAttemptedSync(true);
        const cookieCart = getCookie(CART_COOKIE_NAME);         
        if (cookieCart) {
          const items: CART_GET_PAYLOAD[] = JSON.parse(cookieCart as string);
          if (items.length > 0) {
            await syncCookieCart();
          }
        }
      }
    };

    handleAuthChange();
  }, [isAuthenticated])

  const fetchCartItems = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getCartItems();
      
      if (response.status === ServerActionStatus.SUCCESS) {
        const cartItems:CartItem[] = response.data.map(bindCartItem);
        setCartItems(cartItems);
        calculateTotals(cartItems);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('An error occurred while fetching cart items');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
 
  const bulkAddItems = async (items: { product_id: number; variant_id: number; quantity: number }[]) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await bulkAddToCart(items);
      
      if (response.status === ServerActionStatus.SUCCESS) {
        await fetchCartItems();
        toast.success('Items added to cart');
      } else {
        setError(response.message);
        toast.error(response.message);
      }
    } catch (err) {
      setError('An error occurred while adding items to cart');
      toast.error('An error occurred while adding items to cart');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = () => {
    setCartItems([]);
    setCartTotal(0);
    setItemCount(0);
    setCartCouponCode(null);
    calculateTotals(cartItems);
  };

  const value = {
    cartItems,
    isLoading,
    addItemToCart,
    updateItemQuantity,
    removeItem,
    cartTotal,
    itemCount,
    syncCookieCart,
    cartCouponCode,
    error, 
    bulkAddItems,
    fetchCartItems,
    clearCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};