"use client";
import { BlogResponse } from "@/lib/config/blog.config";
import Image from "next/image";
import Link from "next/link";
import { FunctionComponent } from "react";
import Slider, { Settings } from "react-slick";

interface BlogProps {
  data: BlogResponse[];
}

function renderBlogCard(blog: BlogResponse, isTwoBlogs: boolean, key: React.Key) {
  return (
    <Link
      key={key}
      href={`/${blog.slug}`}
      className={`relative flex w-full justify-center pt-4 pb-6 ${isTwoBlogs ? "px-3 md:px-4" : "px-2 md:px-3"}`}
    >
      <div className={`relative w-full ${isTwoBlogs ? "max-w-md" : ""}`}>
        <Image
          src={blog.image_url ?? "/images/blog-card.jpg"}
          loading="lazy"
          alt={blog.alt_text ?? blog.name}
          width={isTwoBlogs ? 600 : 400}
          height={isTwoBlogs ? 600 : 400}
          className="aspect-square w-full cursor-pointer rounded-lg object-cover shadow-lg hover:shadow-slider-card"
        />
        <div className="absolute bottom-4 left-4">
          <div className="line-clamp-1 bg-white/80 px-3 py-1 text-content-3 font-semibold text-black sm:text-content-1">
            {blog.name}
          </div>
        </div>
      </div>
    </Link>
  );
}

const BlogsSlider: FunctionComponent<BlogProps> = ({ data }) => {
  const isTwoBlogs = data.length === 2;

  const settings: Settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: isTwoBlogs ? 2 : 4,
    slidesToScroll: isTwoBlogs ? 2 : 4,
    centerMode: isTwoBlogs,
    centerPadding: isTwoBlogs ? "24px" : "0px",
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
    return (
      <p className="mt-10 text-center text-title-1 font-semibold text-skin-neutral-500 md:text-h4">
        No Blogs Available
      </p>
    );
  }

  const wrapperClasses = isTwoBlogs ? "max-w-5xl mx-auto" : "";

  return (
    <div className={wrapperClasses}>
      <div
        className={`blogs-slider-static-fallback ${isTwoBlogs ? "blogs-slider-two-only" : ""}`}
      >
        {data.map((blog) => renderBlogCard(blog, isTwoBlogs, `blog-static-${blog.id}`))}
      </div>
      <div className="blogs-slider-slick-host">
        <Slider {...settings}>
          {data.map((blog) => renderBlogCard(blog, isTwoBlogs, blog.id))}
        </Slider>
      </div>
    </div>
  );
};

export default BlogsSlider;
