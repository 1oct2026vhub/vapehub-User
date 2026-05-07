"use client"
import React, { FunctionComponent } from "react";
import Slider, { Settings } from "react-slick";
import TestimonialCard from "./TestimonialCard";
import EmptyPlaceholder from "./ui/EmptyPlaceholder";

export interface Testimonial {
  id: number | string;
  user_name: string;
  rating: number;
  comment: string;
  verified_by?: boolean;
  createdAt?: string;
  user: {
    first_name: string;
    last_name: string;
    profile_pic_url: string | null;
  } | null;
}

interface TestimonialProps {
  data: Testimonial[];
}
const NO_JS_VISIBLE_TESTIMONIALS = 3;

const settings: Settings = {
  dots: false,
  infinite: false,
  speed: 500,
  slidesToShow: 3,
  slidesToScroll: 3,
  responsive: [
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 2,
        infinite: false,
        dots: false,
      },
    },
    {
      breakpoint: 640,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 2,
        infinite: false,
        dots: false,
      },
    },
    {
      breakpoint: 480,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
        infinite: false,
        dots: false,
      },
    },
  ],
};

function renderTestimonialSlide(testimonial: Testimonial, slideClassName: string, key: React.Key) {
  return (
    <div key={key} className={slideClassName}>
      <TestimonialCard
        imageSrc={testimonial.user?.profile_pic_url || null}
        altText={testimonial.user_name || ""}
        href="#"
        name={testimonial.user_name || ""}
        review={testimonial.comment}
        ratingCount={testimonial.rating}
        verified={testimonial.verified_by || false}
        createdAt={testimonial.createdAt}
      />
    </div>
  );
}

const TestimonialSlider: FunctionComponent<TestimonialProps> = ({ data }) => {
  if (!data.length) {
    return <EmptyPlaceholder title="Uh, oh!" description="No testimonials available" />;
  }
  const staticTestimonials = data.slice(0, NO_JS_VISIBLE_TESTIMONIALS);

  return (
    <>
      <div className="testimonial-slider-static-shell">
        <span
          aria-hidden
          className="testimonial-slider-static-arrow testimonial-slider-static-prev pointer-events-none"
        />
        <div className="testimonial-slider-static-fallback">
          {staticTestimonials.map((testimonial) =>
            renderTestimonialSlide(testimonial, "px-1 py-2 h-full sm:px-2", `tp-static-${testimonial.id}`)
          )}
        </div>
        <span
          aria-hidden
          className="testimonial-slider-static-arrow testimonial-slider-static-next pointer-events-none"
        />
      </div>
      <div className="testimonial-slider-slick-host">
        <Slider {...settings}>
          {data.map((testimonial) =>
            renderTestimonialSlide(
              testimonial,
              "px-2 md:px-3 xl:px-5 py-3 h-full",
              testimonial.id
            )
          )}
        </Slider>
      </div>
    </>
  );
};

export default TestimonialSlider;
