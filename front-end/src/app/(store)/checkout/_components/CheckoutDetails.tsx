import { CustomRadio } from '@/components/CustomRadio'
import CustomCheckbox from '@/components/FormCheckbox'
import InputForm from '@/components/InputForm'
import Flag from '@/components/ui/Flag'
import { Button, RadioGroup } from '@nextui-org/react'
import React from 'react'

const CheckoutDetails: React.FC = () => {
    return (
        <div className='bg-skin-white p-3.5 sm:p-5 border border-skin-neutral-50 shadow-checkout rounded-14 flex flex-col gap-5 w-full'>
            <form className='flex flex-col gap-5 lg:gap-7.5'>
                <div className='space-y-3.5 lg:space-y-5'>
                    {/* contact info */}
                    <div className='space-y-4 lg:space-y-6'>
                        <h2 className='text-title-2 lg:text-h5 text-skin-neutral-500 font-bold'>Enter Contact Info</h2>
                        <div className='space-y-4 w-full'>
                            <InputForm
                                type='email'
                                label='Email Id'
                                isRequired
                                className='w-full'
                            />
                            <InputForm
                                type='tel'
                                label={
                                    <div className='flex items-center gap-4'>
                                        <Flag className="group-data-[focus=true]:w-4" />
                                        <div>
                                            Phone Number
                                            <span className='text-skin-red-400'> *</span>
                                        </div>
                                    </div>
                                }
                                className='w-full'
                                pattern="[0-9]{3}-[0-9]{2}-[0-9]{3}"
                            />
                        </div>
                    </div>
                    <CustomCheckbox label='I confirm that I am aged 18 or over *' />

                    {/* shipping details */}
                    <div className='space-y-4 lg:space-y-6'>
                        <h2 className='text-title-2 lg:text-h5 text-skin-neutral-500 font-bold'>Shipping Details</h2>
                        <div className='space-y-4'>
                            <div className='grid grid-cols-2 gap-2.5 md:gap-4'>
                                <InputForm
                                    type='text'
                                    label='First Name'
                                    isRequired
                                    className='w-full'
                                />
                                <InputForm
                                    type='text'
                                    label='Last Name'
                                    isRequired
                                    className='w-full'
                                />
                            </div>
                            <InputForm
                                type='text'
                                label='Start typing the first line of your address'
                                isRequired
                                className='w-full'
                            />
                            <InputForm
                                type='text'
                                label='Address Line 2'
                                isRequired
                                className='w-full'
                            />
                            <InputForm
                                type='text'
                                label='Address Line 3'
                                className='w-full'
                            />
                            <div className='grid grid-cols-2 gap-2.5 md:gap-4'>
                                <InputForm
                                    type='text'
                                    label='City'
                                    isRequired
                                    className='w-full'
                                />
                                <InputForm
                                    type='tel'
                                    label='Pincode'
                                    isRequired
                                    className='w-full'
                                />
                            </div>
                            <div className='grid grid-cols-2 gap-2.5 md:gap-4'>
                                <InputForm
                                    type='text'
                                    label='State'
                                    isRequired
                                    className='w-full'
                                />
                                <InputForm
                                    type='text'
                                    label='Country'
                                    isRequired
                                    className='w-full'
                                />
                            </div>
                        </div>
                    </div>

                    {/* billing details */}
                    <div className='space-y-4 lg:space-y-6'>
                        <h2 className='text-title-2 lg:text-h5 text-skin-neutral-500 font-bold'>Billing Details</h2>
                        <div className='flex flex-col space-y-5 w-full'>
                            <CustomCheckbox label='Use same as shipping details' />
                            <CustomCheckbox label='Use different billing details' />
                        </div>
                    </div>

                    {/* shipping methods */}
                    <div className='space-y-4'>
                        <div className='space-y-2'>
                            <h2 className='text-title-2 lg:text-h5 text-skin-neutral-500 font-bold'>Shipping Methods</h2>
                            <h3 className='text-skin-neutral-300 text-content-2 md:text-title-2 font-bold'>Important: Order by 3pm for same day dispatch</h3>
                        </div>
                        <RadioGroup defaultValue="3">
                            <CustomRadio value="1">
                                <div className='space-y-2 md:-mt-1'>
                                    <div className='flex items-center justify-between gap-4'>
                                        <h4 className='text-content-2 md:text-title-2 font-semibold text-skin-neutral-400'>Royal Mail Tracked 48 - <span className='font-bold'>2 to 4 working days</span></h4>
                                        <p className='primary-gradient-100 text-content-2 md:text-lg font-semibold'>£10.02</p>
                                    </div>
                                    <p className='text-skin-neutral-300 text-content-3 md:text-content-1 font-bold'>&bull; Free for orders over £30</p>
                                </div>
                            </CustomRadio>
                            <CustomRadio value="2">
                                <div className='space-y-2 md:-mt-1'>
                                    <div className='flex items-center justify-between gap-4'>
                                        <h4 className='text-content-2 md:text-title-2 font-semibold text-skin-neutral-400'>Royal Mail Tracked 24 - <span className='font-bold'>1 to 2 working days</span></h4>
                                        <p className='primary-gradient-100 text-content-2 md:text-lg font-semibold'>£12.22</p>
                                    </div>
                                </div>
                            </CustomRadio>
                            <CustomRadio value="3">
                                <div className='space-y-2 md:-mt-1'>
                                    <div className='flex items-center justify-between gap-4'>
                                        <h4 className='text-content-2 md:text-title-2 font-semibold text-skin-neutral-400'>Royal Mail Next Day Guaranteed</h4>
                                        <p className='primary-gradient-100 text-content-2 md:text-lg font-semibold'>£15.59</p>
                                    </div>
                                </div>
                            </CustomRadio>
                            <CustomRadio value="4">
                                <div className='space-y-2 md:-mt-1'>
                                    <div className='flex items-center justify-between gap-4'>
                                        <h4 className='text-content-2 md:text-title-2 font-semibold text-skin-neutral-400'>DPD Next Day Delivery</h4>
                                        <p className='primary-gradient-100 text-content-2 md:text-lg font-semibold'>£16.85</p>
                                    </div>
                                    <p className='text-skin-neutral-300 text-content-3 md:text-content-1 font-bold'>&bull; This is not a guaranteed service</p>
                                </div>
                            </CustomRadio>
                        </RadioGroup>
                    </div>

                    {/* never miss out */}
                    <div className='space-y-4'>
                        <h2 className='text-title-2 lg:text-h5 text-skin-neutral-500 font-bold'>Never Miss Out</h2>
                        <div className='flex flex-col w-full'>
                            <CustomCheckbox label='I want to receive updates about products and promotions. (Optional)' />
                        </div>
                    </div>

                    {/* shipping methods */}
                    <div className='space-y-4'>
                        <div className='space-y-2'>
                            <h2 className='text-title-2 lg:text-h5 text-skin-neutral-500 font-bold'>Payment Information</h2>
                            <h3 className='text-skin-neutral-300 text-content-2 md:text-title-2 font-bold'>All transactions are secure and encrypted. Credit card information is never stored on our servers.</h3>
                        </div>
                        <RadioGroup defaultValue="1">
                            <CustomRadio value="1">
                                <div className='space-y-4'>
                                    <div className='flex items-center justify-between gap-4'>
                                        <h4 className='text-content-2 md:text-title-2 font-semibold text-skin-neutral-400'>Pay by Card - VivaWallet</h4>
                                    </div>
                                    <div className='space-y-4'>
                                        <InputForm
                                            type='tel'
                                            label='Card Number'
                                            isRequired
                                            className='w-full'
                                        />
                                        <div className='grid grid-cols-2 gap-2.5 md:gap-4'>
                                            <InputForm
                                                type='tel'
                                                label='Expiry (MM/YY)'
                                                isRequired
                                                className='w-full'
                                            />
                                            <InputForm
                                                type='tel'
                                                label='CVC'
                                                isRequired
                                                className='w-full'
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CustomRadio>
                            <CustomRadio value="2">
                                <div className='space-y-2'>
                                    <div className='flex items-center justify-between gap-4'>
                                        <h4 className='text-content-2 md:text-title-2 font-semibold text-skin-neutral-400'>Pay by Card - Worldpay</h4>
                                    </div>
                                </div>
                            </CustomRadio>
                        </RadioGroup>
                    </div>

                    <div className='space-y-5'>
                        <p className='text-content-2 lg:text-title-2 text-skin-neutral-300 font-bold'>Your personal data will be used to process your order, support your experience throughout this website, and for other purposes described in our <a href="#">privacy policy.</a></p>
                        <div className='flex items-center'>
                            <CustomCheckbox label="" />
                            <a href="#" className='inline-block !text-content-2 md:!text-title-2 text-skin-neutral-300 font-bold'> <span>I have read and agree to the website  </span>terms and conditions *</a>
                        </div>
                        <Button
                            size="lg"
                            radius="md"
                            color="primary"
                            className="w-full btn primary-btn shadow-button !text-skin-white !rounded-10 text-content-1 md:text-title-1 !py-4 !px-6 max-md:!h-9.5"
                        >
                            Place Order Now
                        </Button>
                        <p className='text-content-2 lg:text-title-2 text-skin-neutral-300 font-bold'>We Respect Your Privacy & Information</p>
                        <div className='flex items-center gap-5 flex-wrap justify-center'>
                            <a href="" className='primary-gradient-100 text-content-3 md:text-content-1 font-semibold'>Delivery Policy</a>
                            <a href="" className='primary-gradient-100 text-content-3 md:text-content-1 font-semibold'>Returns Policy</a>
                            <a href="" className='primary-gradient-100 text-content-3 md:text-content-1 font-semibold'>Privacy Policy</a>
                            <a href="" className='primary-gradient-100 text-content-3 md:text-content-1 font-semibold'>Terms of Service</a>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default CheckoutDetails
