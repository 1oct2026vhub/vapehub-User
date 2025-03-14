import Image from "next/image";
import React from "react";
import { Button } from "@nextui-org/react";
import Link from "next/link";

interface CategoryCardProps {
  title: string;
  imageSrc: string;
  link: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  title,
  imageSrc,
  link
}) => {
  return (
    <a href={link} className="w-full block relative text-center pt-2 px-1.5 md:px-5 first:pl-0">
      {/* Title Container */}
      <div className="p-1 md:p-2 bg-[#F8FCFA] w-fit mx-auto absolute left-[50%] md:left-[47%] translate-x-[-50%] -top-2 sm:-top-2 md:-top-3.5">
        <h3 className="uppercase text-[#030303] text-title-2 md:text-title-1 xl:text-[22px] md:text-nowrap font-semibold leading-normal">
          {title}
        </h3>
      </div>

      {/* Card Content */}
      <div className="flex flex-col items-center gap-2 md:gap-3.5 bg-[#F8FCFA] shadow-lg md:shadow-slider-card hover:shadow-brand-card border border-skin-neutral-200 pt-11 px-4.5 md:px-8 pb-3.5 md:pb-6 rounded-xl md:rounded-[20px]">
        
        {imageSrc && imageSrc.startsWith('http') ? (
          <Image
            src={imageSrc}
            alt={`${title} Image`}
            width={230}
            height={204}
            className="max-h-[150px] md:max-h-[250px] min-h-[150px] md:min-h-[250px]"
            loading="lazy"
          />
        ) : <Image
        src={"/images/category-image.png"}
        alt={`${title} Image`}
        width={230}
        height={204}
        className="max-h-[150px] md:max-h-[250px] min-h-[150px] md:min-h-[250px]"
        loading="lazy"
      />}
        
        {/* <Button
          as={Link}
          href={link}
          size="lg"
          radius="sm"
          color="primary"
          className="btn primary-btn shadow-input w-fit !min-w-fit !text-content-2 md:!text-title-2 xl:!text-[22px] h-7.5 md:h-10 xl:h-12.5 !px-3.5 md:!px-6"
          
        >
          Shop Now
        </Button>  */}
      </div>
    </a>
  );
};

export default CategoryCard;
