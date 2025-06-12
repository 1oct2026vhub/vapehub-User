'use client'

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { CART_GET_PAYLOAD, CART_RESPONSE_DATA, CartItem, UnAvailableItem } from '../config/cart.config';
import { addToCart, bulkAddToCart, getCartItems, removeFromCart, updateCartItem, checkStockValidation, applyCoupon } from '../server.actions';
import { getCookie, setCookie, deleteCookie } from 'cookies-next';
import { ServerActionStatus, DEFAULT_CURRENCY_SYMBOL } from '../config/app.config';
import { useSession } from 'next-auth/react';
import { ProductImage, ProductVariant } from '../config/product.config';
import { toast } from 'sonner';

interface CouponDiscount {
  value: number;
  isApplied: boolean;
  code: string | null;
  message: string | null;
  discountValue: string;
}
interface CartContextType {
  cartItems: CartItem[];
  isLoading: boolean;
  addItemToCart: (productId: number, variantId: number, quantity: number, data: ProductVariant, productName: string) => Promise<void>;
  updateItemQuantity: (cartId: number, quantity: number,productName: string) => Promise<void>;
  removeItem: (cartId: number) => Promise<void>;
  cartTotal: number;
  itemCount: number;
  syncCookieCart: () => Promise<void>;
  error: string | null;
  bulkAddItems: (items: { product_id: number; variant_id: number; quantity: number }[]) => Promise<void>;
  fetchCartItems: () => Promise<void>;
  clearCart: () => void;
  couponDiscount: CouponDiscount;
  setCouponDiscount: (discount: CouponDiscount) => void;
  checkoutStockValidation: () => Promise<boolean>;
  stockValidationErrors: Array<{ itemId: number; message: string; isOutOfStock: boolean }>;
  stockValidationLoading: boolean;
  isRemoveCoupon: boolean;
  setIsRemoveCoupon: (isRemoveCoupon: boolean) => void;
  validateCartItems: () => Promise<UnAvailableItem[]>;
  unAvailableItems: UnAvailableItem[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_COOKIE_NAME = 'guest_cart';

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stockValidationLoading, setStockValidationLoading] = useState(false);
  const { status, data: session } = useSession();
  const prevSessionRef = useRef(session);
  const [stockValidationErrors, setStockValidationErrors] = useState<Array<{ itemId: number; message: string; isOutOfStock: boolean }>>([]);
  const isAuthenticated = status === 'authenticated';
  const [hasAttemptedSync, setHasAttemptedSync] = useState(false);
  const [cartTotal, setCartTotal] = useState<number>(0);
  const [unAvailableItems, setUnAvailableItems] = useState<UnAvailableItem[]>([]);
  const [couponDiscount, setCouponDiscount] = useState<CouponDiscount>({
    value: 0,
    isApplied: false,
    code: null,
    message: null,
    discountValue: ''
  });
  const [isRemoveCoupon, setIsRemoveCoupon] = useState<boolean>(false);
  const [itemCount, setItemCount] = useState<number>(0);
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
          const cartData = response.data;
          const cartItems: CartItem[] = cartData.map(bindCartItem);
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
    const attributesName = item.variant.variantAttributes.map(attr => attr.term.name).join(', ');
    return {
      id: item.id,
      product_id: item.product_id,
      product_slug: item.product.slug,
      name: attributesName ? `${item.product.name} - ${attributesName}` : item.product.name,
      price: item.variant.price || '0',
      discount_price: item.variant.discount_price || '0',
      variant_id: item.variant_id,
      stock: item.variant.stock_status === 'in_stock' ? item.variant.stock : 0,
      slug: item.product.slug,
      description: item.variant.description,
      ProductImages: item.variant.variantImages?.[0]?.image_url || getPrimaryProductImage(item.product.ProductImages),
      quantity: item.quantity
    };
  };
  const getPrimaryProductImage = (item: ProductImage[]): string => {
    return item.find(image => image.is_primary)?.image_url || item[0]?.image_url;
  }
  const createGuestCartItem = (productId: number, variantId: number, quantity: number, data: ProductVariant, productName: string): CartItem => {
    const id = Math.random();
    return {
      id: id,
      product_id: productId,
      product_slug: data.slug,
      name: productName,
      price: data.price,
      discount_price: data.discount_price,
      variant_id: variantId,
      stock: data.stock_status === 'in_stock' ? data.stock : 0,
      slug: data.slug,
      description: "",
      ProductImages: data.primary_image?.url || "",
      quantity: quantity
    };
  };

  const event = ({ action, category, label, value }: { action: string, category: string, label: string, value: string }) => {
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
      });
  };

  const cartAnalytics = ({ action, category, label, value }: { action: string, category: string, label: string, value: string }) => {
    try {
      if (process.env.NODE_ENV === 'production') {
        event({ action, category, label, value });
      }
    } catch (error) {
      console.error('Error adding item to cart:', error);
    }

  }


  const addItemToCart = async (productId: number, variantId: number, quantity: number, data: ProductVariant, productName: string) => {
    setIsLoading(true);
    try {
      // Check if the product with the same product ID and variant ID already exists in the cart
      const existingItem = cartItems.find(item =>
        item.product_id === productId && item.variant_id === variantId
      );

      // Check if there's enough stock available
      // const stockAvailable = data.stock_status === 'in_stock' ? data.stock : 0;
      // const requestedQuantity = existingItem ? existingItem.quantity + quantity : quantity;

      // if (requestedQuantity > stockAvailable) {
      //   toast.error(`Only ${stockAvailable} items available in stock`);
      //   setIsLoading(false);
      //   return;
      // }

      if (existingItem) {
        // If the item exists, update its quantity instead of adding a duplicate
        const newQuantity = existingItem.quantity + quantity;
        await updateItemQuantity(existingItem.id, newQuantity,productName);
        // toast.success(`${productName} quantity updated in cart`);
        return;
      }

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
    const actionEvent = { action: 'add_to_cart', category: 'ecommerce', label: 'Item added to cart', value: productName }
    cartAnalytics(actionEvent);
  };

  const updateItemQuantity = async (cartId: number, quantity: number,productName: string) => {

    const existingItem: CartItem | undefined = cartItems.find(item => item.id === cartId);

    if (!existingItem) {
      // toast.error("Product not found in cart")
      return;
    }
    setIsLoading(true);
    try {
      if (isAuthenticated) {
        const response = await updateCartItem(cartId, quantity);
        console.log("responsecartupdate", response);
        
        if (response.status === ServerActionStatus.SUCCESS) {
          await loadCartItems();
          toast.success(`${productName} quantity updated in cart`);
          // toast.success('Cart updated successfully');
        }
          if (response.status === 'ERROR') {
            toast.error(response.message);
          }
      } else {
        // Handle as guest cart
        const updatedCart = cartItems.map(item =>
          item.id === cartId ? { ...item, quantity } : item
        );
        setCartItems(updatedCart);
        setCookie(CART_COOKIE_NAME, JSON.stringify(updatedCart));
        calculateTotals(updatedCart);
        // toast.success('Cart updated successfully');
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

  const checkoutStockValidation = async () => {
    if (isAuthenticated) {
      setStockValidationLoading(true);
      const response = await checkStockValidation();
      if (response.status === ServerActionStatus.ERROR) {
        toast.error(response.message);
        setStockValidationErrors([]);
        setStockValidationLoading(false);
        return false;
      }
      const stockValidationErrors = response.data.filter(data => data.isOutOfStock);

      setStockValidationErrors(stockValidationErrors);
      if (stockValidationErrors.length > 0) {
        const errorMessages = stockValidationErrors.map(error => error.message);
        toast.error(errorMessages.join('\n'));
        setStockValidationLoading(false);
        return false;
      }
      setStockValidationLoading(false);
      return true;
    }
    return true;
  }
 
  const validateCartItems = async () => {
    const response = await getCartItems();
    if (response.status === ServerActionStatus.SUCCESS) {
      const cartData = response.data.filter(item => (item.product.deletedAt || item.variant.deleted_at));
      const unAvailableItems: UnAvailableItem[] = cartData.map(item => ({
        id: item.id,
        name: item.product.name,
        price: item.variant.price, 
        quantity: item.quantity,       
        ProductImages: item.variant.variantImages?.[0]?.image_url || getPrimaryProductImage(item.product.ProductImages),
        isOutOfStock: item.variant.stock_status === 'out_of_stock' || item.variant.stock === 0,
        isInsufficientStock: item.variant.stock_status === 'in_stock' && item.variant.stock < item.quantity,
        isDeleted: (item.product.deletedAt || item.variant.deleted_at) ? true : false,
        errorMessage: item.variant.stock_status === 'out_of_stock' ? 'This item is out of stock' : item.variant.stock_status === 'in_stock' && item.variant.stock < item.quantity ? 'This item has insufficient stock' : item.product.deletedAt || item.variant.deleted_at ? 'This item is no longer available' : null
     }));
      setUnAvailableItems(unAvailableItems);
      return unAvailableItems;
    }
    setUnAvailableItems([]);
    return [];
    
  }
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
        const cartData = response.data
        const cartItems: CartItem[] = cartData.map(bindCartItem);
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

  const clearCart = useCallback(() => {
    setCartItems([]);
    setCartTotal(0);
    setItemCount(0);
    setCouponDiscount({
      value: 0,
      isApplied: false,
      code: null,
      message: null,
      discountValue: ''
    });
    deleteCookie('couponDiscount');
  }, []);

  useEffect(() => {
    if (prevSessionRef.current?.user?.id !== session?.user?.id) {
      clearCart();
    }
    prevSessionRef.current = session;
  }, [session, clearCart]);

  // Revalidate coupon when cartTotal or itemCount changes
  useEffect(() => {
    const revalidate = async () => {
      if (couponDiscount.code) {
        const response = await applyCoupon({
          couponCode: couponDiscount.code,
          shippingMethodId: 0, // Adjust if you use shipping method
        });

        if (response.status === ServerActionStatus.SUCCESS && response.data && response.data.referral_value != null) {
          setCouponDiscount({
            value: cartTotal - response.data.total,
            isApplied: true,
            code: couponDiscount.code,
            message: response.data.referral_value_type === "percentage"
              ? `Extra ${response.data.referral_value}% off`
              : `Extra ${DEFAULT_CURRENCY_SYMBOL}${response.data.referral_value} off`,
            discountValue: (cartTotal - response.data.total).toFixed(2),
          });
        } else {
          // Only update state if the coupon was previously applied to avoid loops
          if (couponDiscount.isApplied) {
            toast.info("Applied coupon was removed as cart conditions are no longer met.");
            setCouponDiscount({
              value: 0,
              isApplied: false,
              code: couponDiscount.code,
              message: null,
              discountValue: ''
            });
          }
        }
      }
    };

    if (!isLoading) {
      revalidate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartTotal, itemCount, isLoading, couponDiscount.code, couponDiscount.isApplied]);

  // Restore couponDiscount from cookie on mount
  useEffect(() => {
    const storedCoupon = getCookie('couponDiscount');
    if (storedCoupon) {
      try {
        const parsed = JSON.parse(storedCoupon as string);
        if (parsed && typeof parsed === 'object' && parsed.code) {
          setCouponDiscount(parsed);
        }
      } catch {}
    }
  }, []);

  // Persist couponDiscount to cookie whenever it changes
  useEffect(() => {
    if (couponDiscount && couponDiscount.code) {
      setCookie('couponDiscount', JSON.stringify(couponDiscount));
    } else {
      deleteCookie('couponDiscount');
    }
  }, [couponDiscount]);

  const value = {
    cartItems,
    isLoading,
    addItemToCart,
    updateItemQuantity,
    removeItem,
    cartTotal,
    itemCount,
    syncCookieCart,
    error,
    bulkAddItems,
    fetchCartItems,
    clearCart,
    couponDiscount,
    setCouponDiscount,
    checkoutStockValidation,
    stockValidationErrors,
    stockValidationLoading,
    isRemoveCoupon,
    setIsRemoveCoupon,
    validateCartItems,
    unAvailableItems
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