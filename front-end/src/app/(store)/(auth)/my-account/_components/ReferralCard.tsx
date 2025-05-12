"use client"
import { ReferralStatsResponse } from '@/lib/config/referral.config';
import { Button } from '@nextui-org/button'
import React, { useState } from 'react'

interface ReferralCardProps {
    referral: ReferralStatsResponse['recent_referrals'][number];
}

const ReferralCard: React.FC<ReferralCardProps> = ({ referral }) => {
    const { referred_user } = referral;   
    const [copied, setCopied] = useState(false);
    
    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(referral.referral_coupon_code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    }; 

    return (
        <div className="bg-skin-white p-4 flex items-start justify-between gap-5 shadow-card rounded-14">
            <div className="space-y-1">
                <h3 className="text-title-2 md:text-title-1 text-skin-neutral-400 font-semibold capitalize">
                    {referred_user?.name === "null null" ? "Anonymous" : referred_user?.name}
                </h3>
                <p className="text-content-2 md:text-content-1 font-bold primary-gradient-100">
                    {referred_user?.email}
                </p>
            </div>
            {referral.status === "applied" ? (
                <p className="text-content-2 md:text-content-1 font-bold primary-gradient-100">
                    Applied
                </p>
            ) : (
                <div className="space-y-2.5 text-right">
                    <h4 className="text-title-2 md:text-title-1 text-skin-neutral-400 font-semibold">
                    {referral.referral_coupon_code}
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
            )}
        </div>
    )
}

export default ReferralCard
