"use client"
import { BlogResponse } from "@/lib/config/global.config";
// import Image from "next/image";
import { FunctionComponent } from "react";
import Slider, { Settings } from "react-slick";

interface BlogProps {
  data: BlogResponse[];
};
const BlogsSlider: FunctionComponent<BlogProps> = ({ data }) => {
  const settings: Settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 4,
    lazyLoad:"progressive",
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
  if (!data.length) {
    return <p className="mt-10 text-skin-neutral-500 text-title-1 md:text-h4 font-semibold text-center">No Blogs Available</p>
  }
  return (
    <Slider {...settings}>
      {data.map((blog) => (
        <div key={blog.id} className="px-1 md:px-2 xl:px-5 py-4 relative first:pl-0">
          <div dangerouslySetInnerHTML={{ __html: blog.content }} />
          {/* <Image src={"/images/blog-card.jpg"}
            alt={blog.title} width={322} height={512}
            className="rounded-3xl shadow-xl cursor-pointer hover:shadow-slider-card" />
          <div className="space-y-4 absolute left-0 bottom-0 p-6">
            <div className="bg-white/50 py-1 px-2.5 font-semibold text-content-3 sm:text-content-1 text-black">{blog.title}</div>
            <h4 className="text-content-1 md:text-title-1 font-semibold text-skin-white">{blog.content}</h4>
          </div> */}
        </div>
      ))}
    </Slider>
  );
};

export default BlogsSlider;
