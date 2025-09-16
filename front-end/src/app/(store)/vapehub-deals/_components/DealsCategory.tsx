import ViewAllLink from '@/components/ui/ViewAllLink'
import { Checkbox, Select, SelectItem } from '@nextui-org/react';
import React, { useEffect, useState } from 'react'
import { isLessThanOneMonth } from "@/lib/config/app.config";
import ProductCard from '@/components/ProductCard';
import Slider, { Settings } from 'react-slick';
import { CategoryWithDeals, ProductInDeal } from '@/lib/config/deal.config';
import { getDealsByCategory, getReviewOrderByProductId } from '@/lib/server.actions';
import { ServerActionResponse, ServerActionStatus } from '@/lib/config/app.config';
import { REVIEW_ORDER_RESPONSE } from '@/lib/config/order.config';
import { useRouter } from 'next/navigation';

interface DealsCategoryProps {
    category: CategoryWithDeals;
}

const DealsCategory: React.FC<DealsCategoryProps> = ({ category }) => {
    const router = useRouter();
    const [selectedValues, setSelectedValues] = useState<string[]>([]);
    const [products, setProducts] = useState<ProductInDeal[]>([]);
    const [reviews, setReviews] = useState<ServerActionResponse<REVIEW_ORDER_RESPONSE>[]>([]);
    const [hasProducts, setHasProducts] = useState<boolean>(false);

    const fetchProducts = async (dealId?: number) => {
        const payload: { limit: number; offset: number; deal_id?: number } = {
            limit: 10,
            offset: 0,
        };

        if (dealId) {
            payload.deal_id = dealId;
        }

        const productResponse = await getDealsByCategory(category.id, payload);
        if (productResponse.status === ServerActionStatus.SUCCESS && productResponse.data) {
            setProducts(productResponse.data.products || []);
            setHasProducts(productResponse.data.products && productResponse.data.products.length > 0);
            if (productResponse.data.products && productResponse.data.products.length > 0) {
                const reviewPromises = productResponse.data.products.map(p => getReviewOrderByProductId(p.id, 1, 1));
                const reviewResponses = await Promise.all(reviewPromises);
                setReviews(reviewResponses);
            } else {
                setReviews([]);
            }
        } else {
            setHasProducts(false);
            setProducts([]);
            setReviews([]);
        }
    };

    useEffect(() => {
        if (category.id) {
            fetchProducts();
        }
    }, [category.id]);

    // Only show unique deals by name in the filter
    const uniqueDeals = category.deals.filter(
        (deal, idx, arr) => arr.findIndex(d => d.name === deal.name) === idx
    );

    // Auto-select if only one deal exists
    useEffect(() => {
        if (uniqueDeals.length === 1 && selectedValues.length === 0) {
            const singleDeal = uniqueDeals[0];
            setSelectedValues([singleDeal.id.toString()]);
            fetchProducts(singleDeal.id);
        }
    }, [uniqueDeals, selectedValues.length]);
    const priceOptions = uniqueDeals.map(deal => ({
        label: deal.name,
        value: deal.id.toString()
    }));

    const handleCheckboxChange = (value: string) => {
        const newSelectedValues = selectedValues.includes(value)
            ? selectedValues.filter((v) => v !== value)
            : [value]; // Single selection behavior

        setSelectedValues(newSelectedValues);

        const dealId = newSelectedValues.length > 0 ? parseInt(newSelectedValues[0], 10) : undefined;
        fetchProducts(dealId);
    };

    const handleViewAllClick = (e: React.MouseEvent) => {
        e.preventDefault();
        
        // Build URL based on selection
        let url = '/shop?';
        const params = new URLSearchParams();
        
        if (selectedValues.length > 0) {
            // If deal is selected, include both category and deal
            params.append('categories', category.id.toString());
            params.append('deal_id', selectedValues[0]); // Use the first selected deal
        } else {
            // If no deal selected, only include category
            params.append('categories', category.id.toString());
        }
        
        url += params.toString();
        router.push(url);
    };

    const settings: Settings = {
        dots: true,
        infinite: products.length > 4,
        speed: 500,
        slidesToShow: 4,
        slidesToScroll: 1,
        initialSlide: 0,
        lazyLoad: "progressive",
        responsive: [
            {
                breakpoint: 1280,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 1,
                    infinite: products.length > 3,
                    dots: true,
                },
            },
            {
                breakpoint: 640,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                    infinite: products.length > 2,
                    dots: true,
                },
            },
            {
                breakpoint: 390,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    infinite: products.length > 1,
                    dots: true,
                },
            },
        ],
    };

    return (
        hasProducts ? (
            <div className='space-y-4'>
                <div className="flex items-end md:items-center justify-between">
                    <h2 className='text-h5 md:text-h4 font-bold leading-none text-skin-neutral-500'>{category.name}</h2>
                    {products.length > 4 && (
                        <div
                            role="link"
                            tabIndex={0}
                            onClick={handleViewAllClick}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    handleViewAllClick(e as unknown as React.MouseEvent);
                                }
                            }}
                            className="cursor-pointer"
                        >
                            <ViewAllLink href="#" />
                        </div>
                    )}
                </div>
                <Select
                    size="sm"
                    className="w-full"
                    variant="bordered"
                    label="Deals"
                    classNames={{
                        label: "!text-content-1 !text-skin-neutral-500 font-bold",
                        trigger: "shadow-base border !border-skin-primary-400 max-w-44",
                        listboxWrapper: "max-h-[400px]",
                    }}
                    selectionMode='single'
                    selectedKeys={selectedValues}
                    onSelectionChange={() => { }}
                    renderValue={(items) => {
                        return items.map((item) => {
                            const deal = category.deals.find(d => d.id.toString() === item.key);
                            return deal ? deal.name : '';
                        }).join(', ');
                    }}
                >
                    {priceOptions.map(({ label, value }) => (
                        <SelectItem key={value} textValue={label}>
                            <div
                                className="flex items-start gap-2"
                                onClick={(e) => e.stopPropagation()} // Prevents Select from closing
                            >
                                <Checkbox
                                    size="md"
                                    value={value}
                                    isSelected={selectedValues.includes(value)}
                                    onChange={() => handleCheckboxChange(value)}
                                    classNames={{
                                        base: "",
                                        wrapper: "after:bg-primary-gradient-100 after:rounded",
                                        label: "!text-content-2 text-nowrap",
                                    }}
                                />
                                <span className="text-skin-neutral-300 font-normal text-wrap">{label}</span>
                            </div>
                        </SelectItem>
                    ))}
                </Select>
                <div className="slider-container section-slider products-slider">
                    {products.length > 0 ? <Slider {...settings}>
                        {products.map((product, index) => {
                            const review = reviews.find(r => r.status === ServerActionStatus.SUCCESS && r.data?.reviews?.find(review => review.product_id === product.id));
                            const averageRating = review?.status === ServerActionStatus.SUCCESS ? parseFloat(review.data.average_rating) : 0;
                            const totalReviews = review?.status === ServerActionStatus.SUCCESS ? review.data.total_reviews : 0;
                            
                            return (
                                <div key={index} className="px-1 md:px-2 xl:px-5 py-4 first:pl-0">
                                    <ProductCard
                                        title={product.name}
                                        imageSrc={product.primary_image?.url ?? product.ProductImages?.[0]?.image_url ?? '/images/disposable-1.png'}
                                        price={product.price}
                                        buttonText={product.deals?.[0]?.name ?? "View Details"}
                                        productId={product.id}
                                        // flavors={product?.Flavors?.length || 0}
                                        flavors={product.flavor_count ? Number(product.flavor_count) : 0}
                                        link={`/${product.slug}`}
                                        totalPuffs={product?.puff_count ? `${product?.puff_count}` : ""}
                                        isNew={isLessThanOneMonth(product.created_at) ? "New" : ""}
                                        averageRating={averageRating}
                                        totalReviews={totalReviews}
                                        outOfStock={product.out_of_stock}
                                    />
                                </div>
                            )
                        })}
                    </Slider> : <div className="flex items-center justify-center h-40">
                        <p className="text-skin-neutral-400">No products found.</p>
                    </div>}
                </div>
            </div>
        ) : null
    )
}

export default DealsCategory; 