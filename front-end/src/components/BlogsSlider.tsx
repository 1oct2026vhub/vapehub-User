"use client"
import { BlogResponse } from "@/lib/config/blog.config";
import Image from "next/image";
import Link from "next/link";
import { FunctionComponent } from "react";
import Slider, { Settings } from "react-slick";

interface BlogProps {
  data: BlogResponse[];
};
const BlogsSlider: FunctionComponent<BlogProps> = ({ data }) => {
  const isTwoBlogs = data.length === 2;
  
  // Slick slider configuration.
  // Keep the cards centered whenever we only have two slides and maintain
  // consistent spacing on larger collections.
  const settings: Settings = {
    dots: true, // Show pagination indicators
    infinite: false, // Disable looping for predictable UX
    speed: 500, // Slide transition speed
    slidesToShow: isTwoBlogs ? 2 : 4, // Dynamic columns based on dataset
    slidesToScroll: isTwoBlogs ? 2 : 4, // Scroll the same amount we show
    centerMode: isTwoBlogs, // Center the pair of cards
    centerPadding: isTwoBlogs ? "24px" : "0px", // Maintain a small gap between centered cards
    lazyLoad: "progressive",
    responsive: [
      {
        breakpoint: 1280,
        settings: { 
          slidesToShow: isTwoBlogs ? 2 : 3,
          slidesToScroll: isTwoBlogs ? 2 : 2,
          infinite: false,
          dots: true,
          centerMode: isTwoBlogs,
          centerPadding: isTwoBlogs ? "16px" : "0px",
        },
      },
      {
        breakpoint: 640,
        settings: { 
          slidesToShow: 2, 
          slidesToScroll: 2, 
          infinite: false, 
          dots: true,
          centerMode: true,
          centerPadding: "8px",
        },
      },
    ],
  };
  if (!data.length) {
    return <p className="mt-10 text-skin-neutral-500 text-title-1 md:text-h4 font-semibold text-center">No Blogs Available</p>
  }
  const wrapperClasses = isTwoBlogs ? "max-w-5xl mx-auto" : "";

  return (
    <div className={wrapperClasses}>
      <Slider {...settings}>
      {data.map((blog) => (
        <Link
          key={blog.id}
          href={`/${blog.slug}`}
          className={`pt-4 pb-6 relative w-full flex justify-center ${isTwoBlogs ? "px-3 md:px-4" : "px-2 md:px-3"}`}
        >
          <div className={`relative w-full ${isTwoBlogs ? "max-w-md" : ""}`}>
            <Image
              src={blog.image_url ?? "/images/blog-card.jpg"}
              loading="lazy"
              alt={blog.alt_text ?? blog.name}
              width={isTwoBlogs ? 600 : 400}
              height={isTwoBlogs ? 600 : 400}
              className="rounded-lg shadow-lg cursor-pointer hover:shadow-slider-card w-full aspect-square object-cover"
            />
            <div className="absolute left-4 bottom-4">
              <div className="bg-white/80 py-1 px-3 font-semibold text-content-3 sm:text-content-1 text-black  line-clamp-1">
                {blog.name}
              </div>
            </div>
          </div>
        </Link>
      ))}
      </Slider>
    </div>
  );
};

export default BlogsSlider;
