"use client";
import Pagination from "@/components/Pagination";
import { ORDER_RESPONSE, PAGINATION } from "@/lib/config/order.config";
import { useRouter } from "next/navigation";
import { FunctionComponent } from "react";
import OrderListCard from "./OrderListCard";
import { ROUTES } from "@/lib/routes";

interface OrderListProps {
    orders: ORDER_RESPONSE[];
    pagination: PAGINATION;
}

const OrderList: FunctionComponent<OrderListProps> = ({ orders, pagination }) => {
    const router = useRouter();
    return (
        <div className="flex flex-col gap-4.5">
            {orders.map((order, index) => (
                <OrderListCard key={index} data={order} />
            ))}
            {orders.length > 0 && (
                <div className="flex justify-end">
                    <Pagination
                        total={pagination.total_pages}
                        currentPage={pagination.current_page}
                        onPageChange={(page) => router.push(`${ROUTES.MY_ACCOUNT_ORDERS}?page=${page}`)}
                    />
                </div>
            )}
        </div>
    )
}

export default OrderList;
