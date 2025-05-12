import { NextPage } from "next";
import React from "react";
import ReferralCard from "../../_components/ReferralCard";
import LogoutButton from "../../_components/LogoutButton";
import { AsyncReactElement, ServerActionStatus } from "@/lib/config/app.config";
import { getReferralStats } from "@/lib/server.actions"; 
import Link from "next/link"; 
import { ROUTES } from "@/lib/routes";
import EmptyPlaceholder from "@/components/ui/EmptyPlaceholder";
import MyReferrals from "../../_components/MyReferrals";

const AccountReferrals: NextPage = async (): Promise<AsyncReactElement> => {
    const response = await getReferralStats();
    
    if (response.status === ServerActionStatus.ERROR) {
        return <div>{response.message}</div>;
    }
    const { data } = response; 
   
   
    const recentReferrals = data.recent_referrals.filter(referral => (referral?.status === "completed" || referral?.status === "applied"));
      
    return (
        <main>
            {/* Rewards Section */}
            <div className="p-4 mb-6 bg-gradient-to-r from-skin-accent-50 to-skin-white rounded-14 shadow-card flex flex-col md:flex-row md:items-center md:justify-between border border-skin-neutral-50">
               
                 <MyReferrals referralMethods={data.referral_methods} coupons={data.referred_coupon_code} isReferral={(data.referrer?.status === "completed" || data.referrer?.status === "applied")}/>
                <div className="mt-6 md:mt-0 md:ml-8 flex-shrink-0">
                    <Link
                        href={ROUTES.REFERRAL}
                        className="inline-block px-6 py-3 bg-primary text-white font-semibold rounded-lg shadow hover:bg-skin-accent-500 transition-colors duration-200"
                    >
                        Refer a Friend
                    </Link>
                    
                </div>
            </div>
            {/* Referrals List */}
            <div className="p-4 bg-skin-white rounded-14 shadow-card space-y-6 w-full h-full md:min-h-[670px] border border-skin-neutral-50">
                <h2 className="text-title-2 md:text-title-1 text-skin-neutral-400 font-semibold">
                    My Referrals
                </h2>
                {recentReferrals.length > 0 ? (
                    recentReferrals.map((referral) => (
                        <ReferralCard key={referral.id} referral={referral} />
                    ))
                ) : (
                     <EmptyPlaceholder
                        title="No referrals yet"
                        description="You haven't referred any friends yet. Share your referral link with your friends to earn rewards."
                    />
                )}
            </div>

            <div className="flex md:hidden bg-skin-white p-4 rounded-14 shadow-card w-full mt-4">
                <LogoutButton className="mt-auto red-gradient-100 px-4 py-3 text-content-1 bg-skin-white font-semibold w-full rounded-lg" />
            </div>
        </main>
    );
};

export default AccountReferrals;
