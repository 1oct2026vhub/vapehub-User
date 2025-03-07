import Image from "next/image";
import React from "react";

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
    <a
      href={href}
      className="bg-skin-white border border-[#B9B9B9] shadow-brand-card hover:shadow-slider-card rounded-[10px] md:rounded-2xl flex items-center justify-center transition-all duration-300 max-w-28 md:max-w-max"
    >
      {imageSrc && imageSrc.startsWith('http') ? (
        <Image
          src={imageSrc} alt={altText} width={width} height={height} loading="lazy"
        />
      ) : <Image src={"/images/brand-1.png"} alt={altText} width={width} height={height} loading="lazy"/>}

    </a>
  );
};

export default BrandCard;
