import React from "react";
import Slider, { Settings } from "react-slick";
import ProductCard from "./ProductCard";

interface Product {
  title: string;
  imageSrc: string;
  price: string;
  buttonText: string;
  reviews: number;
  flavors: string;
}

const ProductsSlider: React.FC = () => {
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
    ],
  };

  const products: Product[] = [
    {
      title: "VG Pro 6000 Prefilled Pods",
      imageSrc: "/images/product-1.png",
      price: "£12.99",
      buttonText: "3 for £30",
      reviews: 10,
      flavors: "20",
    },
    {
      title: "VG Pro 6000 Prefilled Pods",
      imageSrc: "/images/product-1.png",
      price: "£12.99",
      buttonText: "3 for £30",
      reviews: 10,
      flavors: "20",
    },
    {
      title: "VG Pro 6000 Prefilled Pods",
      imageSrc: "/images/product-1.png",
      price: "£12.99",
      buttonText: "3 for £30",
      reviews: 10,
      flavors: "20",
    },
    {
      title: "VG Pro 6000 Prefilled Pods",
      imageSrc: "/images/product-1.png",
      price: "£12.99",
      buttonText: "3 for £30",
      reviews: 10,
      flavors: "20",
    },
    {
        title: "VG Pro 6000 Prefilled Pods",
        imageSrc: "/images/product-1.png",
        price: "£12.99",
        buttonText: "3 for £30",
        reviews: 10,
        flavors: "20",
      },
      {
        title: "VG Pro 6000 Prefilled Pods",
        imageSrc: "/images/product-1.png",
        price: "£12.99",
        buttonText: "3 for £30",
        reviews: 10,
        flavors: "20",
      },
      {
        title: "VG Pro 6000 Prefilled Pods",
        imageSrc: "/images/product-1.png",
        price: "£12.99",
        buttonText: "3 for £30",
        reviews: 10,
        flavors: "20",
      },
      {
        title: "VG Pro 6000 Prefilled Pods",
        imageSrc: "/images/product-1.png",
        price: "£12.99",
        buttonText: "3 for £30",
        reviews: 10,
        flavors: "20",
      },
      
  ];

  return (
    <Slider {...settings}>
      {products.map((product, index) => (
        <div key={index} className="px-1 md:px-2 xl:px-5 py-4">
          <ProductCard
            title={product.title}
            imageSrc={product.imageSrc}
            price={product.price}
            buttonText={product.buttonText}
            reviews={product.reviews}
            flavors={product.flavors}
          />
        </div>
      ))}
    </Slider>
  );
};

export default ProductsSlider;
