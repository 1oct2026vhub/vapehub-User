"use client"
import React from "react";
import Slider, { Settings } from "react-slick";
import TestimonialCard from "./TestimonialCard";


const testimonials = [
    {
        imageSrc: "/images/avatar.png",
        altText: "User 1",
        href: "#",
        name: "Savannah Nguyen",
        review:
            "Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet. Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet.",
        rating: 5,
    },
    {
        imageSrc: "/images/avatar.png",
        altText: "User 2",
        href: "#",
        name: "Savannah Nguyen",
        review:
            "Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet. Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet.",
        rating: 5,
    },
    {
        imageSrc: "/images/avatar.png",
        altText: "User 3",
        href: "#",
        name: "Savannah Nguyen",
        review:
            "Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet. Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet.",
        rating: 5,
    },
    {
        imageSrc: "/images/avatar.png",
        altText: "User 1",
        href: "#",
        name: "Savannah Nguyen",
        review:
            "Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet. Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet.",
        rating: 5,
    },
    {
        imageSrc: "/images/avatar.png",
        altText: "User 2",
        href: "#",
        name: "Savannah Nguyen",
        review:
            "Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet. Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet.",
        rating: 5,
    },
    {
        imageSrc: "/images/avatar.png",
        altText: "User 3",
        href: "#",
        name: "Savannah Nguyen",
        review:
            "Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet. Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet.",
        rating: 5,
    },
    {
        imageSrc: "/images/avatar.png",
        altText: "User 1",
        href: "#",
        name: "Savannah Nguyen",
        review:
            "Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet. Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet.",
        rating: 5,
    },
    {
        imageSrc: "/images/avatar.png",
        altText: "User 2",
        href: "#",
        name: "Savannah Nguyen",
        review:
            "Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet. Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet.",
        rating: 5,
    },
    {
        imageSrc: "/images/avatar.png",
        altText: "User 3",
        href: "#",
        name: "Savannah Nguyen",
        review:
            "Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet. Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet.",
        rating: 5,
    },
];

const settings: Settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 3,
    responsive: [
        {
            breakpoint: 1024,
            settings: {
                slidesToShow: 2,
                slidesToScroll: 2,
                infinite: true,
                dots: true
            }
        },
        {
            breakpoint: 640,
            settings: {
                slidesToShow: 2,
                slidesToScroll: 2,
                infinite: true,
                dots: true,
            }
        },
    ]
};

const TestimonialSlider: React.FC = () => {

    return (
        <Slider {...settings}>
            {testimonials.map((testimonial, index) => (
                <div key={index} className="px-1 md:px-2 xl:px-5 py-3 h-auto min-h-0">
                    <TestimonialCard {...testimonial} />
                </div>
            ))}
        </Slider>
    );
};

export default TestimonialSlider;
