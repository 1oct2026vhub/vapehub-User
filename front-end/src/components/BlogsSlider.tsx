"use client"
import { BlogResponse } from "@/lib/config/global.config";
import Image from "next/image";
import { FunctionComponent } from "react";
import Slider, { Settings } from "react-slick";
 
interface BlogProps {
  data: BlogResponse[];
};
const BlogsSlider: FunctionComponent<BlogProps> = ({data}) => {
  const settings: Settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 4,
    responsive: [
      {
        breakpoint: 1280,
        settings: { slidesToShow: 3, slidesToScroll: 2, infinite: false, dots: true },
      },
      {
        breakpoint: 640,
        settings: { slidesToShow: 2, slidesToScroll: 2, infinite: false, dots: true },
      },
    ],
  };
   
  return (
    <Slider {...settings}>
      {data.map((blog) => (
        <div key={blog.id} className="px-1 md:px-2 xl:px-5 py-4">
          <Image src={"/images/blog-card.jpg"}
           alt={blog.title} width={322} height={512} 
           className="rounded-3xl shadow-xl cursor-pointer hover:shadow-slider-card" />
           <p>{blog.title}</p>
           <p>{blog.content}</p>
        </div>
      ))}
    </Slider>
  );
};

export default BlogsSlider;
