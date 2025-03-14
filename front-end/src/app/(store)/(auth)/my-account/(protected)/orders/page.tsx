import MyAccountHeading from "@/components/ui/MyAccountHeading";
import { Metadata, NextPage } from "next";
import React from "react";
import OrderListCard from "@/app/(store)/(protected)/orders/_components/OrderListCard";
import LogoutButton from "../../_components/LogoutButton";

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
        <main>
            <MyAccountHeading />
            <div className="p-4 bg-skin-white rounded-14 shadow-card space-y-4.5 w-full h-full md:min-h-[670px] border border-skin-neutral-50">
                <div className="flex flex-col gap-4.5">
                    {orders.map((order, index) => (
                        <OrderListCard key={index} {...order} />
                    ))}
                </div>
            </div>
            <div className="flex md:hidden bg-skin-white p-4 rounded-14 shadow-card w-full mt-4">
                <LogoutButton className="mt-auto red-gradient-100 px-4 py-3 text-content-1 bg-skin-white font-semibold" />
            </div>
        </main>
    );
};

export default MyAccountOrders;
