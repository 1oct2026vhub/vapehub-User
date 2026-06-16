"use client"
import { ServerActionStatus } from "@/lib/config/app.config";
import { ORDER, REFERRAL } from "@/lib/config/order.config";
import { Address } from "@/lib/config/user.config";
import { checkStockToPayment, cancelOrderById, placeOrder } from "@/lib/server.actions";
import {
    buildPlaceOrderPayloadFromOrder,
    parseWorldPayPlaceOrderData,
} from "@/lib/utils/checkout-order.utils";
import { Button } from '@nextui-org/button'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@nextui-org/modal'
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type OrderPaymentActionProps = {
    orderId: number;
    order: ORDER;
    referral?: REFERRAL | null;
    userAddresses?: Address[];
};

const OrderPaymentAction: React.FC<OrderPaymentActionProps> = ({
    orderId,
    order,
    referral,
    userAddresses,
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isCancelLoading, setIsCancelLoading] = useState(false);
    const { isOpen, onClose } = useDisclosure();

    const router = useRouter();

    const payNow = async () => {
        try {
            setIsLoading(true);

            const checkStockPayload = { orderId };
            console.log('[Pay Now] checkStockToPayment payload:', checkStockPayload);
            const stockResponse = await checkStockToPayment(orderId);
            console.log('[Pay Now] checkStockToPayment response:', stockResponse);

            if (stockResponse.status !== ServerActionStatus.SUCCESS) {
                toast.error(stockResponse.message);
                router.refresh();
                return;
            }

            const orderPayload = buildPlaceOrderPayloadFromOrder(order, {
                referral,
                userAddresses,
            });
            console.log('[Pay Now] placeOrder payload:', orderPayload);

            const placeOrderResponse = await placeOrder(orderPayload);
            console.log('[Pay Now] placeOrder response:', placeOrderResponse);

            if (placeOrderResponse.status !== ServerActionStatus.SUCCESS) {
                toast.error(placeOrderResponse.message);
                router.refresh();
                return;
            }

            const worldpayData = parseWorldPayPlaceOrderData(placeOrderResponse.data.data);
            if (!worldpayData?.worldpay_url) {
                toast.error('Payment URL not found. Please try again or contact support.');
                return;
            }

            window.location.href = worldpayData.worldpay_url;
        } catch (error) {
            console.error('[Pay Now] Error processing payment:', error);
            toast.error('An error occurred while processing payment. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }

    const handleCancelOrder = async () => {
        try {
            setIsCancelLoading(true);
            const response = await cancelOrderById(orderId);
            if (response.status === ServerActionStatus.SUCCESS) {
                toast.success('Order cancelled successfully');
                router.refresh();
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            console.error('Error cancelling order:', error);
        } finally {
            setIsCancelLoading(false);
            onClose();
        }
    };

    return (
        <>
            <div className='flex items-center gap-4'>
                <Button
                    size='md'
                    radius='sm'
                    color='primary'
                    onPress={payNow}
                    isLoading={isLoading}
                    isDisabled={isLoading}
                >Pay Now</Button>
            </div>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Confirm Order Cancellation</ModalHeader>
                            <ModalBody>
                                <p>Are you sure you want to cancel this order? This action cannot be undone.</p>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="default" variant="light" onPress={onClose}>
                                    Cancel
                                </Button>
                                <Button color="danger" onPress={handleCancelOrder} isLoading={isCancelLoading} className='!bg-skin-red-400'>
                                    Confirm Cancellation
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    )
}

export default OrderPaymentAction;
