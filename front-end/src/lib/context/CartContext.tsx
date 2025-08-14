'use client'

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { CART_GET_PAYLOAD, CART_RESPONSE_DATA, CartItem, UnAvailableItem } from '../config/cart.config';
import { addToCart, bulkAddToCart, getCartItems, removeFromCart, updateCartItem, checkStockValidation, applyCoupon, getLoyaltyPointsRedemption } from '../server.actions';
import { getCookie, setCookie, deleteCookie } from 'cookies-next';
import { ServerActionStatus, DEFAULT_CURRENCY_SYMBOL } from '../config/app.config';
import { useSession } from 'next-auth/react';
import { Product, ProductImage, ProductVariant } from '../config/product.config';
import { toast } from 'sonner';
import { LoyaltyPointsRedemptionResponse } from '../config/loyalty-points.config';

interface CouponDiscount {
  value: number;
  isApplied: boolean;
  code: string | null;
  message: string | null;
  discountValue: string;
  mailSubscriptionData?: {
    discount_amount: number;
    discount_type: string;
    isDiscountUsed: boolean;
  };
}

interface LoyaltyRedemption {
  isRedeemed: boolean;
  pointsData: LoyaltyPointsRedemptionResponse | null;
  discountValue: number;
  message: string | null;
}
interface CartContextType {
  cartItems: CartItem[];
  isLoading: boolean;
  addItemToCart: (product: Product, variantId: number, quantity: number, data: ProductVariant, productName: string, variantSlug: string, variantAttributes: { attribute_id: number; term_slug: string }[]) => Promise<void>;
  updateItemQuantity: (cartId: number, quantity: number,productName: string) => Promise<void>;
  removeItem: (cartId: number) => Promise<void>;
  cartTotal: number;
  cartSubtotal: number;
  cartDiscount: number;
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
  loyaltyRedemption: LoyaltyRedemption;
  setLoyaltyRedemption: React.Dispatch<React.SetStateAction<LoyaltyRedemption>>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_COOKIE_NAME = 'guest_cart';
const LOYALTY_COOKIE_NAME = 'loyalty_redemption';

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
  const [cartSubtotal, setCartSubtotal] = useState<number>(0);
  const [cartDiscount, setCartDiscount] = useState<number>(0);
  const [unAvailableItems, setUnAvailableItems] = useState<UnAvailableItem[]>([]);
  const [couponDiscount, setCouponDiscount] = useState<CouponDiscount>({
    value: 0,
    isApplied: false,
    code: null,
    message: null,
    discountValue: ''
  });
  const [loyaltyRedemption, setLoyaltyRedemption] = useState<LoyaltyRedemption>({
    isRedeemed: false,
    pointsData: null,
    discountValue: 0,
    message: null,
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
    setCartSubtotal(total);
    setCartDiscount(0);
    setItemCount(items.length);
  };

  const loadCartItems = useCallback(async () => {
    setIsLoading(true);
    try {
      if (isAuthenticated) {
        const response = await getCartItems();
        console.log("getCartItemsresponse", response);
        if (response.status === ServerActionStatus.SUCCESS) {
          const cartData = response.data;
          const cartItems: CartItem[] = cartData.items.map(bindCartItem);
          setCartItems(cartItems);
          if (cartData.summary) {
            setCartTotal(cartData.summary.total);
            setCartSubtotal(cartData.summary.subtotal);
            setCartDiscount(cartData.summary.total_discount);
            setItemCount(cartData.items.length);
          } else {
            calculateTotals(cartItems);
          }
        }
      } else {
        // Load from cookie for guest users
        const cookieCart = getCookie(CART_COOKIE_NAME);
        if (cookieCart) {
          const parsedCart = JSON.parse(cookieCart as string);
          setCartItems(parsedCart);
          calculateTotals(parsedCart);
        }
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      // Load from cookie as fallback
      const cookieCart = getCookie(CART_COOKIE_NAME);
      if (cookieCart) {
        const parsedCart = JSON.parse(cookieCart as string);
        setCartItems(parsedCart);
        calculateTotals(parsedCart);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);
  
  useEffect(() => {
    const fetchLoyaltyPoints = async () => {
        if (isAuthenticated) {
            const response = await getLoyaltyPointsRedemption();
            if (response.status === ServerActionStatus.SUCCESS) {
                setLoyaltyRedemption(prev => ({ ...prev, pointsData: response.data }));
            }
        }
    };
    fetchLoyaltyPoints();
  }, [isAuthenticated]);

  // Load cart items on mount and when auth status changes
  useEffect(() => {
    loadCartItems();
  }, [loadCartItems]);

  const bindCartItem = (item: CART_RESPONSE_DATA): CartItem => {
    const attributesName = item.variant.variantAttributes.map(attr => attr.term.name).join(', ');
    const variantSlug = item.variant.variantAttributes[0]?.term?.slug ?? '';
    return {
      id: item.id,
      product_id: item.product_id,
      product_slug: item.product.slug,
      name: attributesName ? `${item.product.name} - ${attributesName}` : item.product.name,
      price: item.variant.price || '0',
      discount_price: item.variant.discount_price || '0',
      variant_id: item.variant_id,
      stock: item.variant.stock_status === 'in_stock' ? item.variant.stock : 0,
      slug: variantSlug,
      description: item.variant.description,
      ProductImages: item.variant.variantImages?.[0]?.image_url || getPrimaryProductImage(item.product.ProductImages),
      quantity: item.quantity,
      subtotal: item.subtotal,
      total: item.total,
      applied_deals: item.applied_deals,
      show_deal_toast: item.show_deal_toast,
      deal_required_qty: item.deal_required_qty,
      deal_qty_needed: item.deal_qty_needed,
      deals: item.product.deals || [],
      variantAttributes: item.variant.variantAttributes.map(attr => ({ attribute_id: attr.attribute_id, term_slug: attr.term.slug }))
    };
  };
  const getPrimaryProductImage = (item: ProductImage[]): string => {
    return item?.find(image => image.is_primary)?.image_url || item?.[0]?.image_url || '';
  }
  const createGuestCartItem = (product: Product, variantId: number, quantity: number, data: ProductVariant, productName: string, variantSlug: string, variantAttributes: { attribute_id: number; term_slug: string }[]): CartItem => {
    const id = Math.random();
    return {
      id: id,
      product_id: product.id,
      product_slug: product.slug,
      name: productName,
      price: data.price,
      discount_price: data.discount_price,
      variant_id: variantId,
      stock: data.stock_status === 'in_stock' ? data.stock : 0,
      slug: variantSlug,
      description: "",
      ProductImages: data.primary_image?.url || data.all_images?.[0]?.url || getPrimaryProductImage(product.ProductImages),
      quantity: quantity,
      subtotal: Number(data.price) * quantity,
      total: Number(data.price) * quantity,
      applied_deals: [],
      show_deal_toast: false,
      deal_required_qty: null,
      deal_qty_needed: null,
      deals: [],
      variantAttributes: variantAttributes,
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


  const addItemToCart = async (product: Product, variantId: number, quantity: number, data: ProductVariant, productName: string, variantSlug: string, variantAttributes: { attribute_id: number; term_slug: string }[]) => {
    setIsLoading(true);
    const productId = product.id;
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
        const newItem = createGuestCartItem(product, variantId, quantity, data, productName, variantSlug, variantAttributes);
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
      const newItem = createGuestCartItem(product, variantId, quantity, data, productName, variantSlug, variantAttributes);
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
          // Update local state immediately instead of reloading from server
          const updatedCart = cartItems.filter(item => item.id !== cartId);
          setCartItems(updatedCart);
          calculateTotals(updatedCart);
          toast.error(`${itemToRemove?.name || 'Item'} removed from cart`);
          
          // Reset loyalty points if cart becomes empty
          if (updatedCart.length === 0) {
            setLoyaltyRedemption({
              isRedeemed: false,
              pointsData: loyaltyRedemption.pointsData,
              discountValue: 0,
              message: null,
            });
          }
        }
      } else {
        // Handle as guest cart
        const updatedCart = cartItems.filter(item => item.id !== cartId);
        setCartItems(updatedCart);
        setCookie(CART_COOKIE_NAME, JSON.stringify(updatedCart));
        calculateTotals(updatedCart);
        toast.error(`${itemToRemove?.name || 'Item'} removed from cart`);
        
        // Reset loyalty points if cart becomes empty
        if (updatedCart.length === 0) {
          setLoyaltyRedemption({
            isRedeemed: false,
            pointsData: loyaltyRedemption.pointsData,
            discountValue: 0,
            message: null,
          });
        }
      }
    } catch (error) {
      console.error('Error removing item from cart:', error);
      toast.error('Failed to remove item from cart. Please try again.');
      // Handle as guest cart as fallback
      const updatedCart = cartItems.filter(item => item.id !== cartId);
      setCartItems(updatedCart);
      setCookie(CART_COOKIE_NAME, JSON.stringify(updatedCart));
      calculateTotals(updatedCart);
      
      // Reset loyalty points if cart becomes empty
      if (updatedCart.length === 0) {
        setLoyaltyRedemption({
          isRedeemed: false,
          pointsData: loyaltyRedemption.pointsData,
          discountValue: 0,
          message: null,
        });
      }
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
      const cartData = response.data.items.filter(item => (item.product.deleted_at || item.variant.deleted_at));
      const unAvailableItems: UnAvailableItem[] = cartData.map(item => ({
        id: item.id,
        name: item.product.name,
        price: item.variant.price, 
        quantity: item.quantity,       
        ProductImages: item.variant.variantImages?.[0]?.image_url || getPrimaryProductImage(item.product.ProductImages),
        isOutOfStock: item.variant.stock_status === 'out_of_stock' || item.variant.stock === 0,
        isInsufficientStock: item.variant.stock_status === 'in_stock' && item.variant.stock < item.quantity,
        isDeleted: (item.product.deleted_at || item.variant.deleted_at) ? true : false,
        errorMessage: item.variant.stock_status === 'out_of_stock' ? 'This item is out of stock' : item.variant.stock_status === 'in_stock' && item.variant.stock < item.quantity ? 'This item has insufficient stock' : item.product.deleted_at || item.variant.deleted_at ? 'This item is no longer available' : null
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
        const cartData = response.data;
        const cartItems: CartItem[] = cartData.items.map(bindCartItem);
        setCartItems(cartItems);
        if (cartData.summary) {
          setCartTotal(cartData.summary.total);
          setCartSubtotal(cartData.summary.subtotal);
          setCartDiscount(cartData.summary.total_discount);
          setItemCount(cartData.items.length);
        } else {
          calculateTotals(cartItems);
        }
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
    setCartSubtotal(0);
    setCartDiscount(0);
    setItemCount(0);
    setCouponDiscount({
      value: 0,
      isApplied: false,
      code: null,
      message: null,
      discountValue: '',
      mailSubscriptionData: couponDiscount.mailSubscriptionData, // Preserve mailSubscriptionData
    });
    setLoyaltyRedemption({
      isRedeemed: false,
      pointsData: loyaltyRedemption.pointsData, // Preserve points data
      discountValue: 0,
      message: null,
    });
    deleteCookie('couponDiscount');
    deleteCookie(LOYALTY_COOKIE_NAME);
  }, [loyaltyRedemption.pointsData]);

  useEffect(() => {
    if (prevSessionRef.current?.user?.id && prevSessionRef.current.user.id !== session?.user?.id) {
      clearCart();
    }
    prevSessionRef.current = session;
  }, [session, clearCart]);

  // Clear coupon when cart is empty and not loading
  useEffect(() => {
    if (!isLoading && itemCount === 0) {
      setCouponDiscount({
        value: 0,
        isApplied: false,
        code: null,
        message: null,
        discountValue: '',
        mailSubscriptionData: couponDiscount.mailSubscriptionData, // Preserve mailSubscriptionData
      });
    }
  }, [itemCount, isLoading]);

  // Revalidate coupon when cartTotal or itemCount changes
  useEffect(() => {
    const revalidate = async () => {
      if (couponDiscount.code) {
        const response = await applyCoupon({
          couponCode: couponDiscount.code,
          shippingMethodId: 0, // Adjust if you use shipping method
        });
        console.log("Referraresponse",response);
        if (response.status === ServerActionStatus.SUCCESS && response.data && response.data.referral_value != null) {
          setCouponDiscount({
            value: cartTotal - response.data.total,
            isApplied: true,
            code: couponDiscount.code,
            message: response.data.coupon.discount_type === "percentage" ? `Extra ${response.data.coupon.discount_value}% off` : `Extra ${DEFAULT_CURRENCY_SYMBOL}${response.data.coupon.discount_value} off`,
            discountValue: (cartTotal - response.data.total).toFixed(2),
            mailSubscriptionData: couponDiscount.mailSubscriptionData, // Preserve mailSubscriptionData
          });
        } else {
          // Only update state if the coupon was previously applied to avoid loops
          if (couponDiscount.isApplied) {
            // toast.info("Applied coupon was removed as cart conditions are no longer met.");
            setCouponDiscount({
              value: 0,
              isApplied: false,
              code: couponDiscount.code,
              message: null,
              discountValue: '',
              mailSubscriptionData: couponDiscount.mailSubscriptionData, // Preserve mailSubscriptionData
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
    const storedLoyalty = getCookie(LOYALTY_COOKIE_NAME);
    if (storedLoyalty) {
        try {
            const parsed = JSON.parse(storedLoyalty as string);
            if (parsed && typeof parsed === 'object' && parsed.isRedeemed) {
                setLoyaltyRedemption(prev => ({ ...prev, ...parsed}));
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
    if (loyaltyRedemption && loyaltyRedemption.isRedeemed) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { pointsData, ...rest } = loyaltyRedemption;
        setCookie(LOYALTY_COOKIE_NAME, JSON.stringify(rest));
    } else {
        deleteCookie(LOYALTY_COOKIE_NAME);
    }
  }, [couponDiscount, loyaltyRedemption]);

  const value = {
    cartItems,
    isLoading,
    addItemToCart,
    updateItemQuantity,
    removeItem,
    cartTotal,
    cartSubtotal,
    cartDiscount,
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
    unAvailableItems,
    loyaltyRedemption,
    setLoyaltyRedemption,
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