"use client"
import React from "react";
import Slider, { Settings } from "react-slick";
import ProductCard from "./ProductCard"; 
import { Product, ProductResponseData } from "@/lib/config/product.config";
import { isLessThanOneMonth, ServerActionResponse, ServerActionStatus } from "@/lib/config/app.config";
import EmptyPlaceholder from "./ui/EmptyPlaceholder";
import { REVIEW_ORDER_RESPONSE } from "@/lib/config/order.config";
 
interface ProductProps {
  data: ProductResponseData;
  isListing?: boolean;
  reviews?: ServerActionResponse<REVIEW_ORDER_RESPONSE>[];
}
const ProductsSlider: React.FC<ProductProps> = ({data, isListing = false, reviews = []}) => {
  
  const products:Product[] = data?.products?.filter((product: Product) => product.Category !== null) ?? [];
  
  const settings: Settings = {
    dots: true,
    infinite: products.length > 5,
    speed: -100,
    slidesToShow: 5,
    slidesToScroll: 1,
    initialSlide: 0,
    lazyLoad: "progressive",
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          infinite: products.length > (isListing ? 4: 3),
          dots: true,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          infinite: products.length > (isListing ? 3 : 2),
          dots: true,
        },
      },
    ],
  };
 
  if (!products.length) return <EmptyPlaceholder title='Uh, oh!' description='No products available' />

  return (
    <Slider {...settings}>
      {products.map((product, index) => {
        const review = reviews && reviews.find(r => r.status === ServerActionStatus.SUCCESS && r.data?.reviews?.find(review => review.product_id === product.id));
        const averageRating = review?.status === ServerActionStatus.SUCCESS 
          ? parseFloat(review.data.average_rating) 
          : (product.review_stats ? Number(product.review_stats.average_rating) : 0);
        const totalReviews = review?.status === ServerActionStatus.SUCCESS 
          ? review.data.total_reviews 
          : (product.review_stats ? product.review_stats.total_reviews : 0);

        return (
          <div key={index} className="px-2 md:px-3 xl:px-5 py-5 first:xl:pl-5">
            <ProductCard
              title={product?.name} 
              imageSrc={product.ProductImages?.find(img => img.is_primary)?.image_url || product.ProductImages?.[0]?.image_url || ""}
              price={product?.price}
              buttonText={product.deals && product.deals.length > 0 ? product.deals[0].name : ""}
              productId={product.id}
              flavors={product.flavor_count ? Number(product.flavor_count) : 0}
              link={`/${product.slug}`}
              totalPuffs={product?.puff_count ? `${product?.puff_count}`: ""}
              isNew={product.createdAt && isLessThanOneMonth(product.createdAt) ? "New" : ""}
              averageRating={averageRating}
              totalReviews={totalReviews}
              outOfStock={product.out_of_stock}
            />
          </div>
        )
      })}
    </Slider>
  );
};

export default ProductsSlider;
// {
//   title: "VG Pro 6000 Prefilled Pods",
//   imageSrc: "/images/product-1.png",
//   price: "£12.99",
//   buttonText: "3 for £30",
//   reviews: 10,
//   flavors: "20",
// },