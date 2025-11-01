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
        <Link key={blog.id} href={`/${blog.slug}`} className="px-2 md:px-3 xl:px-5 py-4 relative w-full">
          {/* <div dangerouslySetInnerHTML={{ __html: blog.content }} /> */}
          <Image src={blog.image_url ?? "/images/blog-card.jpg"} loading="lazy"
            alt={blog.name} width={322} height={512}
            className="rounded-lg shadow-lg cursor-pointer hover:shadow-slider-card w-full aspect-square min-h-[308px] sm:min-h-[336px] md:min-h-[380px] lg:min-h-[478px] xl:min-h-[512px] max-h-[512px]" />
          <div className="space-y-4 absolute left-6 bottom-3 p-6 flex flex-col w-[95%]">
            <div className="bg-white/50 py-1 px-2.5 font-semibold text-content-3 sm:text-content-1 text-black w-fit line-clamp-1">{blog.name}</div>
            {/* <h4 className="text-content-1 md:text-title-1 font-semibold text-skin-white line-clamp-1">{blog.description}</h4> */}
            <p className="text-content-1 md:text-title-1 text-white font-semibold line-clamp-1" dangerouslySetInnerHTML={{ __html: blog.description }} />
          </div>
        </Link>
      ))}
    </Slider>
  );
};

export default BlogsSlider;
