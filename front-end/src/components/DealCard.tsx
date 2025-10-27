"use client"
import Link from "next/link";
import React, { useState } from "react";
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
    height = 250,
}) => {
    
    return (
        <Link prefetch={false} href={href} className="block rounded h-fit">
            <div className="relative w-full overflow-hidden rounded-md">
                <NoImage 
                    src={imageSrc} 
                    alt={altText} 
                    width={width} 
                    height={height} 
                    className="w-full h-full aspect-[16/9] rounded-md object-fill object-center self-stretch min-h-[136px] max-h-[136px] md:min-h-[250px] md:max-h-[250px]" 
                />
            </div>
            {/* <div className="p-2 md:p-5 flex-1">
                <div className="relative">
                    <h3 
                        className="text-lg md:text-title-1 xl:text-h5 text-skin-neutral-500 font-semibold line-clamp-1"
                        onMouseEnter={() => title.length > 20 && setShowTooltip(true)}
                        onMouseLeave={() => setShowTooltip(false)}
                    >
                        {title}
                    </h3>
                    {showTooltip && title.length > 20 && (
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-white text-sm rounded-lg shadow-lg whitespace-nowrap z-50" style={{ backgroundColor: '#02643E' }}>
                            {title}
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent" style={{ borderTopColor: '#02643E' }}></div>
                        </div>
                    )}
                </div>
            </div> */}
        </Link >
    );
};

export default DealCard;
