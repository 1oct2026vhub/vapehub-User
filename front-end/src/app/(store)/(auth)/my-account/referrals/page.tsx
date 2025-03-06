'use client'

import MyAccountHeading from "@/components/ui/MyAccountHeading";
import { NextPage } from "next";
import React from "react";
import AccountSidebar from "../_components/AccountSidebar";
import Link from "next/link";
import ReferralCard from "../_components/ReferralCard";

const AccountReferrals: NextPage = () => {

    return (
        <main className="px-4 lg:px-9 xl:px-12.5 pt-5 pb-10 flex flex-col gap-6 lg:gap-10">
            <MyAccountHeading />
            <section className="flex flex-col md:flex-row items-start justify-between gap-4">
                <AccountSidebar />

                <div className="p-4 bg-skin-white rounded-14 shadow-card space-y-6 w-full h-full md:min-h-[670px] border border-skin-neutral-50">
                    <h2 className="text-title-2 md:text-title-1 text-skin-neutral-400 font-semibold">
                        My Referrals
                    </h2>
                    <ReferralCard />
                    <ReferralCard />
                </div>

                <div className="flex md:hidden bg-skin-white p-4 rounded-14 shadow-card w-full">
                    <Link
                        href="/logout"
                        className="mt-auto red-gradient-100 px-4 py-3 text-content-1 font-semibold w-full rounded-lg"
                    >
                        Logout
                    </Link>
                </div>
            </section>
        </main>
    );
};

export default AccountReferrals;
