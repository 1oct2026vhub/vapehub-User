import MyAccountHeading from "@/components/ui/MyAccountHeading";
import { Metadata, NextPage } from "next";
import React from "react";
import AccountSidebar from "../_components/AccountSidebar";
import OrderListCard from "@/app/(store)/(protected)/orders/_components/OrderListCard";
import Link from "next/link";

export const metadata: Metadata = {
    title: "My account | Orders",
    description: "",
};


const orders = [
    {
        status: "Order Confirmed",
        imageSrc: "/images/product-1.png",
        title: "RandM Tornado 9000 Puff Disposable Vape - Watermelon Skittles",
        orderId: "02456KS566JD444",
    },
    {
        status: "Order Confirmed",
        imageSrc: "/images/product-1.png",
        title: "RandM Tornado 9000 Puff Disposable Vape - Watermelon Skittles",
        orderId: "02456KS566JD444",
    },
    {
        status: "Order Confirmed",
        imageSrc: "/images/product-1.png",
        title: "RandM Tornado 9000 Puff Disposable Vape - Watermelon Skittles",
        orderId: "02456KS566JD444",
    },

];

const MyAccountOrders: NextPage = () => {

    return (
        <main className="px-4 lg:px-9 xl:px-12.5 pt-5 pb-10 flex flex-col gap-6 lg:gap-10">
            <MyAccountHeading />
            <section className="flex flex-col md:flex-row items-start justify-between gap-4">
                <AccountSidebar />
                <div className="p-4 bg-skin-white rounded-14 shadow-card space-y-4.5 w-full h-full md:min-h-[670px] border border-skin-neutral-50">
                    <h2 className="text-title-2 md:text-title-1 text-skin-neutral-400 font-semibold">My Orders</h2>
                    <div className="flex flex-col gap-4.5">
                        {orders.map((order, index) => (
                            <OrderListCard key={index} {...order} />
                        ))}
                    </div>
                </div>
                <div className="flex md:hidden bg-skin-white p-4 rounded-14 shadow-card w-full">
                    <Link href="/logout" className="mt-auto red-gradient-100 px-4 py-3 text-content-1 bg-skin-white font-semibold">
                        Logout
                    </Link>
                </div>
            </section>
        </main>
    );
};

export default MyAccountOrders;
