"use client"
import { ServerActionStatus } from "@/lib/config/app.config";
import { useVivaWallet } from "@/lib/hooks/useVivaWallet";
import { cancelOrderById, checkStockToPayment } from "@/lib/server.actions";
import { Button } from '@nextui-org/button'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@nextui-org/modal'
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const OrderPaymentAction: React.FC<{ orderId: number }> = ({ orderId }) => {
    const { initiatePayment } = useVivaWallet();
    const [isLoading, setIsLoading] = useState(false);
    const [isCancelLoading, setIsCancelLoading] = useState(false);
    const { isOpen,
      //  onOpen, 
       onClose } = useDisclosure();

    const router = useRouter();

    const payNow = async () => {
        try {
            setIsLoading(true);
            const response = await checkStockToPayment(orderId);
            if (response.status === ServerActionStatus.SUCCESS) {
                await initiatePayment({
                    orderReference: response.data.order_code,
                });
            } else {
                toast.error(response.message);
                router.refresh();
            }
        } catch (error) {
            console.error('Error initiating payment:', error);
            toast.error('Failed to initiate payment. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

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
                {/* <Button
                    size='md'
                    radius='sm'
                    color='danger'
                    onPress={onOpen}
                    isLoading={isCancelLoading}
                    isDisabled={isCancelLoading}
                    className="!bg-skin-red-400"
                >Cancel Order</Button> */}
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
