"use client"

import { ReferralMethods, ReferralStatsResponse } from "@/lib/config/referral.config";
import { Button } from "@nextui-org/button";
import { useState } from "react";

// Extended interface to match the actual API response
interface ExtendedReferralMethods extends ReferralMethods {
    refer_type?: 'referrer' | 'referral';
}

const MyReferrals = ({ referralMethods, data, coupons, isReferral }: { 
    referralMethods: ExtendedReferralMethods[]; 
    data: ReferralStatsResponse | null; 
    coupons: string | null, 
    isReferral: boolean
}) => {

    const [copied, setCopied] = useState(false);

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(coupons || '');
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const referralDiscount = (referType: 'referrer' | 'referral') => {
        // If referrer data exists, use it directly
        if (referType === 'referrer' && data?.referrer) {
            if (data.referrer.referral_value_type === 'percentage') {
                return data.referrer.referral_value + '%';
            } else if (data.referrer.referral_value_type === 'fixed') {
                return '£' + data.referrer.referral_value;
            }
        }        
        // Fallback to referral methods - only consider active ones
        const referralMethod = referralMethods.find(method => 
            method.refer_type === referType && 
            method.status === 'active'
        );
        if (!referralMethod) return null;
        
        if (referralMethod.referral_value_type === 'percentage') {
            return referralMethod.referral_value + '%';
        } else if (referralMethod.referral_value_type === 'fixed') {
            return '£' + referralMethod.referral_value;
        }
        return null;
    }

    // Helper function to format referrer's referral value
    const formatReferrerValue = () => {
        if (data?.referrer) {
            if (data.referrer.referral_value_type === 'percentage') {
                return data.referrer.referral_value + '%';
            } else if (data.referrer.referral_value_type === 'fixed') {
                return '£' + data.referrer.referral_value;
            }
        }
        // For coupon section, we want to get the value regardless of status
        const referralMethod = referralMethods.find(method => 
            method.refer_type === 'referrer'
        );
        if (referralMethod) {
            if (referralMethod.referral_value_type === 'percentage') {
                return referralMethod.referral_value + '%';
            } else if (referralMethod.referral_value_type === 'fixed') {
                return '£' + referralMethod.referral_value;
            }
        }
        return null;
    }

    // Helper function to check if referrer value is valid (not null, 0, or empty)
    const hasValidReferrerValue = () => {
        const value = formatReferrerValue();
        if (!value) return false;
        
        // Check if it's 0% or £0
        if (value === '0%' || value === '£0' || value === '0') return false;
        
        return true;
    }

    // Helper function to check if referral method is active
    const isReferralMethodActive = (referType: 'referrer' | 'referral') => {
        const referralMethod = referralMethods.find(method => 
            method.refer_type === referType
        );
        return referralMethod?.status === 'active';
    }

    // Helper function to check if referral discount is valid (not null, 0, or empty)
    const hasValidReferralDiscount = (referType: 'referrer' | 'referral') => {
        // First check if the method is active
        if (!isReferralMethodActive(referType)) return false;
        
        const discount = referralDiscount(referType);
        if (!discount) return false;
        
        // Check if it's 0% or £0
        if (discount === '0%' || discount === '£0' || discount === '0') return false;
        
        return true;
    }

    // Helper function to generate appropriate message based on referral discounts
    const getReferralMessage = () => {
        const referrerDiscountValue = referralDiscount('referrer');
        const referralDiscountValue = referralDiscount('referral');
        
        const hasReferrerDiscount = hasValidReferralDiscount('referrer');
        const hasReferralDiscount = hasValidReferralDiscount('referral');
        const isReferrerActive = isReferralMethodActive('referrer');
        const isReferralActive = isReferralMethodActive('referral');

        // If neither method is active, show generic message
        if (!isReferrerActive && !isReferralActive) {
            return "Share the experience. Invite your friends to VapeHub and help them discover a better way to vape."
        }
          
        // If both methods are active and have valid discounts
        if (hasReferrerDiscount && hasReferralDiscount) {
            return `Earn a discount coupon for every friend you refer! Share your referral link, and when your friends sign up and make their first purchase, you both get rewarded. You get ${referrerDiscountValue} discount and your friend gets ${referralDiscountValue} discount.`;
        }
        
        // If only referrer is active and has valid discount
        if (hasReferrerDiscount && !hasReferralDiscount) {
            return `Earn a discount coupon for every friend you refer! Share your referral link, and when your friends sign up and make their first purchase, you get ${referrerDiscountValue} discount.`;
        }
        
        // If only referral is active and has valid discount
        if (!hasReferrerDiscount && hasReferralDiscount) {
            return `Help your friends discover VapeHub! Share your referral link, and when your friends sign up and make their first purchase, they get ${referralDiscountValue} discount.`;
        }
        
        // If methods are active but have no valid discounts (0% or £0)
        if (isReferrerActive || isReferralActive) {
            return "Share the experience. Invite your friends to VapeHub and help them discover a better way to vape."
        }        
        return "Share the experience. Invite your friends to VapeHub and help them discover a better way to vape."
    }    
    return (
        <div>
            <h3 className="text-title-3 md:text-title-2 font-semibold text-skin-neutral-400 mb-2">Referral Rewards</h3>
            {
                (!coupons || isReferral) ?

                    <p className="text-content-2 text-skin-neutral-300 mb-4 max-w-md">
                        {getReferralMessage()}
                    </p> :
                    <div className="flex flex-col gap-2">
                        <p className="text-content-2 text-skin-neutral-300 mb-4 max-w-md">
                            {data?.referrer && hasValidReferrerValue() ? 
                                `You have been invited to shop at VapeHub and you've got a ${formatReferrerValue()} discount waiting for you! Use the coupon code below to claim your offer.` :
                                'Share the experience. Invite your friends to VapeHub and help them discover a better way to vape.'
                            }
                        </p>

                        {!isReferral && data?.referrer?.referral_value !== '0' &&
                        <div className="flex items-center gap-2">
                            <h4 className="text-title-2 md:text-title-1 text-skin-neutral-400 font-semibold">
                                {coupons}
                            </h4>
                            <Button
                                size="sm"
                                color='primary'
                                className="bg-skin-neutral-500 rounded-10"
                                onPress={copyToClipboard}
                            >
                                {copied ? 'Copied!' : 'Copy Code'}
                            </Button>
                        </div>
                     }
                    </div>
            }
        </div>
    )
}

export default MyReferrals;