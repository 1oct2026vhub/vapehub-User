import Image from "next/image";
import Link from "next/link";
import React from "react";

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
        <Link href={href} className="block bg-skin-white max-w-60 md:max-w-full rounded-xl shadow-deal-card-mob xl:shadow-deal-card hover:shadow-brand-card  transition-all duration-300">
            <Image src={imageSrc} alt={altText} width={width} height={height} className="rounded-t-xl w-full" loading="lazy"/>
            <div className="p-3.5 md:p-5">
                <h3 className="text-lg md:text-title-1 xl:text-h5 text-skin-neutral-500 font-semibold">{title}</h3>
            </div>
        </Link >
    );
};

export default DealCard;
