import Link from "next/link";
import React from "react";
import NoImage from "./NoImage";

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
    <Link prefetch={false} href={link} className="w-full h-full">
      <div className="bg-primary-gradient-100 p-5 lg:px-8 flex flex-col lg:flex-row items-center rounded-md gap-3.5 lg:gap-5 lg:min-h-[150px]">
        <div className="w-[58px] h-[58px] aspect-square bg-white rounded-full flex items-center justify-center">
          <NoImage
            src={imageSrc}
            alt={`${title} Image`}
            width={58}
            height={58}
            className="object-fill rounded-full"
          />
        </div>
        <h3 className="text-skin-white text-title-2 sm:text-h5 lg:text-h3 max-sm:text-center font-semibold !capitalize">
          {title}
        </h3>
      </div>
    </Link>
  );
};

export default CategoryCard;
