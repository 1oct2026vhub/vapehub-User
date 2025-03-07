"use client"
import React from "react";
import Slider, { Settings } from "react-slick";
import ProductCard from "./ProductCard"; 
import { Product, ProductResponseData } from "@/lib/config/product.config";
import { isLessThanOneMonth } from "@/lib/config/app.config";
 
interface ProductProps {
  data: ProductResponseData;
}
const ProductsSlider: React.FC<ProductProps> = ({data}) => {
  
  const products:Product[] = data?.products ?? [];
  
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
 
  if (!products.length) return <p>No Products Available</p>;

  return (
    <Slider {...settings}>
      {products.map((product, index) => (
        <div key={index} className="px-1 md:px-2 xl:px-5 py-4 first:pl-0">
          <ProductCard
            title={product?.name}
            imageSrc={product?.ProductImages[0]?.image_url}
            price={product?.price}
            buttonText={"3 for £30"}
            reviews={10}
            flavors={product?.Flavors?.length}
            link={`/${product.slug}`}
            totalPuffs={product?.puff_count ? `${product?.puff_count} Puffs`: ""}
            isNew={isLessThanOneMonth(product?.createdAt) ? "New" : ""} 
          />
        </div>
      ))}
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