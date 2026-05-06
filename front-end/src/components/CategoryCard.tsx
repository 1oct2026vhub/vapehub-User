import Link from "next/link";
import React from "react";
import Image from "next/image";
import { CategoryIcon } from "./Icons";

interface CategoryCardProps {
  title: string;
  imageSrc?: string | null;
  link: string;
  altText: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  title,
  imageSrc,
  link,
  altText
}) => {
  const isValidImageUrl = imageSrc && typeof imageSrc === 'string' && imageSrc.trim() !== '' && imageSrc.startsWith('http');

  return (
    <Link prefetch={false} href={link} className="w-full h-full">
      <div className="bg-primary-gradient-100 p-5 lg:px-8 flex flex-col lg:flex-row items-center rounded-md gap-3.5 lg:gap-5 lg:min-h-[150px] h-full">
        {isValidImageUrl && imageSrc ? (
          <div className="w-[58px] h-[58px] aspect-square bg-white rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
            <Image
              src={imageSrc}
              alt={altText}
              width={58}
              height={58}
              className="object-cover w-full h-full rounded-full"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="min-w-[42px]">
            <CategoryIcon />
          </div>
        )}
        <span className="text-skin-white text-title-2 sm:text-h5 lg:text-h3 max-sm:text-center font-semibold !font-oswald !capitalize">
          {title}
        </span>
      </div>
    </Link>
  );
};

export default CategoryCard;
