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
  /** When set, no-JS fallback shows at most this many cards (e.g. 5 on homepage carousels). Omit to show all. */
  maxNoJsProducts?: number;
}

function renderProductCard(
  product: Product,
  reviews: ServerActionResponse<REVIEW_ORDER_RESPONSE>[],
  slideClassName: string,
  key: React.Key
) {
  const review = reviews.find(
    (r) =>
      r.status === ServerActionStatus.SUCCESS &&
      r.data?.reviews?.find((rev) => rev.product_id === product.id)
  );
  const averageRating =
    review?.status === ServerActionStatus.SUCCESS
      ? parseFloat(review.data.average_rating)
      : product.review_stats
        ? Number(product.review_stats.average_rating)
        : 0;
  const totalReviews =
    review?.status === ServerActionStatus.SUCCESS
      ? review.data.total_reviews
      : product.review_stats
        ? product.review_stats.total_reviews
        : 0;

  return (
    <div key={key} className={slideClassName}>
      <ProductCard
        title={product?.name}
        imageSrc={
          product.ProductImages?.find((img) => img.is_primary)?.image_url ||
          product.ProductImages?.[0]?.image_url ||
          ""
        }
        altText={
          product.ProductImages?.find((img) => img.is_primary)?.alt_text ??
          product.ProductImages?.[0]?.alt_text ??
          ""
        }
        price={product?.price}
        buttonText={product.deals && product.deals.length > 0 ? product.deals[0].name : ""}
        productId={product.id}
        flavors={product.flavor_count ? Number(product.flavor_count) : 0}
        link={`/${product.slug}`}
        totalPuffs={product?.puff_count ? `${product?.puff_count}` : ""}
        isNew={product.createdAt && isLessThanOneMonth(product.createdAt) ? "New" : ""}
        isDiscontinued={Boolean(product.is_discontinued)}
        isComingSoon={Boolean(product.is_coming_soon)}
        averageRating={averageRating}
        totalReviews={totalReviews}
        outOfStock={product.out_of_stock}
      />
    </div>
  );
}

const ProductsSlider: React.FC<ProductProps> = ({
  data,
  isListing = false,
  reviews = [],
  maxNoJsProducts,
}) => {
  const products: Product[] = data?.products?.filter((product: Product) => product.Category !== null) ?? [];

  const settings: Settings = {
    dots: false,
    infinite: products.length > 5,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 5,
    initialSlide: 0,
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          infinite: products.length > (isListing ? 4 : 3),
          dots: false,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          infinite: products.length > (isListing ? 3 : 2),
          dots: true,
        },
      },
    ],
  };

  if (!products.length) {
    return <EmptyPlaceholder title="Uh, oh!" description="No products available" />;
  }

  const staticProducts =
    typeof maxNoJsProducts === "number" && maxNoJsProducts >= 0
      ? products.slice(0, maxNoJsProducts)
      : products;

  return (
    <>
      {/* Visible when scripting is off (see globals.css @media scripting) */}
      <div className="products-slider-static-shell">
        <span
          aria-hidden
          className="products-slider-static-arrow products-slider-static-prev pointer-events-none"
        />
        <div className="products-slider-static-fallback">
          {staticProducts.map((product) =>
            renderProductCard(
              product,
              reviews,
              "px-1 py-3 sm:px-2 md:px-3",
              `static-${product.id}`
            )
          )}
        </div>
        <span
          aria-hidden
          className="products-slider-static-arrow products-slider-static-next pointer-events-none"
        />
      </div>
      <div className="products-slider-slick-host">
        <Slider {...settings}>
          {products.map((product, index) =>
            renderProductCard(
              product,
              reviews,
              "px-2 md:px-3 xl:px-5 py-5 first:xl:pl-5",
              `slide-${product.id}-${index}`
            )
          )}
        </Slider>
      </div>
    </>
  );
};

export default ProductsSlider;
