"use client"
import { ServerActionStatus } from '@/lib/config/app.config';
import { ReferralStatsResponse } from '@/lib/config/referral.config';
import { getUserProfile } from '@/lib/server.actions';
import { Button } from '@nextui-org/button'
import React, { useEffect, useState } from 'react'

interface ReferralCardProps {
    referral: ReferralStatsResponse['recent_referrals'][number];
}

const ReferralCard: React.FC<ReferralCardProps> = ({ referral }) => {
    const { user } = referral;
    const [referralCode, setReferralCode] = useState("");
    const [copied, setCopied] = useState(false);
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const shareUrl = `${baseUrl}?referral_code=${referralCode}`;
    
    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };
  
    useEffect(() => {
        const getProfile = async ()  => {
            const response = await getUserProfile();
            const _referralCode = response.status === ServerActionStatus.SUCCESS ? response.data?.referral_code: "";
            setReferralCode(_referralCode)
        }
        getProfile()
    });

    return (
        <div className="bg-skin-white p-4 flex items-start justify-between gap-5 shadow-card rounded-14">
            <div className="space-y-1">
                <h3 className="text-title-2 md:text-title-1 text-skin-neutral-400 font-semibold capitalize">
                    {user.name === "null null" ? "Anonymous" : user.name}
                </h3>
                <p className="text-content-2 md:text-content-1 font-bold primary-gradient-100">
                    {user.email}
                </p>
            </div>
          
            <div className="space-y-2.5 text-right">
                <h4 className="text-title-2 md:text-title-1 text-skin-neutral-400 font-semibold">
                    {referralCode}
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
    )
}

export default ReferralCard
