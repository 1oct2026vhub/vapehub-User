"use client"

import { ReferralMethods } from "@/lib/config/referral.config";
import { Button } from "@nextui-org/button";
import { useState } from "react";

const MyReferrals = ({ referralMethods, coupons, isReferral,referredValue,referrerValue }: { referralMethods: ReferralMethods[]; coupons: string | null, isReferral: boolean, referredValue: string, referrerValue: string }) => {

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

    const referralDiscount = (primary: boolean) => {
        const referralMethod = referralMethods.find(method => method.primary === primary);
        return referralMethod?.referral_value_type === 'percentage' ? referralMethod?.referral_value + '%' : '-' + referralMethod?.referral_value;
    }
    console.log("referralDiscount", referralMethods);

    return (
        <div>
            <h3 className="text-title-3 md:text-title-2 font-semibold text-skin-neutral-400 mb-2">Referral Rewards</h3>
            {
                (!coupons || isReferral) ?

                    <p className="text-content-2 text-skin-neutral-300 mb-4 max-w-md">
                        Earn a discount coupon for every friend you refer! Share your referral link,
                        and when your friends sign up and make their first purchase, you both get rewarded coupon.
                        {/* You get {referralDiscount(true)} and your friend gets {referralDiscount(false)}. */}
                        You get {referrerValue}% and your friend gets {referredValue}%.
                    </p> :
                    <div className="flex flex-col gap-2">
                        <p className="text-content-2 text-skin-neutral-300 mb-4 max-w-md">
                            {`You have been invited to shop at VapeHub and you've got a ${referralDiscount(true)} discount waiting for you! Use the coupon code below to claim your offer.`}
                        </p>
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
                    </div>
            }
        </div>
    )
}

export default MyReferrals;
