'use client'

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { CART_GET_PAYLOAD, CART_RESPONSE_DATA, CartItem, UnAvailableItem } from '../config/cart.config';
import { APPLY_GUEST_COUPON_PAYLOAD } from '../config/checkout.config';
import { addToCart, bulkAddToCart, getCartItems, removeFromCart, updateCartItem, checkStockValidation, applyCoupon, applyGuestCoupon, getLoyaltyPointsRedemption, calculateGuestDeals } from '../server.actions';
import { getCookie, setCookie, deleteCookie } from 'cookies-next';
import { ServerActionStatus, DEFAULT_CURRENCY_SYMBOL } from '../config/app.config';
import { getGuestCart, setGuestCart, removeGuestCart } from '../utils/storage';
import { useSession } from 'next-auth/react';
import { Product, ProductImage, ProductVariant } from '../config/product.config';
import { toast } from 'sonner';
import { LoyaltyPointsRedemptionResponse } from '../config/loyalty-points.config';
import { CouponResponse } from '../config/order.config';
import { roundCurrency } from '../utils';
import { parseApiMoney } from '../utils/checkout-order.utils';

interface CouponDiscount {
  value: number;
  isApplied: boolean;
  code: string | null;
  message: string | null;
  discountValue: string;
  discount_amount?: number; // Direct discount amount from API
  shippingCost?: number; // Shipping cost from API
  subTotal?: number; // Subtotal from API
  total?: number; // Total from API
  mailSubscriptionData?: {
    discount_amount: number;
    discount_type: string;
    isDiscountUsed: boolean;
  };
  mailSubscriptionDiscount?: number; // Mail subscription discount amount from API
}

export interface LoyaltyRedemption {
  isRedeemed: boolean;
  pointsData: LoyaltyPointsRedemptionResponse | null;
  discountValue: number;
  message: string | null;
  /** When `null`, omit `points_to_redeem` on the API so the server redeems the maximum allowed. */
  pointsToRedeem: number | null;
  /** Last apply-coupon `shippingCost` when loyalty is on; `null` = use catalog shipping from selected method. */
  applyCouponShippingCost: number | null;
  /** From apply-coupon when loyalty is on; used for place-order when priced shipping is non-zero. If apply-coupon shipping is £0, checkout uses the selected method (catalog free row). */
  applyCouponShippingMethodId: number | null;
  /** Last apply-coupon `mail_subscription_discount` when loyalty is on (coupon UI cleared but API still applies mail). */
  applyCouponMailSubscriptionDiscount: number | null;
}
export interface CartContextType {
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
  setShippingMethodIdForCoupon: (shippingMethodId: number) => void;
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
  const isApplyingCouponRef = useRef(false); // Track if coupon is being applied to prevent revalidation
  // Debounce coupon revalidation so rapid cart updates don't spam the coupon validation endpoint.
  const couponRevalidateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [stockValidationErrors, setStockValidationErrors] = useState<Array<{ itemId: number; message: string; isOutOfStock: boolean }>>([]);
  const isAuthenticated = status === 'authenticated';
  const [hasAttemptedSync, setHasAttemptedSync] = useState(false);
  // Store shipping method ID for coupon revalidation (set by CartTotal on checkout page)
  const [shippingMethodIdForCoupon, setShippingMethodIdForCoupon] = useState<number>(0);
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
    pointsToRedeem: null,
    applyCouponShippingCost: null,
    applyCouponShippingMethodId: null,
    applyCouponMailSubscriptionDiscount: null,
  });
  const [isRemoveCoupon, setIsRemoveCoupon] = useState<boolean>(false);
  const [itemCount, setItemCount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // Calculate cart totals
  const calculateTotals = useCallback((items: CartItem[]) => {
    const total = items.reduce((sum, item) => {
      // Use discount_price if available, otherwise use regular price
      const effectivePrice = item.discount_price && parseFloat(item.discount_price) > 0 
        ? parseFloat(item.discount_price) 
        : parseFloat(item.price);
      const itemTotal = effectivePrice * item.quantity;
      return sum + itemTotal;
    }, 0);
    const normalized = roundCurrency(total);
    setCartTotal(normalized);
    setCartSubtotal(normalized);
    setCartDiscount(0);
    setItemCount(items.length);
  }, []);

  // Calculate guest deals and update cart totals
  const calculateGuestDealsAndTotals = useCallback(async (items: CartItem[]) => {
    if (isAuthenticated || items.length === 0) {
      calculateTotals(items);
      return;
    }

    try {
      // Prepare cart items for API call
      const cartItemsForAPI = items.map(item => ({
        product_id: item.product_id,
        variant_id: item.variant_id,
        quantity: item.quantity
      }));

      const response = await calculateGuestDeals(cartItemsForAPI);
      
             if (response.status === ServerActionStatus.SUCCESS && response.data) {
         
         // Update cart items with deal information from API
         const updatedItems = items.map(item => {
           // Find matching item in API response by product_id and variant_id
           const apiItem = response.data.items?.find(apiItem => 
             apiItem.product_id === item.product_id && apiItem.variant_id === item.variant_id
           );
           
           if (apiItem) {
             return {
               ...item,
               // Update with API response data
               subtotal: apiItem.subtotal || (parseFloat(item.price) * item.quantity),
               total: apiItem.total || (parseFloat(item.price) * item.quantity),
               applied_deals: apiItem.applied_deals || [],
               show_deal_toast: apiItem.show_deal_toast || false,
               deal_required_qty: apiItem.deal_required_qty || null,
               deal_qty_needed: apiItem.deal_qty_needed || null,
               deals: apiItem.deals?.map(deal => ({
                 ...deal,
                 fixed_price: deal.fixed_price?.toString() || undefined
               })) || item.deals || []
             };
           }
           return item;
         });

         setCartItems(updatedItems);
         
         // Update totals from API response summary
         if (response.data.summary) {
           
           setCartTotal(roundCurrency(response.data.summary.total));
           setCartSubtotal(roundCurrency(response.data.summary.subtotal));
           setCartDiscount(roundCurrency(response.data.summary.total_discount));
           setItemCount(items.length);
         } else {
           calculateTotals(updatedItems);
         }
      } else {
        // Fallback to local calculation if API fails
        calculateTotals(items);
      }
    } catch (error) {
      console.error('Error calculating guest deals:', error);
      // Fallback to local calculation if API fails
      calculateTotals(items);
    }
  }, [isAuthenticated, calculateTotals]);

  const isValidGuestCartItem = (item: unknown): item is CartItem => {
    if (!item || typeof item !== 'object') return false;
    const value = item as Partial<CartItem>;
    return (
      typeof value.product_id === 'number' &&
      typeof value.variant_id === 'number' &&
      typeof value.quantity === 'number' &&
      typeof value.price === 'string' &&
      typeof value.name === 'string'
    );
  };

  const sanitizeGuestCart = (input: unknown): CartItem[] => {
    if (!Array.isArray(input)) return [];
    return input.filter(isValidGuestCartItem);
  };

  const loadCartItems = useCallback(async () => {
    setIsLoading(true);
    try {
      if (isAuthenticated) {
        const response = await getCartItems();
        if (response.status === ServerActionStatus.SUCCESS) {
          const cartData = response.data;
          const cartItems: CartItem[] = cartData.items.map((item) => {
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
          });
          setCartItems(cartItems);
          if (cartData.summary) {
            setCartTotal(roundCurrency(cartData.summary.total));
            setCartSubtotal(roundCurrency(cartData.summary.subtotal));
            setCartDiscount(roundCurrency(cartData.summary.total_discount));
            setItemCount(cartData.items.length);
          } else {
            calculateTotals(cartItems);
          }
        }
             } else {
         // Load from localStorage for guest users
         const guestCart = sanitizeGuestCart(getGuestCart<unknown>());
         if (guestCart.length > 0) {
           setCartItems(guestCart);
           // For guest users, immediately calculate deals using API to prevent flicker
           await calculateGuestDealsAndTotals(guestCart);
         }
       }
         } catch (error) {
       console.error('Error loading cart:', error);
       // Load from localStorage as fallback
      const guestCart = sanitizeGuestCart(getGuestCart<unknown>());
      if (guestCart.length > 0) {
         setCartItems(guestCart);
         // For guest users, try API first, fallback to local calculation
         if (!isAuthenticated) {
           try {
             await calculateGuestDealsAndTotals(guestCart);
           } catch (apiError) {
             console.error('API failed, using local calculation:', apiError);
             calculateTotals(guestCart);
           }
         } else {
           calculateTotals(guestCart);
         }
       }
     } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, calculateGuestDealsAndTotals, calculateTotals]);
  
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchLoyaltyPoints = async () => {
      const response = await getLoyaltyPointsRedemption();

      if (response.status === ServerActionStatus.SUCCESS) {
        setLoyaltyRedemption(prev => ({ ...prev, pointsData: response.data }));
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

  // Helper function to calculate deals for guest users
  // const calculateLocalGuestDeals = (product: Product, quantity: number) => {
  //   if (!product.deals || product.deals.length === 0) {
  //     return {
  //       applied_deals: [],
  //       show_deal_toast: false,
  //       deal_required_qty: null,
  //       deal_qty_needed: null,
  //       deals: product.deals || [],
  //       dealDiscountAmount: 0
  //     };
  //   }

  //   // Find the best applicable deal
  //   const applicableDeals = product.deals.filter(deal => deal.required_qty <= quantity);
  //   const bestDeal = applicableDeals.length > 0 
  //     ? applicableDeals.reduce((best, current) => 
  //         current.required_qty > best.required_qty ? current : best
  //       )
  //     : null;

  //   if (bestDeal) {
  //     // Calculate deal discount amount
  //     let dealDiscountAmount = 0;
  //     if (bestDeal.deal_type === 'BUY_N_FOR_FIXED' && bestDeal.fixed_price) {
  //       // Fixed price deal - calculate discount based on difference between regular price and fixed price
  //       const regularPrice = parseFloat(product.price || '0') * quantity;
  //       const fixedPrice = parseFloat(bestDeal.fixed_price) * quantity;
  //       dealDiscountAmount = Math.max(0, regularPrice - fixedPrice);
  //     } else if (bestDeal.discount_percent) {
  //       // Percentage discount
  //       dealDiscountAmount = (parseFloat(product.price || '0') * quantity * bestDeal.discount_percent) / 100;
  //     }

  //     // Deal is applied - convert to AppliedDeal format
  //     const appliedDeal = {
  //       deal_id: bestDeal.id,
  //       deal_name: bestDeal.name,
  //       discount_amount: dealDiscountAmount
  //     };
      
  //     return {
  //       applied_deals: [appliedDeal],
  //       show_deal_toast: false,
  //       deal_required_qty: bestDeal.required_qty,
  //       deal_qty_needed: 0,
  //       deals: product.deals,
  //       dealDiscountAmount: dealDiscountAmount
  //     };
  //   } else {
  //     // Find the next deal to show toast
  //     const nextDeal = product.deals.reduce((next, current) => 
  //       current.required_qty < next.required_qty ? current : next
  //     );
      
  //     return {
  //       applied_deals: [],
  //       show_deal_toast: true,
  //       deal_required_qty: nextDeal.required_qty,
  //       deal_qty_needed: nextDeal.required_qty - quantity,
  //       deals: product.deals,
  //       dealDiscountAmount: 0
  //     };
  //   }
  // };

  const createGuestCartItem = (product: Product, variantId: number, quantity: number, data: ProductVariant, productName: string, variantSlug: string, variantAttributes: { attribute_id: number; term_slug: string }[]): CartItem => {
    const id =
      typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function'
        ? crypto.getRandomValues(new Uint32Array(1))[0]
        : Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    // Use discount_price if available, otherwise use regular price
    const effectivePrice = data.discount_price && parseFloat(data.discount_price) > 0 
      ? parseFloat(data.discount_price) 
      : parseFloat(data.price);
    
    // For guest users, don't calculate deals locally - let the API handle it
    // This prevents the flicker between local calculation and API result
    
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
      subtotal: parseFloat(data.price) * quantity, // Original price * quantity
      total: effectivePrice * quantity, // Just the base price * quantity, API will update with deals
      applied_deals: [], // Empty initially, API will populate
      show_deal_toast: false, // API will determine this
      deal_required_qty: null, // API will determine this
      deal_qty_needed: null, // API will determine this
      deals: product.deals || [], // Keep product deals for reference
      variantAttributes: variantAttributes,
    };
  };

  const event = ({ action, category, label, value }: { action: string, category: string, label: string, value: string }) => {
      if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
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
        setGuestCart(updatedCart);
        // Immediately calculate deals using API to prevent flicker
        await calculateGuestDealsAndTotals(updatedCart);
        if (couponDiscount.isApplied && couponDiscount.code) {
          await revalidateGuestCoupon(updatedCart, shippingMethodIdForCoupon);
        }
        toast.success(`${productName} added to cart successfully`);
      }

    } catch (error) {
      console.error('Error adding item to cart:', error);
      toast.error('Failed to add item to cart. Please try again.');
      // Handle as guest cart as fallback - still try to use API for deals
      const newItem = createGuestCartItem(product, variantId, quantity, data, productName, variantSlug, variantAttributes);
      const updatedCart = [...cartItems, newItem];
      setCartItems(updatedCart);
      setGuestCart(updatedCart);
      // Try API first, fallback to local calculation if API fails
      try {
        await calculateGuestDealsAndTotals(updatedCart);
        if (couponDiscount.isApplied && couponDiscount.code) {
          await revalidateGuestCoupon(updatedCart, shippingMethodIdForCoupon);
        }
      } catch (apiError) {
        console.error('API failed, using local calculation:', apiError);
        calculateTotals(updatedCart);
      }
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
        const updatedCart = cartItems.map(item => {
          if (item.id === cartId) {
            // For guest users, don't calculate deals locally - let the API handle it
            // This prevents the flicker between local calculation and API result
            const effectivePrice = item.discount_price && parseFloat(item.discount_price) > 0 
              ? parseFloat(item.discount_price) 
              : parseFloat(item.price);
            
            return {
              ...item,
              quantity,
              subtotal: parseFloat(item.price) * quantity, // Original price * quantity
              total: effectivePrice * quantity, // Just the base price * quantity, API will update with deals
              // Keep existing deal info until API updates it
              applied_deals: item.applied_deals,
              show_deal_toast: item.show_deal_toast,
              deal_required_qty: item.deal_required_qty,
              deal_qty_needed: item.deal_qty_needed
            };
          }
          return item;
        });
         setCartItems(updatedCart);
         setGuestCart(updatedCart);
         await calculateGuestDealsAndTotals(updatedCart);
         // Revalidate coupon if applied for guest users
         if (couponDiscount.isApplied && couponDiscount.code) {
           await revalidateGuestCoupon(updatedCart, shippingMethodIdForCoupon); // Use shippingMethodIdForCoupon (set by CartTotal on checkout page)
         }
         // toast.success('Cart updated successfully');
      }
    } catch (error) {
      console.error('Error updating cart item:', error);
      toast.error('Failed to update cart. Please try again.');
      // Handle as guest cart as fallback
      const updatedCart = cartItems.map(item => {
        if (item.id === cartId) {
          // For guest users, don't calculate deals locally - let the API handle it
          const effectivePrice = item.discount_price && parseFloat(item.discount_price) > 0 
            ? parseFloat(item.discount_price) 
            : parseFloat(item.price);
          return {
            ...item,
            quantity,
            subtotal: parseFloat(item.price) * quantity, // Original price * quantity
            total: effectivePrice * quantity // Just the base price * quantity, API will update with deals
          };
        }
        return item;
      });
      setCartItems(updatedCart);
      setGuestCart(updatedCart);
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
              pointsToRedeem: null,
              applyCouponShippingCost: null,
              applyCouponShippingMethodId: null,
              applyCouponMailSubscriptionDiscount: null,
            });
          }
        }
             } else {
         // Handle as guest cart
         const updatedCart = cartItems.filter(item => item.id !== cartId);
         setCartItems(updatedCart);
         setGuestCart(updatedCart);
         // For guest users, recalculate deals using API if cart is not empty
         if (updatedCart.length > 0) {
           await calculateGuestDealsAndTotals(updatedCart);
           if (couponDiscount.isApplied && couponDiscount.code) {
             await revalidateGuestCoupon(updatedCart, shippingMethodIdForCoupon);
           }
         } else {
           calculateTotals(updatedCart);
         }
         toast.error(`${itemToRemove?.name || 'Item'} removed from cart`);
         
         // Reset loyalty points if cart becomes empty
         if (updatedCart.length === 0) {
           setLoyaltyRedemption({
             isRedeemed: false,
             pointsData: loyaltyRedemption.pointsData,
             discountValue: 0,
             message: null,
             pointsToRedeem: null,
             applyCouponShippingCost: null,
             applyCouponShippingMethodId: null,
             applyCouponMailSubscriptionDiscount: null,
           });
         }
       }
    } catch (error) {
      console.error('Error removing item from cart:', error);
      toast.error('Failed to remove item from cart. Please try again.');
             // Handle as guest cart as fallback
       const updatedCart = cartItems.filter(item => item.id !== cartId);
       setCartItems(updatedCart);
       setGuestCart(updatedCart);
       // For guest users, try API first, fallback to local calculation
       if (!isAuthenticated && updatedCart.length > 0) {
         try {
           await calculateGuestDealsAndTotals(updatedCart);
           if (couponDiscount.isApplied && couponDiscount.code) {
             await revalidateGuestCoupon(updatedCart, shippingMethodIdForCoupon);
           }
         } catch (apiError) {
           console.error('API failed, using local calculation:', apiError);
           calculateTotals(updatedCart);
         }
       } else {
         calculateTotals(updatedCart);
       }
       
       // Reset loyalty points if cart becomes empty
       if (updatedCart.length === 0) {
         setLoyaltyRedemption({
           isRedeemed: false,
           pointsData: loyaltyRedemption.pointsData,
           discountValue: 0,
           message: null,
           pointsToRedeem: null,
           applyCouponShippingCost: null,
           applyCouponShippingMethodId: null,
           applyCouponMailSubscriptionDiscount: null,
         });
       }
    } finally {
      setIsLoading(false);
    }
  };

  const syncCookieCart = useCallback(async () => {

    if (!isAuthenticated) return; // Only sync if user is authenticated

    // Try to load from localStorage first (new approach)
    let guestCart = sanitizeGuestCart(getGuestCart<unknown>());
    
    // Fallback to cookie for backward compatibility (migrate old cookie data)
    if (!guestCart) {
      const cookieCart = getCookie(CART_COOKIE_NAME);
      if (cookieCart) {
        try {
          guestCart = sanitizeGuestCart(JSON.parse(cookieCart as string));
          // Migrate to localStorage
          if (guestCart.length > 0) {
            setGuestCart(guestCart);
            setCookie(CART_COOKIE_NAME, ''); // Clear old cookie
          }
        } catch (e) {
          console.error('Error parsing cookie cart:', e);
        }
      }
    }

    if (guestCart.length > 0) {
      const cartItems = guestCart.map(item => ({
        product_id: item.product_id,
        variant_id: item.variant_id,
        quantity: item.quantity
      }));
      try {
        const response = await bulkAddToCart(cartItems);

        if (response.status === ServerActionStatus.SUCCESS) {
          removeGuestCart(); // Clear localStorage cart after sync
          await loadCartItems();
        } else {
          toast.error(response.message);
        }
      } catch (error) {
        console.error('Failed to sync cart:', error);
      }
    }
  }, [isAuthenticated, loadCartItems]);

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
        const guestCart = sanitizeGuestCart(getGuestCart<unknown>());
        // Also check cookie for backward compatibility
        const cookieCart = getCookie(CART_COOKIE_NAME);
        if (guestCart.length > 0) {
          await syncCookieCart();
        } else if (cookieCart) {
          try {
            const items: CART_GET_PAYLOAD[] = JSON.parse(cookieCart as string);
            if (items.length > 0) {
              await syncCookieCart();
            }
          } catch (e) {
            console.error('Error parsing cookie cart:', e);
          }
        }
      }
    };

    handleAuthChange();
  }, [isAuthenticated, hasAttemptedSync, syncCookieCart])

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
          setCartTotal(roundCurrency(cartData.summary.total));
          setCartSubtotal(roundCurrency(cartData.summary.subtotal));
          setCartDiscount(roundCurrency(cartData.summary.total_discount));
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
      mailSubscriptionDiscount: undefined,
    });
    setLoyaltyRedemption({
      isRedeemed: false,
      pointsData: loyaltyRedemption.pointsData, // Preserve points data
      discountValue: 0,
      message: null,
      pointsToRedeem: null,
      applyCouponShippingCost: null,
      applyCouponShippingMethodId: null,
      applyCouponMailSubscriptionDiscount: null,
    });
    removeGuestCart();
    deleteCookie(CART_COOKIE_NAME);
    deleteCookie('couponDiscount');
    deleteCookie(LOYALTY_COOKIE_NAME);
  }, [loyaltyRedemption.pointsData, couponDiscount.mailSubscriptionData]);

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
        mailSubscriptionDiscount: undefined,
      });
    }
  }, [itemCount, isLoading, couponDiscount.mailSubscriptionData]);

  // Revalidate guest coupon
  const revalidateGuestCoupon = useCallback(async (items: CartItem[], shippingMethodId: number = 0) => {
    // Skip revalidation if:
    // 1. Coupon is not applied or no code exists
    // 2. Coupon is currently being applied (to prevent duplicate API calls)
    if (!couponDiscount.code || !couponDiscount.isApplied || isApplyingCouponRef.current || isAuthenticated) {
      return;
    }

    try {      
      // Build cart items array for API
      const cartItemsForApi = items.map(item => ({
        product_id: item.product_id,
        variant_id: item.variant_id,
        quantity: item.quantity
      }));

      const payload: APPLY_GUEST_COUPON_PAYLOAD = {
        couponCode: couponDiscount.code,
        cartItems: cartItemsForApi,
        shippingMethodId: shippingMethodId,
        loyalty: false
      };

      const response = await applyGuestCoupon(payload);

      if (response.status === ServerActionStatus.SUCCESS && response.data && response.data.total != null && response.data.coupon) {
        const couponData: CouponResponse = response.data;
        // Use discount_amount directly from API response
        const discountAmount = couponData.discount_amount || 0;
        const apiSubTotal = parseApiMoney(couponData.subTotal);
        const apiTotal = parseApiMoney(couponData.total);
        const apiShippingCost = parseApiMoney(couponData.shippingCost);
        
        // Extract mail subscription discount from API response
        const mailSubscriptionDiscountValue = (couponData.mail_subscription_discount !== undefined && Number.isFinite(couponData.mail_subscription_discount))
          ? couponData.mail_subscription_discount
          : undefined;
        setCouponDiscount({
          value: Number.isFinite(discountAmount) ? discountAmount : 0,
          isApplied: true,
          code: couponDiscount.code,
          message: couponData.coupon.discount_type === "percentage" ? `Extra ${couponData.coupon.discount_value}% off` : `Extra ${DEFAULT_CURRENCY_SYMBOL}${couponData.coupon.discount_value} off`,
          discountValue: Number.isFinite(discountAmount) ? discountAmount.toFixed(2) : '0.00',
          discount_amount: Number.isFinite(couponData.discount_amount) ? couponData.discount_amount : undefined,
          shippingCost: apiShippingCost,
          subTotal: apiSubTotal,
          total: apiTotal,
          mailSubscriptionData: couponData.mail_subscription_data || couponDiscount.mailSubscriptionData,
          mailSubscriptionDiscount: mailSubscriptionDiscountValue,
        });
      } else {
        if (couponDiscount.isApplied) {
          setCouponDiscount({
            value: 0,
            isApplied: false,
            code: couponDiscount.code,
            message: null,
            discountValue: '',
            mailSubscriptionData: couponDiscount.mailSubscriptionData,
            mailSubscriptionDiscount: undefined,
          });
        }
      }
    } catch (error) {
      console.error('🔄 [CartContext] Error revalidating guest coupon:', error);
    }
  }, [couponDiscount.code, couponDiscount.isApplied, couponDiscount.mailSubscriptionData, isAuthenticated, isApplyingCouponRef]);

  // Revalidate coupon when cartTotal or itemCount changes
  useEffect(() => {
    // Always clear the previous scheduled revalidation on cart changes.
    if (couponRevalidateTimeoutRef.current) {
      clearTimeout(couponRevalidateTimeoutRef.current);
      couponRevalidateTimeoutRef.current = null;
    }

    const revalidate = async () => {
      // Skip revalidation if:
      // 1. Coupon is not applied or no code exists
      // 2. Coupon is currently being applied (to prevent duplicate API calls)
      if (!couponDiscount.code || !couponDiscount.isApplied || isApplyingCouponRef.current) {
        return;
      }

      // For guest users, skip this revalidation (handled separately in updateItemQuantity)
      if (!isAuthenticated) {
        return;
      }

      // Use shippingMethodIdForCoupon (set by CartTotal on checkout page)
      // On checkout page: uses selectedShippingMethod ID
      // On shopping cart page: defaults to 0
      const response = await applyCoupon({
        couponCode: couponDiscount.code,
        shippingMethodId: shippingMethodIdForCoupon,
      });
      
      // console.log('🔄 [CartContext] Response data:', response.data);
      
      // Check for valid response with total and coupon data (not just referral_value)
      if (response.status === ServerActionStatus.SUCCESS && response.data && response.data.total != null && response.data.coupon) {
        const couponData: CouponResponse = response.data;
        const apiSubTotal = parseApiMoney(couponData.subTotal);
        const apiTotal = parseApiMoney(couponData.total);
        const apiShippingCost = parseApiMoney(couponData.shippingCost);
        // Use discount_amount directly from API response if available, otherwise calculate
        const discountAmount = couponData.discount_amount ?? (apiSubTotal - apiTotal);
        
        // Extract mail subscription discount from API response
        const mailSubscriptionDiscountValue = (couponData.mail_subscription_discount !== undefined && Number.isFinite(couponData.mail_subscription_discount))
          ? couponData.mail_subscription_discount
          : undefined;
        setCouponDiscount({
          value: Number.isFinite(discountAmount) ? discountAmount : 0,
          isApplied: true,
          code: couponDiscount.code,
          message: couponData.coupon.discount_type === "percentage" ? `Extra ${couponData.coupon.discount_value}% off` : `Extra ${DEFAULT_CURRENCY_SYMBOL}${couponData.coupon.discount_value} off`,
          discountValue: Number.isFinite(discountAmount) ? discountAmount.toFixed(2) : '0.00',
          discount_amount: Number.isFinite(couponData.discount_amount) ? couponData.discount_amount : undefined,
          shippingCost: apiShippingCost,
          subTotal: apiSubTotal,
          total: apiTotal,
          mailSubscriptionData: couponData.mail_subscription_data || couponDiscount.mailSubscriptionData, // Use new data or preserve existing
          mailSubscriptionDiscount: mailSubscriptionDiscountValue,
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
    };

    // Only revalidate if not loading and coupon is already applied.
    // Debounced to batch rapid cart changes into a single call.
    if (!isLoading && couponDiscount.isApplied && couponDiscount.code && isAuthenticated) {
      couponRevalidateTimeoutRef.current = setTimeout(() => {
        void revalidate();
      }, 700);
    }

    return () => {
      if (couponRevalidateTimeoutRef.current) {
        clearTimeout(couponRevalidateTimeoutRef.current);
        couponRevalidateTimeoutRef.current = null;
      }
    };
  }, [cartTotal, itemCount, isLoading, couponDiscount.code, couponDiscount.isApplied, couponDiscount.mailSubscriptionData, isAuthenticated, shippingMethodIdForCoupon]);

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

  // Wrapper for setCouponDiscount to track when coupon is being applied
  const setCouponDiscountWrapper = useCallback((discount: CouponDiscount) => {
    // Set flag when coupon is being applied
    if (discount.isApplied && discount.code) {
      isApplyingCouponRef.current = true;
      setCouponDiscount(discount);
      // Reset flag after a short delay to allow revalidation to work later
      setTimeout(() => {
        isApplyingCouponRef.current = false;
      }, 1000);
    } else {
      // If removing coupon, reset flag immediately
      isApplyingCouponRef.current = false;
      setCouponDiscount(discount);
    }
  }, []);

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
    setCouponDiscount: setCouponDiscountWrapper,
    checkoutStockValidation,
    stockValidationErrors,
    stockValidationLoading,
    isRemoveCoupon,
    setIsRemoveCoupon,
    validateCartItems,
    unAvailableItems,
    loyaltyRedemption,
    setLoyaltyRedemption,
    setShippingMethodIdForCoupon,
  } satisfies CartContextType;

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};