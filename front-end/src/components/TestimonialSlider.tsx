"use client"
import React, { FunctionComponent } from "react";
import Slider, { Settings } from "react-slick";
import TestimonialCard from "./TestimonialCard";
import EmptyPlaceholder from "./ui/EmptyPlaceholder";

export interface Testimonial {
    id: number | string; // Support both number (legacy) and string (Trustpilot) IDs
    user_name: string;
    rating: number;
    comment: string;
    verified_by?: boolean;
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
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 3,
    lazyLoad: "progressive",
    responsive: [
        {
            breakpoint: 1024,
            settings: {
                slidesToShow: 2,
                slidesToScroll: 2,
                infinite: false,
                dots: false,
            }
        },
        {
            breakpoint: 640,
            settings: {
                slidesToShow: 2,
                slidesToScroll: 2,
                infinite: false,
                dots: false,
            }
        },

        {
            breakpoint: 480,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
                infinite: false,
                dots: false,
            }
        }
    ]
};

const TestimonialSlider: FunctionComponent<TestimonialProps> = ({ data }) => {
    if (!data.length) return <EmptyPlaceholder title='Uh, oh!' description='No testimonials available' />;
    return (
        <Slider {...settings}>
            {data.map((testimonial) => (
                <div key={testimonial.id} className="px-2 md:px-3 xl:px-5 py-3 h-full">
                    <TestimonialCard
                        imageSrc={testimonial.user?.profile_pic_url || null}
                        altText={testimonial.user_name || ""}
                        href="#"
                        name={testimonial.user_name || ""}
                        review={testimonial.comment}
                        ratingCount={testimonial.rating}
                        verified={testimonial.verified_by || false}
                    />
                </div>
            ))}
        </Slider>
    );
};

export default TestimonialSlider;
