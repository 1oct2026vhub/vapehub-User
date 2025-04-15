'use client'

 import { NextPage } from "next";
import React from "react";
import ReferralCard from "../../_components/ReferralCard";
import LogoutButton from "../../_components/LogoutButton";

const AccountReferrals: NextPage = () => {
    return (
        <main>
             
            <div className="p-4 bg-skin-white rounded-14 shadow-card space-y-6 w-full h-full md:min-h-[670px] border border-skin-neutral-50">
                <h2 className="text-title-2 md:text-title-1 text-skin-neutral-400 font-semibold">
                    My Referrals
                </h2>
                <ReferralCard />
                <ReferralCard />
            </div>
            <div className="flex md:hidden bg-skin-white p-4 rounded-14 shadow-card w-full mt-4">
                <LogoutButton className="mt-auto red-gradient-100 px-4 py-3 text-content-1 bg-skin-white font-semibold w-full rounded-lg" />
            </div>
        </main>
    );
};

export default AccountReferrals;
