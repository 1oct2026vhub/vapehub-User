'use client'

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CHECKOUT_FORM_SCHEMA, CHECKOUT_PAYLOAD, CHECKOUT_PAYMENT_METHODS, type CHECKOUT_FORM_TYPE } from '@/lib/config/checkout.config';
import { SHIPPING_METHOD_DATA, ORDER_RESPONSE_DATA, GuestCheckoutResponseData } from '@/lib/config/order.config';
import InputForm from '@/components/InputForm';
import CustomCheckbox from '@/components/FormCheckbox';
import { CustomRadio } from '@/components/CustomRadio';
import { Button, RadioGroup, useDisclosure } from '@nextui-org/react';
import { Form } from '@/components/ui/Form';
import { useCheckout } from '@/lib/context/CheckoutContext';
import { useCart } from '@/lib/context/CartContext';
import { useAddress } from '@/lib/context/AddressContext';
import AddressList from './AddressList';
import { Address } from '@/lib/config/user.config';
import { useUserProfile } from '@/lib/hooks/useUserProfile';
import Flag from '@/components/ui/Flag';
import { DEFAULT_COUNTRY } from '@/lib/utils/address.utils';
import { placeOrder, guestCheckoutAndOrder } from '@/lib/server.actions';
import { ServerActionStatus } from '@/lib/config/app.config';
import GooglePlacesAutocomplete from '@/components/GooglePlacesAutocomplete';
import { PlaceAutocompleteAddress } from '@/lib/utils/google-place.utils';
import { toast } from 'sonner';
import UnavailableItemsModal from './UnavailableItemsModal';
import { useSession } from 'next-auth/react';
import { getCookie } from 'cookies-next';
import { GUEST_CHECKOUT_AND_ORDER_PAYLOAD } from '@/lib/config/checkout.config';
import { CartItem } from '@/lib/config/cart.config';

interface CheckoutDetailsProps {
    shippingMethodsData: SHIPPING_METHOD_DATA[];
}

const CheckoutDetails: React.FC<CheckoutDetailsProps> = ({ shippingMethodsData }) => {
    const { status } = useSession();
    const isAuthenticated = status === 'authenticated';
    const { fetchProfile } = useUserProfile();
    const [shippingAsBilling, setShippingAsBilling] = useState(true);
    const [shippingMethods, setShippingMethods] = useState<SHIPPING_METHOD_DATA[]>([]);
    const [originalShippingMethods, setOriginalShippingMethods] = useState<SHIPPING_METHOD_DATA[]>([]);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const form = useForm<CHECKOUT_FORM_TYPE>({
        resolver: zodResolver(CHECKOUT_FORM_SCHEMA(shippingAsBilling)),
        mode: 'all',
        defaultValues: {
            email: '',
            phone: '',
            ageConfirmation: false,
            useShippingAsBilling: false,
            termsAgreement: false,
            shippingMethodId: 0,
            marketingConsent: false,
            // paymentMethod: CHECKOUT_PAYMENT_METHODS.VIVA_WALLET,
            paymentMethod: CHECKOUT_PAYMENT_METHODS.WORLD_PAY,
            selectedAddressId: undefined,
            shippingFirstName: '',
            shippingLastName: '',
            shippingAddress1: '',
            shippingAddress2: '',
            shippingAddress3: '',
            shippingCity: '',
            shippingPostcode: '',
            shippingRegion: '',
            shippingCountry: DEFAULT_COUNTRY,
            billingFirstName: '',
            billingLastName: '',
            billingAddress1: '',
            billingAddress2: '',
            billingAddress3: '',
            billingCity: '',
            billingPostcode: '',
            billingRegion: '',
            billingCountry: DEFAULT_COUNTRY
        }
    });
    const { handlePlaceOrder, isProcessing, setSelectedShippingMethod } = useCheckout();
    const [selectedCarrier, setSelectedCarrier] = useState<SHIPPING_METHOD_DATA | null>(null);
    const { cartTotal, cartSubtotal, couponDiscount, validateCartItems, fetchCartItems, loyaltyRedemption } = useCart();
    const { addresses } = useAddress();
    const [showNewAddressForm, setShowNewAddressForm] = useState(addresses.length === 0);
    const onSubmit = async (data: CHECKOUT_FORM_TYPE) => {
        // Validate cart items before proceeding with order
        const isCartValid = await validateCartItems();
         
        if (isCartValid.length) {
            // Display modal if there are validation errors
            onOpen();
            return;
        }

        // Handle form submission
        if (!data) return;

        // For guest users, use the combined checkout and order API
        if (!isAuthenticated) {
            // Get cart items from cookies
            const guestCartCookie = getCookie('guest_cart');
            let guestCartItems: CartItem[] = [];
            
            try {
                if (guestCartCookie) {
                    guestCartItems = JSON.parse(guestCartCookie as string);
                }
            } catch (e) {
                console.error('Error parsing guest cart cookie:', e);
                toast.error('Error loading cart items. Please try again.');
                return;
            }

            // Build cart items array for API
            const cartItemsForApi = guestCartItems.map(item => ({
                product_id: item.product_id,
                variant_id: item.variant_id,
                quantity: item.quantity
            }));

            const guestOrderPayload: GUEST_CHECKOUT_AND_ORDER_PAYLOAD = {
                email: data.email,
                first_name: data.shippingFirstName || '',
                last_name: data.shippingLastName || '',
                phone: data.phone,
                cartItems: cartItemsForApi,
                couponCode: couponDiscount.code || undefined,
                shipping_method_id: Number(selectedCarrier?.id) || 0,
                shipping_address: {
                    first_name: data.shippingFirstName || '',
                    last_name: data.shippingLastName || '',
                    address_line_1: data.shippingAddress1 || '',
                    address_line_2: data.shippingAddress2 || '',
                    city: data.shippingCity || '',
                    region: data.shippingRegion || '',
                    post_code: data.shippingPostcode || '',
                    country: data.shippingCountry || DEFAULT_COUNTRY,
                    shipping_address_id: null
                },
                billing_address: {
                    first_name: !data.useShippingAsBilling ? data.shippingFirstName || '' : data.billingFirstName || '',
                    last_name: !data.useShippingAsBilling ? data.shippingLastName || '' : data.billingLastName || '',
                    address_line_1: !data.useShippingAsBilling ? data.shippingAddress1 || '' : data.billingAddress1 || '',
                    address_line_2: !data.useShippingAsBilling ? data.shippingAddress2 || '' : data.billingAddress2 || '',
                    city: !data.useShippingAsBilling ? data.shippingCity || '' : data.billingCity || '',
                    region: !data.useShippingAsBilling ? data.shippingRegion || '' : data.billingRegion || '',
                    post_code: !data.useShippingAsBilling ? data.shippingPostcode || '' : data.billingPostcode || '',
                    country: !data.useShippingAsBilling ? data.shippingCountry || DEFAULT_COUNTRY : data.billingCountry || DEFAULT_COUNTRY
                },
                useShippingAsBilling: !data.useShippingAsBilling,
                payment_method: {
                    method: data.paymentMethod
                },
                total: (cartTotal + 0) - couponDiscount.value - (loyaltyRedemption.discountValue || 0),
                loyalty: loyaltyRedemption.isRedeemed,
                receive_promotions: data.marketingConsent || false
            };

            console.log('👤 [GUEST] Guest checkout and order payload:', guestOrderPayload);

            const response = await guestCheckoutAndOrder(guestOrderPayload);
            console.log("👤 [GUEST] guestCheckoutAndOrder response:", response);
            console.log("👤 [GUEST] response.status:", response.status);
            
            if (response.status == ServerActionStatus.SUCCESS) {
                // TypeScript now knows response.data exists because status is SUCCESS
                console.log("👤 [GUEST] response.data:", response.data);
                
                // Transform the guest checkout response to match the expected ORDER_RESPONSE_DATA structure
                // The guest API returns: { data: { order: { order_code, worldpay_url, ... } } }
                // But handlePlaceOrder expects: { data: { order_code, worldpay_url } }
                const guestResponseData = response.data as unknown as GuestCheckoutResponseData;
                const transformedResponse: ORDER_RESPONSE_DATA = {
                    message: 'Order placed successfully',
                    data: guestResponseData.order ? {
                        order_code: guestResponseData.order.order_code,
                        worldpay_url: guestResponseData.order.worldpay_url
                    } : {
                        order_code: '',
                        worldpay_url: ''
                    }
                };
                
                console.log('👤 [GUEST] Transformed response for handlePlaceOrder:', transformedResponse);
                console.log('👤 [GUEST] Calling handlePlaceOrder with:', {
                    payload: {
                        email: data.email,
                        phone: data.phone,
                        receive_promotions: data.marketingConsent || false,
                        shipping_address_id: 0,
                        shipping_address: guestOrderPayload.shipping_address,
                        billing_address: guestOrderPayload.billing_address,
                        useShippingAsBilling: guestOrderPayload.useShippingAsBilling,
                        couponCode: guestOrderPayload.couponCode,
                        shipping_method_id: guestOrderPayload.shipping_method_id,
                        payment_method: guestOrderPayload.payment_method,
                        total: guestOrderPayload.total,
                        loyalty: guestOrderPayload.loyalty
                    },
                    responseData: transformedResponse
                });
                
                await handlePlaceOrder({
                    email: data.email,
                    phone: data.phone,
                    receive_promotions: data.marketingConsent || false,
                    shipping_address_id: 0,
                    shipping_address: guestOrderPayload.shipping_address,
                    billing_address: guestOrderPayload.billing_address,
                    useShippingAsBilling: guestOrderPayload.useShippingAsBilling,
                    couponCode: guestOrderPayload.couponCode,
                    shipping_method_id: guestOrderPayload.shipping_method_id,
                    payment_method: guestOrderPayload.payment_method,
                    total: guestOrderPayload.total,
                    loyalty: guestOrderPayload.loyalty
                } as CHECKOUT_PAYLOAD, transformedResponse);
                form.reset();
                if (shippingMethods.length > 0) {
                    setSelectedCarrier(shippingMethods[0]);
                    setSelectedShippingMethod(shippingMethods[0]);
                    form.setValue('shippingMethodId', shippingMethods[0].id);
                }
                setShowNewAddressForm(false);
            } else {
                toast.error(response.message);
            }
            return;
        }

        // For authenticated users, use the existing place order flow
        const orderPayload: CHECKOUT_PAYLOAD = {
            email: data.email,
            phone: data.phone,
            receive_promotions: data.marketingConsent || false,
            shipping_address_id: data.selectedAddressId || 0,
            shipping_address: {
                first_name: data.shippingFirstName || '',
                last_name: data.shippingLastName || '',
                address_line_1: data.shippingAddress1 || '',
                address_line_2: data.shippingAddress2 || '',
                city: data.shippingCity || '',
                region: data.shippingRegion || '',
                country: data.shippingCountry || DEFAULT_COUNTRY,
                post_code: data.shippingPostcode || ''
            },
            billing_address: {
                first_name: !data.useShippingAsBilling ? data.shippingFirstName || '' : data.billingFirstName || '',
                last_name: !data.useShippingAsBilling ? data.shippingLastName || '' : data.billingLastName || '',
                address_line_1: !data.useShippingAsBilling ? data.shippingAddress1 || '' : data.billingAddress1 || '',
                address_line_2: !data.useShippingAsBilling ? data.shippingAddress2 || '' : data.billingAddress2 || '',
                city: !data.useShippingAsBilling ? data.shippingCity || '' : data.billingCity || '',
                region: !data.useShippingAsBilling ? data.shippingRegion || '' : data.billingRegion || '',
                country: !data.useShippingAsBilling ? data.shippingCountry || DEFAULT_COUNTRY : data.billingCountry || DEFAULT_COUNTRY,
                post_code: !data.useShippingAsBilling ? data.shippingPostcode || '' : data.billingPostcode || ''
            },
            useShippingAsBilling: !data.useShippingAsBilling,
            couponCode: couponDiscount.code || undefined,
            loyalty: loyaltyRedemption.isRedeemed,
            shipping_method_id: Number(selectedCarrier?.id) || 0,
            payment_method: {
                method: data.paymentMethod
            },
            total: (cartTotal + 0) - couponDiscount.value - (loyaltyRedemption.discountValue || 0)

        };;


        const response = await placeOrder(orderPayload);
        if (response.status == ServerActionStatus.SUCCESS) {
            await handlePlaceOrder(orderPayload, response.data);
            form.reset();
            if (shippingMethods.length > 0) {
                setSelectedCarrier(shippingMethods[0]);
                setSelectedShippingMethod(shippingMethods[0]);
                form.setValue('shippingMethodId', shippingMethods[0].id);
            }
            setShowNewAddressForm(false);
        } else {
           toast.error(response.message);
        }
         

    };

    const handleAddressSelect = (address: Address) => {

        form.setValue('selectedAddressId', address.id);
        form.setValue('shippingFirstName', address.name);
        form.setValue('shippingLastName', address.last_name);
        form.setValue('shippingAddress1', address.street);
        form.setValue('shippingAddress2', address.apartment || '');
        form.setValue('shippingAddress3', address.company_name || '');
        form.setValue('shippingCity', address.town);
        form.setValue('shippingRegion', address.region);
        form.setValue('shippingPostcode', address.post_code);
        form.setValue('shippingCountry', address.country || DEFAULT_COUNTRY);
        if (address.phone) {
            form.setValue('phone', address.phone);
        }

    }
    const handleShowNewAddressForm = () => {
        // reset the shipping address fields
        if (!showNewAddressForm) {
            form.reset({
                ...form.getValues(),
                selectedAddressId: 0,
                shippingFirstName: '',
                shippingLastName: '',
                shippingAddress1: '',
                shippingAddress2: '',
                shippingAddress3: '',
                shippingCity: '',
                shippingPostcode: '',
                shippingRegion: '',
                shippingCountry: DEFAULT_COUNTRY,
            });
        } else {
            handleAddressSelect(addresses[0]);
        }
        setShowNewAddressForm(!showNewAddressForm);
    }

    const handlePlaceSelect = (place: PlaceAutocompleteAddress) => {
        form.setValue('shippingAddress1', place.street);
        form.setValue('shippingCity', place.city);
        form.setValue('shippingPostcode', place.postcode);
        form.setValue('shippingCountry', place.country);
        form.setValue('shippingRegion', place.region);
    }

    const handleBillingPlaceSelect = (place: PlaceAutocompleteAddress) => {
        form.setValue('billingAddress1', place.street);
        form.setValue('billingCity', place.city);
        form.setValue('billingPostcode', place.postcode);
        form.setValue('billingCountry', place.country);
        form.setValue('billingRegion', place.region);
    }

    // Custom modal close handler to refresh cart data
    const handleModalClose = () => {
        fetchCartItems(); // Refresh cart data after potential changes in the modal
        onClose();
    };

    useEffect(() => {
        const loadProfile = async () => {
            const profile = await fetchProfile();
            form.setValue('email', profile?.email || '');
            form.setValue('phone', profile?.phone || '');
        }
        loadProfile();

    }, [fetchProfile, form]);

    useEffect(() => {
        if (!shippingMethodsData || shippingMethodsData.length === 0) {
            return;
        }

        const enabledMethods = shippingMethodsData
            .filter(method => method.is_enabled && !method.deletedAt)
            .sort((a, b) => a.method_order - b.method_order);

        setOriginalShippingMethods(enabledMethods);
        setShippingMethods(enabledMethods);

        if (enabledMethods.length > 0) {
            console.log('CheckoutDetails - Initial shipping method:', enabledMethods[0]);
            setSelectedCarrier(enabledMethods[0]);
            setSelectedShippingMethod(enabledMethods[0]);
            form.setValue('shippingMethodId', enabledMethods[0].id);
        }
    }, [shippingMethodsData, form, setSelectedShippingMethod]);

    useEffect(() => {
        setShippingAsBilling(form.watch('useShippingAsBilling'));
    }, [form.watch('useShippingAsBilling')]);

    useEffect(() => {
        if (originalShippingMethods.length === 0) return;

        // Use cartTotal (amount after deals are applied) for free shipping threshold calculation
        // cartTotal represents the subtotal after discounts/deals, not including shipping
        const amountAfterDeals = cartTotal;
        console.log("Amount after deals (cartTotal) for free shipping calculation:", amountAfterDeals);
        
        // Filter shipping methods based on the condition
        const filteredMethods = originalShippingMethods.filter((method) => {
            const isFreeShipping = method.is_free_shipping ?? false;
            const freeShippingThreshold = method.free_shipping_threshold;
            
            // Log for debugging
            console.log(`Shipping method ${method.id} (${method.shipping_method}): is_free_shipping = ${isFreeShipping}, free_shipping_threshold = ${freeShippingThreshold}, amount_after_deals = ${amountAfterDeals}`);
            
            // Condition: if (!is_free_shipping || (is_free_shipping && amount_after_deals >= free_shipping_threshold))
            if (!isFreeShipping) {
                return true; // Show non-free shipping methods
            }
            
            // For free shipping methods, check if threshold is met using amount after deals
            if (isFreeShipping) {
                const threshold = freeShippingThreshold ? parseFloat(freeShippingThreshold) : null;
                if (threshold === null) {
                    return true; // No threshold, show it
                }
                return amountAfterDeals >= threshold;
            }
            
            return false;
        });

        console.log('CheckoutDetails - Amount after deals for filtering:', amountAfterDeals);
        console.log('CheckoutDetails - Filtered shipping methods:', filteredMethods);

        setShippingMethods(filteredMethods);

        if (filteredMethods.length === 0) {
            setSelectedCarrier(null);
            form.setValue('shippingMethodId', 0);
            return;
        }

        const currentMethodId = form.getValues('shippingMethodId');
        const matchedMethod = filteredMethods.find((method) => method.id === currentMethodId);
        const nextMethod = matchedMethod || filteredMethods[0];

        setSelectedCarrier(nextMethod);
        setSelectedShippingMethod(nextMethod);
        form.setValue('shippingMethodId', nextMethod.id);
    }, [cartTotal, originalShippingMethods, form]);

    useEffect(() => {
        if (addresses.length > 0) {
            setShowNewAddressForm(false);
            form.setValue('selectedAddressId', addresses[0].id);
            handleAddressSelect(addresses[0]);
        }
    }, [addresses]);

    return (
        <div className='bg-skin-white p-3.5 sm:p-5 border border-skin-neutral-50 shadow-checkout rounded-md flex flex-col gap-5 w-full'>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    noValidate className='flex flex-col gap-5 lg:gap-7.5'>
                    <div className='space-y-6'>
                        {/* contact info */}
                        <div className='space-y-4 lg:space-y-6'>
                            <h2 className='text-title-2 lg:text-h5 text-skin-neutral-500 font-semibold'>Enter Contact Info</h2>
                            <div className='space-y-4 w-full'>
                                <InputForm
                                    control={form.control}
                                    name="email"
                                    type='email'
                                    label='Email Id'
                                    isRequired
                                    className='w-full'
                                />
                                <InputForm
                                    control={form.control}
                                    type='tel'
                                    name="phone"
                                    label={
                                        <div className='flex items-center gap-4'>
                                            <Flag className="group-data-[focus=true]:w-4 group-data-[filled=true]:w-4" />
                                            <div>
                                                Phone Number
                                                <span className='text-skin-red-400'> *</span>
                                            </div>
                                        </div>
                                    }
                                    inputClassName='ps-[25px]'
                                    className='w-full '
                                    pattern="[0-9]{3}-[0-9]{2}-[0-9]{3}"
                                />
                            </div>
                        </div>
                        <div className='space-y-4'>
                            <CustomCheckbox
                                control={form.control}
                                name="ageConfirmation"
                                label='I confirm that I am aged 18 or over *'
                            />
                        </div>

                        {/* shipping details */}
                        <div className='space-y-4 lg:space-y-6'>
                            <div className='flex items-center justify-between'>
                                <h3 className='text-title-2 lg:text-h5 text-skin-neutral-500 font-semibold'>Shipping Details</h3>
                                {addresses.length > 0 &&
                                    <Button
                                        type="button"
                                        size="sm"
                                        radius="sm"
                                        variant="bordered"
                                        color='default'
                                        className="btn shadow-button  !py-4 !px-6 max-md:!h-9.5"
                                        onPress={() => handleShowNewAddressForm()}
                                    >
                                        {showNewAddressForm ? 'Close' : '+ Add New Address'}
                                    </Button>
                                }
                            </div>
                            {!showNewAddressForm && addresses.length > 0 && (
                                <>
                                    <AddressList
                                        selectedAddressId={form.watch('selectedAddressId')}
                                        onAddressSelect={handleAddressSelect}
                                    />

                                </>
                            )}
                            {showNewAddressForm && (
                                <div className='space-y-4'>
                                    <div className='grid grid-cols-2 gap-2.5 md:gap-4'>
                                        <InputForm
                                            control={form.control}
                                            name="shippingFirstName"
                                            type='text'
                                            label='First Name'
                                            isRequired
                                            className='w-full'
                                        />
                                        <InputForm
                                            control={form.control}
                                            name="shippingLastName"
                                            type='text'
                                            label='Last Name'
                                            isRequired
                                            className='w-full'
                                        />
                                    </div>
                                    {/* <InputForm
                                        control={form.control}
                                        name="shippingAddress1"
                                        type='text'
                                        label='Start typing the first line of your address'
                                        isRequired
                                        className='w-full'
                                    /> */}
                                    <GooglePlacesAutocomplete
                                        control={form.control}
                                        name="shippingAddress1"
                                        onPlaceSelect={handlePlaceSelect}
                                        placeholder="Start typing your address here..."
                                        label="Street Address"
                                        isRequired
                                        inputClassName="w-full"
                                    />
                                    <InputForm
                                        control={form.control}
                                        name="shippingAddress2"
                                        type='text'
                                        label='Address Line 2 (optional)'
                                        className='w-full'
                                    />
                                    <InputForm
                                        control={form.control}
                                        name="shippingAddress3"
                                        type='text'
                                        label='Address Line 3 (optional)'
                                        className='w-full'
                                    />
                                    <div className='grid grid-cols-2 gap-2.5 md:gap-4'>
                                        <InputForm
                                            control={form.control}
                                            name="shippingCity"
                                            type='text'
                                            label='City'
                                            isRequired
                                            className='w-full'
                                        />
                                        <InputForm
                                            control={form.control}
                                            name="shippingPostcode"
                                            type='text'
                                            label='Postcode'
                                            isRequired
                                            className='w-full'
                                        />
                                    </div>
                                    <div className='grid grid-cols-2 gap-2.5 md:gap-4'>
                                        <InputForm
                                            control={form.control}
                                            name="shippingRegion"
                                            type='text'
                                            label='Region'
                                            isRequired
                                            className='w-full'
                                        />
                                        <InputForm
                                            control={form.control}
                                            name="shippingCountry"
                                            type='text'
                                            label='Country'
                                            isRequired
                                            className='w-full'
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* billing details */}
                        <div className='space-y-4 lg:space-y-6'>
                            <h3 className='text-title-2 lg:text-h5 text-skin-neutral-500 font-semibold'>Billing Details</h3>
                            <div className='flex flex-col space-y-5 w-full'>
                                <CustomCheckbox
                                    control={form.control}
                                    name="useShippingAsBilling"
                                    label='Use different billing details'
                                />
                                {form.watch('useShippingAsBilling') && (
                                    <div className='space-y-4'>
                                        <div className='grid grid-cols-2 gap-2.5 md:gap-4'>
                                            <InputForm
                                                control={form.control}
                                                name="billingFirstName"
                                                type='text'
                                                label='First Name'
                                                isRequired
                                                className='w-full'
                                            />
                                            <InputForm
                                                control={form.control}
                                                name="billingLastName"
                                                type='text'
                                                label='Last Name'
                                                isRequired
                                                className='w-full'
                                            />
                                        </div>
                                        <GooglePlacesAutocomplete
                                            control={form.control}
                                            name="billingAddress1"
                                            onPlaceSelect={handleBillingPlaceSelect}
                                            placeholder="Start typing your address here..."
                                            label="Address Line 1"
                                            isRequired
                                            inputClassName="w-full"
                                        />
                                        {/* <InputForm
                                            control={form.control}
                                            name="billingAddress1"
                                            type='text'
                                            label='Address Line 1'
                                            isRequired
                                            className='w-full'
                                        /> */}
                                        <InputForm
                                            control={form.control}
                                            name="billingAddress2"
                                            type='text'
                                            label='Address Line 2 (optional)'
                                            className='w-full'
                                        />
                                        <InputForm
                                            control={form.control}
                                            name="billingAddress3"
                                            type='text'
                                            label='Address Line 3 (optional)'
                                            className='w-full'
                                        />
                                        <div className='grid grid-cols-2 gap-2.5 md:gap-4'>
                                            <InputForm
                                                control={form.control}
                                                name="billingCity"
                                                type='text'
                                                label='City'
                                                isRequired
                                                className='w-full'
                                            />
                                            <InputForm
                                                control={form.control}
                                                name="billingPostcode"
                                                type='text'
                                                label='Postcode'
                                                isRequired
                                                className='w-full'
                                            />
                                        </div>
                                        <div className='grid grid-cols-2 gap-2.5 md:gap-4'>
                                            <InputForm
                                                control={form.control}
                                                name="billingRegion"
                                                type='text'
                                                label='Region'
                                                isRequired
                                                className='w-full'
                                            />
                                            <InputForm
                                                control={form.control}
                                                name="billingCountry"
                                                type='text'
                                                label='Country'
                                                isRequired
                                                className='w-full'
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* shipping methods */}
                        <div className='space-y-4'>
                            <div className='space-y-2'>
                                <h3 className='text-title-2 lg:text-h5 text-skin-neutral-500 font-semibold'>Shipping Methods</h3>
                                <p className='text-skin-neutral-300 text-content-2 md:text-title-2 font-semibold'>Important: Order by 3pm for same day dispatch</p>
                            </div>
                            {/* value={form.watch('paymentMethod')}
                            onChange={(e) => form.setValue('paymentMethod', e.target.value as CHECKOUT_PAYMENT_METHODS) */}
                            <RadioGroup
                                value={form.watch('shippingMethodId').toString()}

                                onChange={(e) => {
                                    const method = e.target.value;
                                    form.setValue('shippingMethodId', Number(method));
                                    const selectedMethod = shippingMethods.find(m => m.id.toString() === method.toString()) || shippingMethods[0];
                                    console.log('CheckoutDetails - Setting shipping method:', selectedMethod);
                                    setSelectedCarrier(selectedMethod);
                                    setSelectedShippingMethod(selectedMethod);
                                }}

                            >
                                {shippingMethods.map((method) => (
                                    <CustomRadio key={method.id} value={method.id.toString()}>
                                        <div className='space-y-2'>
                                            <div className='flex items-start justify-between gap-4'>
                                                <h4 className='text-content-2 md:text-title-2 font-semibold text-skin-neutral-400'>
                                                    {method.shipping_method}
                                                </h4>
                                                <p className='primary-gradient-100 text-content-2 md:text-lg font-semibold'>
                                                    £{method.shipping_cost}
                                                </p>
                                            </div>
                                            <p className='text-skin-neutral-300 text-content-3 md:text-content-1 font-semibold'>
                                                {method.description}
                                            </p>
                                        </div>
                                    </CustomRadio>
                                ))}
                            </RadioGroup>
                            {/* showing error message if shipping method is not selected */}
                            {form.formState.errors.shippingMethodId && (
                                <p className="text-danger text-tiny p-1">{form.formState.errors.shippingMethodId.message}</p>
                            )}
                        </div>

                        {/* never miss out */}
                        <div className='space-y-4'>
                            <h3 className='text-title-2 lg:text-h5 text-skin-neutral-500 font-semibold'>Never Miss Out</h3>
                            <div className='flex flex-col w-full'>
                                <CustomCheckbox
                                    control={form.control}
                                    name="marketingConsent"
                                    label='I want to receive updates about products and promotions. (Optional)'
                                />
                            </div>
                        </div>

                        {/* payment information */}
                        <div className='space-y-4 pt-2'>
                            <div className='space-y-2'>
                                <h3 className='text-title-2 lg:text-h5 text-skin-neutral-500 font-semibold'>Payment Information</h3>
                                <p className='text-skin-neutral-300 text-content-2 md:text-title-2 font-semibold'>All transactions are secure and encrypted. Credit card information is never stored on our servers.</p>
                            </div>
                            <RadioGroup
                                defaultValue={CHECKOUT_PAYMENT_METHODS.WORLD_PAY}
                                // defaultValue={CHECKOUT_PAYMENT_METHODS.VIVA_WALLET}
                                value={form.watch('paymentMethod')}
                                onChange={(e) => form.setValue('paymentMethod', e.target.value as CHECKOUT_PAYMENT_METHODS)}
                            >
                                {/* <CustomRadio value={CHECKOUT_PAYMENT_METHODS.VIVA_WALLET}>
                                    <div className='space-y-4'>
                                        <div className='flex items-center justify-between gap-4'>
                                            <h4 className='text-content-2 md:text-title-2 font-semibold text-skin-neutral-400'>Pay by Card - Viva Wallet</h4>
                                        </div>

                                    </div>
                                </CustomRadio> */}
                                <CustomRadio value={CHECKOUT_PAYMENT_METHODS.WORLD_PAY}>
                                    <div className='space-y-2'>
                                        <div className='flex items-center justify-between gap-4'>
                                            <h4 className='text-content-2 md:text-title-2 font-semibold text-skin-neutral-400'>Pay by Card - World pay</h4>
                                        </div>
                                    </div>
                                </CustomRadio>
                            </RadioGroup>
                            {/* showing error message if payment method is not selected */}
                            {form.formState.errors.paymentMethod && (
                                <p className='text-skin-red-400 text-content-2 md:text-content-1 '>{form.formState.errors.paymentMethod.message}</p>
                            )}
                        </div>

                        <div className='space-y-5'>
                            <p className='text-content-2 lg:text-title-2 text-skin-neutral-300 font-semibold'>
                                Your personal data will be used to process your order, support your experience throughout this website, and for other purposes described in our <a href="#">privacy policy.</a>
                            </p>
                            <div className='space-y-5'>
                                <CustomCheckbox
                                    control={form.control}
                                    name="termsAgreement"
                                    label={
                                        <a href="#" className='inline-block !text-content-2 md:!text-title-2 text-skin-neutral-300 font-semibold'>
                                            <span>I have read and agree to the website </span>terms and conditions *
                                        </a>
                                    }
                                />

                            </div>
                            <Button
                                type="submit"
                                size="lg"
                                radius="md"
                                color="primary"
                                className="w-full btn primary-btn shadow-button !text-skin-white !rounded-md text-content-1 md:text-2xl uppercase !py-1.5 !px-3"
                                isLoading={isProcessing}

                            >
                                Place Order Now
                            </Button>
                            <p className='text-content-2 lg:text-title-2 text-skin-neutral-300 font-semibold'>We Respect Your Privacy & Information</p>
                            <div className='flex items-center gap-5 flex-wrap justify-center'>
                                <a href="" className='primary-gradient-100 text-content-3 md:text-title-2 font-semibold'>Delivery Policy</a>
                                <a href="" className='primary-gradient-100 text-content-3 md:text-title-2 font-semibold'>Returns Policy</a>
                                <a href="" className='primary-gradient-100 text-content-3 md:text-title-2 font-semibold'>Privacy Policy</a>
                                <a href="" className='primary-gradient-100 text-content-3 md:text-title-2 font-semibold'>Terms of Service</a>
                            </div>
                        </div>
                    </div>
                </form>
            </Form>
            
            {/* Stock validation modal */}
            <UnavailableItemsModal 
                isOpen={isOpen} 
                onClose={handleModalClose}  
            />
        </div>
    );
};

export default CheckoutDetails;
