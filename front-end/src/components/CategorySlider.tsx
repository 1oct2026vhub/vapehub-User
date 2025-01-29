import React from "react";
import Slider, { Settings } from "react-slick";
import CategoryCard from "./CategoryCard";

const CategorySlider: React.FC = () => {
    const handleShopNowClick = (category: string) => {
        console.log(`${category} Shop Now clicked!`);
    };

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
                    slidesToScroll: 3,
                    infinite: true,
                    dots: true
                }
            },
            {
                breakpoint: 640,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    infinite: true,
                    dots: true,
                    rows: 2,
                    slidesPerRow: 2,
                    centerPadding: "60px",
                }
            },
        ]
    };

    const categories = [
        {
            title: "Disposables",
            imageSrc: "/images/category-image.png",
        },
        {
            title: "Disposables",
            imageSrc: "/images/category-image.png",
        },
        {
            title: "Disposables",
            imageSrc: "/images/category-image.png",
        },
        {
            title: "Disposables",
            imageSrc: "/images/category-image.png",
        },
        {
            title: "Disposables",
            imageSrc: "/images/category-image.png",
        },
        {
            title: "Disposables",
            imageSrc: "/images/category-image.png",
        },
        {
            title: "Disposables",
            imageSrc: "/images/category-image.png",
        },
        {
            title: "Disposables",
            imageSrc: "/images/category-image.png",
        },
        {
            title: "Disposables",
            imageSrc: "/images/category-image.png",
        },
        {
            title: "Disposables",
            imageSrc: "/images/category-image.png",
        },
        {
            title: "Disposables",
            imageSrc: "/images/category-image.png",
        },
        {
            title: "Disposables",
            imageSrc: "/images/category-image.png",
        },
        {
            title: "Disposables",
            imageSrc: "/images/category-image.png",
        },
        {
            title: "Disposables",
            imageSrc: "/images/category-image.png",
        },
        {
            title: "Disposables",
            imageSrc: "/images/category-image.png",
        },
        {
            title: "Disposables",
            imageSrc: "/images/category-image.png",
        },
    ];

    return (
        <Slider {...settings}>
            {categories.map((category, index) => (
                <div key={index}>
                    <CategoryCard
                        title={category.title}
                        imageSrc={category.imageSrc}
                        onButtonClick={() => handleShopNowClick(category.title)}
                    />
                </div>
            ))}
        </Slider>
    );
};

export default CategorySlider;
