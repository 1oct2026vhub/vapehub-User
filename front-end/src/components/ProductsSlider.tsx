"use client"
import React from "react";
import Slider, { Settings } from "react-slick";
import ProductCard from "./ProductCard"; 
import { Product, ProductResponseData } from "@/lib/config/product.config";
 
interface ProductList {
  data: ProductResponseData;
}
const ProductsSlider: React.FC<ProductList> = ({data}) => {
  
  const products:Product[] = data?.products ?? [];
   
  const settings: Settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 4,
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 2,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 390,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: true,
          dots: true,
        },
      },
    ],
  };
 
  if (!products.length) return <p>No Products Available</p>;

  return (
    <Slider {...settings}>
      {products.map((product, index) => (
        <div key={index} className="px-1 md:px-2 xl:px-5 py-4">
          <ProductCard
            title={product.name}
            imageSrc={"/images/product-1.png"}
            price={`£${product.price}`}
            buttonText={"3 for £30"}
            reviews={10}
            flavors={product.Flavors.length}
            link={`/${product.slug}`}
            totalPuffs={`${product.puff_count} Puffs`}
            isNew={product.is_new ? "New" : ""}
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