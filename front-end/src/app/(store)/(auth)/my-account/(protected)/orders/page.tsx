import MyAccountHeading from "@/components/ui/MyAccountHeading";
import { Metadata, NextPage } from "next";
import React from "react"; 
import LogoutButton from "../../_components/LogoutButton";
import { getOrdersList } from "@/lib/server.actions";
import { ServerActionStatus } from "@/lib/config/app.config";
import EmptyPlaceholder from "@/components/ui/EmptyPlaceholder";
import OrderList from "./_components/OrderList";
import { ORDER_RESPONSE } from "@/lib/config/order.config";

export const metadata: Metadata = {
    title: "My account | Orders",
    description: "",
};
 
const MyAccountOrders: NextPage<{searchParams: {page: string}}> = async ({searchParams}) => {    
    const LIMIT = 10
    const page = searchParams.page ? parseInt(searchParams.page) : 1;
    const result = await getOrdersList(page, LIMIT);
    if (result.status === ServerActionStatus.ERROR) {
        return <p>{result.message}</p>   
    }
     
    const orders:ORDER_RESPONSE[] = result.data.orders;
    
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
                    <OrderList orders={orders} pagination={result.data.pagination} />
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
