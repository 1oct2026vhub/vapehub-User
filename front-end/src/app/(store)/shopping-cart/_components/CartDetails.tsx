"use client"
import ShippingProgress from '@/components/ShippingProgress'
import { DEFAULT_CURRENCY_SYMBOL, ServerActionStatus } from '@/lib/config/app.config'
import { useCart } from '@/lib/context/CartContext'
import { ROUTES } from '@/lib/routes'
import { checkout } from '@/lib/server.actions'
import { Button, Divider } from '@nextui-org/react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'
import CouponForm from '@/components/CouponForm'
import { CHECKOUT_PAYLOAD } from '@/lib/config/checkout.config'
import { getCookie } from 'cookies-next'
import { CartItem } from '@/lib/config/cart.config'
import { SHIPPING_METHOD_DATA } from '@/lib/config/order.config'
import { FREE_DELIVERY_THRESHOLD } from '@/lib/utils'

interface CartDetailsProps {
    shippingMethodsData: SHIPPING_METHOD_DATA[];
}

const CartDetails: React.FC<CartDetailsProps> = ({ shippingMethodsData }) => {
    const { status } = useSession();
    const { cartTotal, itemCount, couponDiscount, setCouponDiscount, checkoutStockValidation, stockValidationLoading, setIsRemoveCoupon, cartItems, cartSubtotal, cartDiscount } = useCart();
    const router = useRouter();

    const freeShippingThreshold = useMemo(() => {
        if (!shippingMethodsData || shippingMethodsData.length === 0) {
            return FREE_DELIVERY_THRESHOLD;
        }

        const freeShippingMethod = shippingMethodsData.find(
            method => (method.is_free_shipping ?? false) && method.free_shipping_threshold
        );

        if (freeShippingMethod?.free_shipping_threshold) {
            const thresholdValue = parseFloat(freeShippingMethod.free_shipping_threshold);
            return Number.isFinite(thresholdValue) && thresholdValue > 0
                ? thresholdValue
                : FREE_DELIVERY_THRESHOLD;
        }

        return FREE_DELIVERY_THRESHOLD;
    }, [shippingMethodsData]);

    // Console log cart details for guest users
    useEffect(() => {
        if (status !== 'authenticated') {
            const guestCart = getCookie('guest_cart');
            const guestCoupon = getCookie('couponDiscount');
            const guestLoyalty = getCookie('loyalty_redemption');
            
            console.log('👤 [GUEST USER] Cart Details:', {
                userType: 'Guest',
                status,
                cartItems: cartItems,
                itemCount,
                cartTotal,
                cartSubtotal,
                cartDiscount,
                couponDiscount,
                guestCartCookie: guestCart ? JSON.parse(guestCart as string) : null,
                guestCouponCookie: guestCoupon ? JSON.parse(guestCoupon as string) : null,
                guestLoyaltyCookie: guestLoyalty ? JSON.parse(guestLoyalty as string) : null,
                cartItemsCount: cartItems?.length || 0,
                cartItemsDetails: cartItems?.map(item => ({
                    id: item.id,
                    product_id: item.product_id,
                    variant_id: item.variant_id,
                    quantity: item.quantity,
                    price: item.price,
                    discount_price: item.discount_price,
                    name: item.name,
                    product_slug: item.product_slug,
                    slug: item.slug
                }))
            });
        }
    }, [status, cartItems, itemCount, cartTotal, cartSubtotal, cartDiscount, couponDiscount]);

    const handleCheckout = async () => {
        // Get all cart-related cookies
        const guestCartCookie = getCookie('guest_cart');
        const couponCookie = getCookie('couponDiscount');
        const loyaltyCookie = getCookie('loyalty_redemption');
        
        // Parse cookie data
        let parsedGuestCart: CartItem[] | null = null;
        let parsedCoupon: unknown = null;
        let parsedLoyalty: unknown = null;
        
        try {
            if (guestCartCookie) {
                parsedGuestCart = JSON.parse(guestCartCookie as string) as CartItem[];
            }
        } catch (e) {
            console.error('Error parsing guest_cart cookie:', e);
        }
        
        try {
            if (couponCookie) {
                parsedCoupon = JSON.parse(couponCookie as string);
            }
        } catch (e) {
            console.error('Error parsing couponDiscount cookie:', e);
        }
        
        try {
            if (loyaltyCookie) {
                parsedLoyalty = JSON.parse(loyaltyCookie as string);
            }
        } catch (e) {
            console.error('Error parsing loyalty_redemption cookie:', e);
        }
        
        // Console log cart details stored in cookies
        console.log('🍪 [COOKIES] Cart Details Stored in Cookies:', {
            'guest_cart': {
                raw: guestCartCookie,
                parsed: parsedGuestCart,
                itemCount: parsedGuestCart?.length || 0,
                items: parsedGuestCart?.map((item: CartItem) => ({
                    id: item.id,
                    product_id: item.product_id,
                    variant_id: item.variant_id,
                    quantity: item.quantity,
                    price: item.price,
                    discount_price: item.discount_price,
                    name: item.name,
                    product_slug: item.product_slug
                }))
            },
            'couponDiscount': {
                raw: couponCookie,
                parsed: parsedCoupon
            },
            'loyalty_redemption': {
                raw: loyaltyCookie,
                parsed: parsedLoyalty
            }
        });
        
        console.log('🛒 [CartDetails] Checkout initiated:', {
            isAuthenticated: status === 'authenticated',
            cartItems,
            itemCount,
            cartTotal,
            couponDiscount,
            cartSubtotal,
            cartDiscount
        });
        
        const isValid = await checkoutStockValidation();
        if(isValid) {
            // For unauthenticated users, skip API call and redirect directly
            // Cart data is already stored in cookies and will be used on checkout page
            if(status !== 'authenticated') {
                const guestCart = getCookie('guest_cart');
                const guestCoupon = getCookie('couponDiscount');
                const guestLoyalty = getCookie('loyalty_redemption');
                
                console.log('👤 [GUEST USER] Checkout - Cart Details:', {
                    userType: 'Guest',
                    cartItems: cartItems,
                    itemCount,
                    cartTotal,
                    cartSubtotal,
                    cartDiscount,
                    couponDiscount,
                    guestCartCookie: guestCart ? JSON.parse(guestCart as string) : null,
                    guestCouponCookie: guestCoupon ? JSON.parse(guestCoupon as string) : null,
                    guestLoyaltyCookie: guestLoyalty ? JSON.parse(guestLoyalty as string) : null,
                    cartItemsCount: cartItems?.length || 0,
                    cartItemsDetails: cartItems?.map(item => ({
                        id: item.id,
                        product_id: item.product_id,
                        variant_id: item.variant_id,
                        quantity: item.quantity,
                        price: item.price,
                        discount_price: item.discount_price,
                        name: item.name,
                        product_slug: item.product_slug,
                        slug: item.slug
                    })),
                    totalCalculation: {
                        subtotal: cartSubtotal,
                        discount: cartDiscount,
                        couponDiscount: couponDiscount.value,
                        finalTotal: cartTotal
                    }
                });
                
                console.log('👤 [GUEST USER] Redirecting to checkout without API call');
                router.push(ROUTES.CHECKOUT);
                return;
            }
            
            // For authenticated users, call checkout API
            console.log('🛒 [CartDetails] Authenticated user - calling checkout API');
            const response = await checkout({ couponCode: couponDiscount.code || '' } as unknown as CHECKOUT_PAYLOAD);
            if(response.status === ServerActionStatus.SUCCESS) {
                console.log('🛒 [CartDetails] Checkout API success - redirecting to checkout');
                router.push(ROUTES.CHECKOUT);
            } else {
                console.error('🛒 [CartDetails] Checkout API error:', response.message);
                toast.error(response.message);
            }
        } else {
            console.log('🛒 [CartDetails] Stock validation failed');
        }
    }

    return (
        <div className='flex flex-col p-3 md:p-5 gap-3 bg-white border border-skin-neutral-100 rounded-14 w-full lg:w-4/6 xl:w-full xl:max-w-[584px]'>
            {status === 'authenticated' && (
                <>
                    <CouponForm 
                        onCouponApplied={setCouponDiscount}
                        initialCouponCode={couponDiscount.code || ''}
                        cartTotal={cartTotal}
                    />
                    {couponDiscount.isApplied && (
                        <div className='flex items-center justify-between text-skin-primary-400 text-content-3 md:text-content-1 font-bold'>
                            <div className='flex flex-col'> 
                                <p>{couponDiscount.message}</p>
                                <p>Coupon: {couponDiscount.code}</p>
                            </div>
                            <div className='flex items-center'>
                                <p>-{DEFAULT_CURRENCY_SYMBOL} {couponDiscount.discountValue}</p>
                                <button 
                                    className='text-red-500 hover:underline text-content-3 md:text-content-1 font-bold'
                                    onClick={() => setIsRemoveCoupon(true)}
                                >
                                    [Remove]
                                </button>
                            </div>
                        </div>
                    )}
                    <Divider />
                </>
            )}
            <div className='space-y-1.5'>
                <div className='flex items-center justify-between text-content-2 md:text-title-2 font-semibold'>
                    <p className='text-skin-neutral-500 !font-oswald'>Number of Items</p>
                    <p className='text-skin-neutral-300'>{itemCount}</p>
                </div>
                <div className='flex items-center justify-between text-content-2 md:text-title-2 font-semibold'>
                    <p className='text-skin-neutral-500 !font-oswald'>Subtotal</p>
                    <p className='text-skin-neutral-300'>{DEFAULT_CURRENCY_SYMBOL} {cartTotal.toFixed(2)}</p>
                </div>
            </div>
            <Divider />
            <ShippingProgress 
                totalAmount={cartTotal} 
                freeShippingThreshold={freeShippingThreshold}
            />
            <Divider />
            <div className='flex items-center justify-between text-black font-semibold'>
                <p className='text-content-2 md:text-2xl !font-oswald'>Total</p>
                <p className='text-title-2 md:text-2xl !font-oswald'>{DEFAULT_CURRENCY_SYMBOL} {couponDiscount.isApplied ?  (cartTotal - couponDiscount.value).toFixed(2): (cartTotal).toFixed(2)}</p>
            </div>
            <Button
                size="lg"
                radius="md"
                color="primary"
                className="w-full btn primary-btn shadow-button !text-skin-white !rounded-md uppercase text-content-1 md:text-2xl !py-1.5 !px-3"
                onPress={handleCheckout}
                isLoading={stockValidationLoading}
            >
                Checkout Now
            </Button>
        </div>
    )
}

export default CartDetails
