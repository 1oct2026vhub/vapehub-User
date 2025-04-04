import MyAccountHeading from "@/components/ui/MyAccountHeading";
import { Metadata, NextPage } from "next";
import React from "react";
import OrderListCard from "@/app/(store)/(protected)/orders/_components/OrderListCard";
import LogoutButton from "../../_components/LogoutButton";
import { getOrdersList } from "@/lib/server.actions";
import { ServerActionStatus } from "@/lib/config/app.config";
import EmptyPlaceholder from "@/components/ui/EmptyPlaceholder";

export const metadata: Metadata = {
    title: "My account | Orders",
    description: "",
};

// const orders = [
//     {
//         status: "Order Confirmed",
//         imageSrc: "/images/product-1.png",
//         title: "RandM Tornado 9000 Puff Disposable Vape - Watermelon Skittles",
//         orderId: "02456KS566JD444",
//     },
//     {
//         status: "Order Confirmed",
//         imageSrc: "/images/product-1.png",
//         title: "RandM Tornado 9000 Puff Disposable Vape - Watermelon Skittles",
//         orderId: "02456KS566JD444",
//     },
//     {
//         status: "Order Confirmed",
//         imageSrc: "/images/product-1.png",
//         title: "RandM Tornado 9000 Puff Disposable Vape - Watermelon Skittles",
//         orderId: "02456KS566JD444",
//     },
// ];


const MyAccountOrders: NextPage = async () => {
    const result = await getOrdersList();
    if (result.status === ServerActionStatus.ERROR) {
        return <p>{result.message}</p>   
    }
    const orders = result.data;
    
     return (
        <main>
            <MyAccountHeading />
            <div className="p-4 bg-skin-white rounded-14 shadow-card space-y-4.5 w-full h-full md:min-h-[670px] border border-skin-neutral-50">
                {
                    orders.length === 0 ?
                    <EmptyPlaceholder 
                    title="No orders found"
                    description="You haven't placed any orders yet."
                    className="h-full"
                />:
                <div className="flex flex-col gap-4.5">
                    {orders.map((order, index) => (
                        <OrderListCard key={index} {...order} />
                    ))}
                </div>
                }
            </div>
            <div className="flex md:hidden bg-skin-white p-4 rounded-14 shadow-card w-full mt-4">
                <LogoutButton className="mt-auto red-gradient-100 px-4 py-3 text-content-1 bg-skin-white font-semibold" />
            </div>
        </main>
    );
};

export default MyAccountOrders;
