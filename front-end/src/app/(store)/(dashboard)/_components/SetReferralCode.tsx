"use client";
import { setCookie } from 'cookies-next';
import { useEffect } from 'react';
const SetReferralCode: React.FC<{referralCode: string}> = ({referralCode}) => {
    useEffect(() => {
        if (referralCode) {
            setCookie('referral_code', referralCode);
        }
    }, [referralCode]);
    return (
        <></>
    )
}

export default SetReferralCode;
