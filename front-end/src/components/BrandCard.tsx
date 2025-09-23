import Link from "next/link";
import React from "react";
import NoImage from "./NoImage";

interface BrandCardProps {
  imageSrc: string;
  altText: string;
  href: string;
  width?: number;
  height?: number;
}

const BrandCard: React.FC<BrandCardProps> = ({
  imageSrc,
  altText,
  href,
  width = 154,
  height = 112,
}) => {
  return (
    <Link
    prefetch={false}
      href={href}
      className="p-1 bg-skin-white border border-[#B9B9B9] shadow-brand-card hover:shadow-slider-card rounded-10 md:rounded-2xl flex items-center justify-center transition-all duration-300 max-w-28 md:max-w-max overflow-hidden"
    >
      <NoImage
        src={imageSrc}
        alt={altText}
        width={width}
        height={height}
        className="rounded-10 md:rounded-2xl max-w-[110px] md:max-w-[154px] max-h-[79px] md:max-h-[112px] min-h-[79px] md:min-h-[112px]"
      />
       
    </Link>
  );
};

export default BrandCard;
