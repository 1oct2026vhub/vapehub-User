"use client"
import React, { FunctionComponent } from "react";
import Slider, { Settings } from "react-slick";
import TestimonialCard from "./TestimonialCard";
import EmptyPlaceholder from "./ui/EmptyPlaceholder";

interface Testimonial {
    id: number;
    user_name: string;
    rating: number;
    comment: string;
    user: {
        first_name: string;
        last_name: string;
        profile_pic_url: string | null;
    } | null;
}
interface TestimonialProps {
  data: Testimonial[];
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
     if(!data.length) return  <EmptyPlaceholder title='Uh, oh!' description='No testimonials available' />;
    return (
        <Slider {...settings}>
            {data.map((testimonial, index) => (
                <div key={index} className="px-2 xl:px-5 py-3 h-full first:pl-0">
                    <TestimonialCard
                     imageSrc = {testimonial.user?.profile_pic_url || "/images/avatar.png"}
                     altText = {testimonial.user_name || ""}
                     href = "#"
                     name = {testimonial.user_name || ""}
                     review = {testimonial.comment}
                     ratingCount = {testimonial.rating}
                     />
                </div>
            ))}
        </Slider>
    );
};

export default TestimonialSlider;
