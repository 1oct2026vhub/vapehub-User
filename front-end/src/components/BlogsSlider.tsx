"use client"
import Image from "next/image";
import React from "react";
import Slider, { Settings } from "react-slick";

interface Blog {
  id: number;
  imageSrc: string;
  altText: string;
}

const blogData: Blog[] = [
  { id: 1, imageSrc: "/images/blog-card.jpg", altText: "Blog 1" },
  { id: 2, imageSrc: "/images/blog-card.jpg", altText: "Blog 2" },
  { id: 3, imageSrc: "/images/blog-card.jpg", altText: "Blog 3" },
  { id: 1, imageSrc: "/images/blog-card.jpg", altText: "Blog 1" },
  { id: 2, imageSrc: "/images/blog-card.jpg", altText: "Blog 2" },
  { id: 3, imageSrc: "/images/blog-card.jpg", altText: "Blog 3" },
  { id: 1, imageSrc: "/images/blog-card.jpg", altText: "Blog 1" },
  { id: 2, imageSrc: "/images/blog-card.jpg", altText: "Blog 2" },
];

const BlogsSlider: React.FC = () => {
  const settings: Settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 4,
    responsive: [
      {
        breakpoint: 1280,
        settings: { slidesToShow: 3, slidesToScroll: 2, infinite: true, dots: true },
      },
      {
        breakpoint: 640,
        settings: { slidesToShow: 2, slidesToScroll: 2, infinite: true, dots: true },
      },
    ],
  };

  return (
    <Slider {...settings}>
      {blogData.map((blog) => (
        <div key={blog.id} className="px-1 md:px-2 xl:px-5 py-4 relative">
          <Image src={blog.imageSrc} alt={blog.altText} width={322} height={512} className="rounded-3xl shadow-xl cursor-pointer hover:shadow-slider-card" />
          <div className="space-y-4 absolute left-4 bottom-4 p-6">
            <div className="bg-white/50 py-1 px-2.5 rounded-sm backdrop-blur-sm text-content-2 md:text-content-1 font-semibold text-skin-black w-fit">
                Geek Zone
            </div>
            <h4 className="text-content-1 md:text-title-1 text-skin-white font-semibold">Mastering MTL: A Comprehensive Guide to Mouth to Lung Vaping</h4>
          </div>
        </div>
      ))}
    </Slider>
  );
};

export default BlogsSlider;
