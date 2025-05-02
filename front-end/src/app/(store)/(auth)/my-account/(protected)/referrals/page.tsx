import { NextPage } from "next";
import React from "react";
import ReferralCard from "../../_components/ReferralCard";
import LogoutButton from "../../_components/LogoutButton";
import { AsyncReactElement, ServerActionStatus } from "@/lib/config/app.config";
import { getReferralStats } from "@/lib/server.actions"; 
import Link from "next/link"; 
import { ROUTES } from "@/lib/routes";

const AccountReferrals: NextPage = async (): Promise<AsyncReactElement> => {
    const response = await getReferralStats();
    
    if (response.status === ServerActionStatus.ERROR) {
        return <div>{response.message}</div>;
    }
    const { data } = response; 
    return (
        <main>
            {/* Rewards Section */}
            <div className="p-4 mb-6 bg-gradient-to-r from-skin-accent-50 to-skin-white rounded-14 shadow-card flex flex-col md:flex-row md:items-center md:justify-between border border-skin-neutral-50">
                <div>
                    <h3 className="text-title-3 md:text-title-2 font-semibold text-skin-neutral-400 mb-2">Referral Rewards</h3>
                    <p className="text-content-2 text-skin-neutral-300 mb-4 max-w-md">
                        Earn points for every friend you refer! Share your referral link, and when your friends sign up and make their first purchase, you both get rewarded. Points can be redeemed for discounts and special offers.
                    </p>
                    <div className="flex flex-wrap gap-6">
                        <div className="flex flex-col items-start">
                            <span className="text-skin-neutral-500 text-sm">Total Points</span>
                            <span className="text-title-2 font-bold text-skin-accent-400">{data.total_points}</span>
                        </div>
                        <div className="flex flex-col items-start">
                            <span className="text-skin-neutral-500 text-sm">Total Referrals</span>
                            <span className="text-title-2 font-bold">{data.recent_referrals.length}</span>
                        </div>
                        {/* <div className="flex flex-col items-start">
                            <span className="text-skin-neutral-500 text-sm">Registered & Purchased</span>
                            <span className="text-title-2 font-bold">{data.total_referrals}</span>
                        </div> */}
                        <div className="flex flex-col items-start">
                            <span className="text-skin-neutral-500 text-sm">Pending Referrals</span>
                            <span className="text-title-2 font-bold">{data.pending_referrals}</span>
                        </div>
                    </div>
                </div>
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
                 {data.recent_referrals.map((referral) => (
                    <ReferralCard key={referral.id} referral={referral} />
                 ))}
            </div>
            <div className="flex md:hidden bg-skin-white p-4 rounded-14 shadow-card w-full mt-4">
                <LogoutButton className="mt-auto red-gradient-100 px-4 py-3 text-content-1 bg-skin-white font-semibold w-full rounded-lg" />
            </div>
        </main>
    );
};

export default AccountReferrals;
