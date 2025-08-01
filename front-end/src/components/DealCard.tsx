import Link from "next/link";
import React from "react";
import NoImage from "./NoImage";

interface DealCardProps {
    imageSrc: string;
    altText: string;
    href: string;
    title: string;
    width?: number;
    height?: number;
}

const DealCard: React.FC<DealCardProps> = ({
    imageSrc,
    altText,
    href,
    title,
    width = 312,
    height = 258,
}) => {
    return (
        <Link href={href} className="block bg-skin-white max-w-60 md:max-w-full rounded-xl shadow-deal-card-mob xl:shadow-deal-card hover:shadow-brand-card transition-all duration-300 h-64 md:h-72 xl:h-80">
            <div className="relative w-full aspect-[4/3] overflow-hidden rounded-t-xl">
                <NoImage 
                    src={imageSrc} 
                    alt={altText} 
                    width={width} 
                    height={height} 
                    className="w-full h-full object-cover object-center" 
                />
            </div>
            <div className="p-3.5 md:p-5 flex-1">
                <h3 className="text-lg md:text-title-1 xl:text-h5 text-skin-neutral-500 font-semibold line-clamp-2">{title}</h3>
            </div>
        </Link >
    );
};

export default DealCard;
