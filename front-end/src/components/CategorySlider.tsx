"use client"
import React, { ReactElement } from "react";
import Slider, { Settings } from "react-slick";
import CategoryCard from "./CategoryCard";
import { Category } from "@/lib/config/category.config";

type props = {
    categories: Category[];
};

const CategorySlider: React.FC<props> = ({ categories }): ReactElement => {
    
     
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


    return (
        <Slider {...settings}>
            {categories.map((category, index) => (
                <div key={index}>
                    <CategoryCard
                        title={category.name}
                        imageSrc={category.logo_url}
                        link={category.slug}
                    />
                </div>
            ))}
        </Slider>
    );
};

export default CategorySlider;
