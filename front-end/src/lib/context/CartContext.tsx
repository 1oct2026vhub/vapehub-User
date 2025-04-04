import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { CART_GET_PAYLOAD, CART_RESPONSE_DATA, GuestCartItem } from '../config/cart.config';
import { addToCart, bulkAddToCart, getCartItems, removeFromCart, updateCartItem } from '../server.actions';
import { getCookie, setCookie } from 'cookies-next';
import { ServerActionStatus } from '../config/app.config';
import { useSession } from 'next-auth/react';
import { ProductVariant } from '../config/product.config';
import { toast } from 'sonner';

interface CartContextType {
  cartItems: CART_RESPONSE_DATA[];
  isLoading: boolean;
  addItemToCart: (productId: number, variantId: number, quantity: number, data: ProductVariant, productName: string) => Promise<void>;
  updateItemQuantity: (productId: number, quantity: number) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
  cartTotal: number;
  itemCount: number;
  syncCookieCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_COOKIE_NAME = 'guest_cart';
 
export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartItems, setCartItems] = useState<CART_RESPONSE_DATA[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const [hasAttemptedSync, setHasAttemptedSync] = useState(false);

  // Calculate cart totals
  const cartTotal:number = cartItems.reduce((sum, item) =>
    sum + (Number(item.product?.price || 0) * item.quantity), 0);
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const loadCartItems = useCallback(async () => {
    setIsLoading(true);
    try {
      if (isAuthenticated) {
        const response = await getCartItems();
        if (response.status === ServerActionStatus.SUCCESS) {
          setCartItems(response.data);
        }
      } else {
        // Load from cookie for guest users
        const cookieCart = getCookie(CART_COOKIE_NAME);
        if (cookieCart) {
          setCartItems(JSON.parse(cookieCart as string));
        }
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      // Load from cookie as fallback
      const cookieCart = getCookie(CART_COOKIE_NAME);
      if (cookieCart) {
        setCartItems(JSON.parse(cookieCart as string));
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Load cart items on mount and when auth status changes
  useEffect(() => {
    loadCartItems();
  }, [loadCartItems]);

  const createGuestCartItem = (productId: number, variantId: number, quantity: number, data: ProductVariant, productName: string): GuestCartItem => {
    
    return {
      product_id: productId,
      variant_id: variantId,
      quantity,
      flavor_id: null,
      product: {
        id: productId,
        name: productName,
        price: data.price,
        variants: {
          id: data.id,
          product_id: productId,
          slug: data.slug,
          price: data.price,
          discount_price: data.discount_price,
          description: "",
          stock: data.stock,
          status: data.status,
          variantImages: [data.primary_image],
        },
        ProductImages: [data.primary_image],
        slug: data.slug,
        description: "",
        stock_quantity: data.stock,
        discount_price: data.discount_price
      }
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
        const updatedCart = [...cartItems, newItem as unknown as CART_RESPONSE_DATA];
        setCartItems(updatedCart);
        setCookie(CART_COOKIE_NAME, JSON.stringify(updatedCart));
        toast.success(`${productName} added to cart successfully`);
      }
    } catch (error) {
      console.error('Error adding item to cart:', error);
      toast.error('Failed to add item to cart. Please try again.');
      // Handle as guest cart as fallback
      const newItem = createGuestCartItem(productId, variantId, quantity, data, productName);
      const updatedCart = [...cartItems, newItem as unknown as CART_RESPONSE_DATA];
      setCartItems(updatedCart);
      setCookie(CART_COOKIE_NAME, JSON.stringify(updatedCart));
    } finally {
      setIsLoading(false);
    }
  };

  const updateItemQuantity = async (productId: number, quantity: number) => {

    const existingItem = cartItems.find(item => item.product_id === productId);
    if (!existingItem) {
      // toast.error("Product not found in cart")
      return;
    }
    setIsLoading(true);
    try {
      if (isAuthenticated) {
        const response = await updateCartItem(productId, quantity);
        if (response.status === ServerActionStatus.SUCCESS) {
          await loadCartItems();
          toast.success('Cart updated successfully');
        }
      } else {
        // Handle as guest cart
        const updatedCart = cartItems.map(item =>
          item.product_id === productId ? { ...item, quantity } : item
        );
        setCartItems(updatedCart);
        setCookie(CART_COOKIE_NAME, JSON.stringify(updatedCart));
        toast.success('Cart updated successfully');

      }
    } catch (error) {
      console.error('Error updating cart item:', error);
      toast.error('Failed to update cart. Please try again.');
      // Handle as guest cart as fallback
      const updatedCart = cartItems.map(item =>
        item.product_id === productId ? { ...item, quantity } : item
      );
      setCartItems(updatedCart);
      setCookie(CART_COOKIE_NAME, JSON.stringify(updatedCart));
    } finally {
      setIsLoading(false);
    }
  };

  const removeItem = async (productId: number) => {
    setIsLoading(true);
    const itemToRemove = cartItems.find(item => item.product_id === productId);
    try {
      if (isAuthenticated) {
        const response = await removeFromCart(productId);
        if (response.status === ServerActionStatus.SUCCESS) {
          await loadCartItems();
          toast.error(`${itemToRemove?.product?.name || 'Item'} removed from cart`);
        }
      } else {
        // Handle as guest cart
        const updatedCart = cartItems.filter(item => item.product_id !== productId);
        setCartItems(updatedCart);
        setCookie(CART_COOKIE_NAME, JSON.stringify(updatedCart));
        toast.error(`${itemToRemove?.product?.name || 'Item'} removed from cart`);
      }
    } catch (error) {
      console.error('Error removing item from cart:', error);
      toast.error('Failed to remove item from cart. Please try again.');
      // Handle as guest cart as fallback
      const updatedCart = cartItems.filter(item => item.product_id !== productId);
      setCartItems(updatedCart);
      setCookie(CART_COOKIE_NAME, JSON.stringify(updatedCart));
    } finally {
      setIsLoading(false);
    }
  };

  const syncCookieCart = async () => { 

    if (!isAuthenticated) return; // Only sync if user is authenticated

    const cookieCart = getCookie(CART_COOKIE_NAME);
    if (cookieCart) {
      const items: CART_GET_PAYLOAD[] = JSON.parse(cookieCart as string); 
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

  return (
    <CartContext.Provider value={{
      cartItems,
      isLoading,
      addItemToCart,
      updateItemQuantity,
      removeItem,
      cartTotal,
      itemCount,
      syncCookieCart
    }}>
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