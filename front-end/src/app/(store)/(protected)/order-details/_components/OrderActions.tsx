"use client"
import { Button } from '@nextui-org/button'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import ReviewForm from '@/components/ReviewForm'
import { OrderItems, REVIEW_ORDER_PAYLOAD, ORDER_STATUS, REVIEW_ORDER_PAYLOAD_UPDATE } from '@/lib/config/order.config'
import { deleteReviewOrder, getReviewOrder, reviewOrder, updateReviewOrder } from '@/lib/server.actions'
import { ServerActionStatus } from '@/lib/config/app.config'
import { toast } from 'sonner'
import { RatingStarFilled, RatingStarEmpty } from '@/components/Icons'
import { Accordion, AccordionItem } from '@nextui-org/react'
import NoImage from '@/components/NoImage'
import { useSession } from 'next-auth/react'
import { User } from 'next-auth'
import SuspenseLoader from '@/components/ui/SuspenseLoader'
const itemClasses = {
    base: "w-full rounded-lg shadow-input border border-skin-neutral-100",
    title: "text-title-2 font-bold",
    trigger: '',
    indicator: "text-medium text-skin-neutral-500 -rotate-90 data-[open=true]:rotate-90",
    content: "font-bold text-skin-neutral-300 !text-content-1 !py-0 !pb-4",
};

const OrderActions: React.FC<{ orderId: number, orderItems: OrderItems[], status: string }> = ({ orderId, orderItems, status }) => {

    const [isReviewSubmitted, setIsReviewSubmitted] = useState(false)
    const [isEditReview, setIsEditReview] = useState(false)
    const [currentRating, setCurrentRating] = useState(0)
    const [currentReview, setCurrentReview] = useState('')
    const [currentReviewId, setCurrentReviewId] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const { data } = useSession();
    const sessionUser = data?.user as unknown as User;
    const userId: number = Number(sessionUser?.id);
    const isReviewEnabled = status === ORDER_STATUS.DELIVERED;

    const handleReviewSubmit = async (rating: number, review: string, productId: number) => {
        const payload: REVIEW_ORDER_PAYLOAD = {
            order_id: orderId,
            product_id: productId,
            company_name: "",
            rating: rating,
            comment: review
        }
        if (isEditReview) {
            const payload: REVIEW_ORDER_PAYLOAD_UPDATE = {
                media_id: 0,
                company_name: "",
                rating: rating,
                comment: review,
                is_visible: true
            }
            setIsLoading(true)
            const response = await updateReviewOrder(currentReviewId, payload)
            if (response.status === ServerActionStatus.SUCCESS) {
                toast.success('Review updated successfully')
                setIsReviewSubmitted(true)
                setCurrentRating(rating)
                setCurrentReview(review)
                setIsEditReview(false)

            } else {
                toast.error('Review update failed')
            }
            setIsLoading(false)
        } else {
            setIsLoading(true)
            const response = await reviewOrder(payload)
            if (response.status === ServerActionStatus.SUCCESS) {
                toast.success('Review submitted successfully')
                setIsReviewSubmitted(true)
                setCurrentRating(rating)
                setCurrentReview(review)
                setIsEditReview(false)
                setCurrentReviewId(response.data.id)
            } else {
                toast.error('Review submission failed')
            }
            setIsLoading(false)
        }
    }

    const handleOpenReview = async (productId: number) => {
        setIsLoading(true)
        const response = await getReviewOrder(productId, userId)
        if (response.status === ServerActionStatus.SUCCESS) {
            if (response.data.rows.length > 0) {
                setIsReviewSubmitted(true)
                setCurrentRating(response.data.rows[0].rating)
                setCurrentReview(response.data.rows[0].comment)
                setCurrentReviewId(response.data.rows[0].id)
            } else {
                setIsReviewSubmitted(false)
            }
        } else {
            toast.error('Review submission failed')
        }
        setIsLoading(false)
    }

    const handleEditReview = async () => {
        setIsReviewSubmitted(false)
        setIsEditReview(true);

    }

    const handleDeleteReview = async (productId: number) => {
        setIsLoading(true);
        const response = await deleteReviewOrder(currentReviewId)
        if (response.status === ServerActionStatus.SUCCESS) {
            toast.success('Review deleted successfully');
            handleOpenReview(productId);
        } else {
            toast.error('Review deletion failed');
        }
        setIsLoading(false);
    }

    useEffect(() => {
        if (orderItems.length > 0 && userId && isReviewEnabled) {
            handleOpenReview(orderItems[0].product.id)
        }
    }, [orderItems, userId, isReviewEnabled])

    return (
        <div className='space-y-3.5 w-full md:w-[50%] xl:w-[40%]'>
            <h3 className='text-title-2 md:text-h5 text-skin-neutral-400 font-semibold leading-none'>More Action</h3>
            <div className='space-y-3 w-full'>
                <div className='flex items-center flex-wrap gap-4 justify-between w-full'>
                    <div className='flex items-center gap-1'>
                        <Image
                            src="/images/pdfthumb.svg"
                            alt="pdf thumb"
                            width={30}
                            height={30}
                        />
                        <p className='text-skin-neutral-300 text-title-2 font-bold text-nowrap'>Download Invoice</p>
                    </div>
                    <Button
                        size='sm'
                        radius='sm'
                        variant='bordered'
                        color='default'
                        className='border-skin-neutral-500 rounded-10 min-w-[114px] text-skin-neutral-500 !text-content-2 font-extrabold'
                    >Download</Button>
                </div>
                {
                    isReviewEnabled && (
                        <>
                            <p className='text-skin-neutral-300 text-title-2 font-bold'>Write Review</p>

                            {orderItems.length > 0 && (
                                <Accordion
                                    variant="splitted"
                                    className="!px-0"
                                    itemClasses={itemClasses}
                                    defaultExpandedKeys={["0"]}

                                >
                                    {orderItems.map((item, index) => (
                                        <AccordionItem
                                            key={index}
                                            aria-label={item.product.name}
                                            onPress={() => handleOpenReview(item.product.id)}
                                            title={
                                                <div className="flex items-center gap-4">
                                                    <NoImage
                                                        src={item.variant.variantImages?.[0]?.image_url || item.product.ProductImages?.[0]?.image_url}
                                                        alt={item.product.name}
                                                        width={60}
                                                        height={60}
                                                        className="rounded-lg object-cover"
                                                    />
                                                    <div className='flex flex-col gap-1'>
                                                        <p className="text-title-2 font-bold">{item.product.name}</p>
                                                        <p className="text-content-2 text-skin-neutral-300">Flavour : {item.variant.variantAttributes.map((attr) => attr.term.name).join(', ')}</p>
                                                    </div>
                                                </div>
                                            }
                                        >
                                            {isLoading ? (
                                                <div className='flex items-center justify-center h-full'>
                                                    <SuspenseLoader className='w-full h-[200px]' />
                                                </div>
                                            ) : (
                                                <>
                                                    {!isReviewSubmitted && (
                                                        <div className='mt-2 p-4 border border-skin-neutral-100 rounded-xl'>
                                                            <ReviewForm onSubmit={(rating, review) => handleReviewSubmit(rating, review, item.product.id)} isEditReview={isEditReview} currentRating={currentRating} currentReview={currentReview} />
                                                        </div>
                                                    )}
                                                    {isReviewSubmitted && (
                                                        <div className='mt-2 p-4 border border-skin-neutral-100 rounded-xl'>
                                                            <div className="flex flex-col items-center justify-center space-y-4">
                                                                <div className="text-center">
                                                                    <h4 className="text-title-2 font-semibold text-skin-neutral-400 mb-2">Thank You!</h4>
                                                                    <p className="text-content-2 text-skin-neutral-300">
                                                                        Your review has been submitted successfully.
                                                                    </p>
                                                                </div>
                                                                <div className="flex gap-1">
                                                                    {[...Array(5)].map((_, index) => (
                                                                        index < currentRating ? (
                                                                            <RatingStarFilled key={index} className="w-6 h-6" />
                                                                        ) : (
                                                                            <RatingStarEmpty key={index} className="w-6 h-6" />
                                                                        )
                                                                    ))}
                                                                </div>
                                                                <p className="text-content-2 text-skin-neutral-300">{currentReview}</p>
                                                                <div className='flex gap-2'>
                                                                    <Button
                                                                        size='sm'
                                                                        radius='sm'
                                                                    variant='bordered'
                                                                    color='default'
                                                                    className='border-skin-neutral-500 rounded-10 min-w-[114px] text-skin-neutral-500 !text-content-2 font-extrabold'
                                                                    onPress={handleEditReview}
                                                                >Edit Review</Button>
                                                                <Button
                                                                    size='sm'
                                                                    radius='sm'
                                                                    variant='bordered'
                                                                    color='danger'
                                                                        onPress={() => handleDeleteReview(item.product.id)}
                                                                    >Delete Review</Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            )}
                        </>
                    )
                }
            </div>
        </div>
    )
}

export default OrderActions
