"use client"
import React, { FunctionComponent } from "react";
import Slider, { Settings } from "react-slick";
import TestimonialCard from "./TestimonialCard";
import { TestimonialResponse } from "@/lib/config/global.config";
interface TestimonialProps {
  data: TestimonialResponse[];
}
 

const settings: Settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 3,
    lazyLoad:"progressive",
    responsive: [
        {
            breakpoint: 1024,
            settings: {
                slidesToShow: 2,
                slidesToScroll: 2,
                infinite: false,
                dots: true
            }
        },
        {
            breakpoint: 640,
            settings: {
                slidesToShow: 2,
                slidesToScroll: 2,
                infinite: false,
                dots: true,
            }
        },
    ]
};

const TestimonialSlider: FunctionComponent<TestimonialProps> = ({data}) => {
     if(!data.length) return <p>No Testimonials Available</p>;
    return (
        <Slider {...settings}>
            {data.map((testimonial, index) => (
                <div key={index} className="px-1 md:px-2 xl:px-5 py-3 h-auto min-h-0 first:pl-0">
                    <TestimonialCard 
                     imageSrc = {"/images/avatar.png"}
                     altText = {testimonial?.User?.first_name || ""}
                     href = "#"
                     name = {testimonial?.User?.first_name || ""}
                     review = {testimonial.content}
                     ratingCount = {testimonial.rating}
                     />
                </div>
            ))}
        </Slider>
    );
};

export default TestimonialSlider;
