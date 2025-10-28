'use client'

import Image from "next/image";
import React from "react";
import { FeatureContent } from "@/lib/config/content.config";

interface FeatureCardProps {
  imageSrc: string | null;
  altText: string;
  title: string;
  subtitle: string;
}

interface FeatureCardsProps {
    features?: FeatureContent[];
}

const FeatureCard: React.FC<FeatureCardProps> = ({ imageSrc, altText, title, subtitle }) => (
    <div className="feature-card flex-1">
        <div className="relative h-14 w-14">
            {imageSrc && (
                <Image
                    src={imageSrc}
                    alt={altText}
                    fill
                    className="object-contain"
                    loading="lazy"
                />
            )}
        </div>
        <div className="text-center">
            <h3 className="font-semibold md:text-nowrap text-title-2 md:text-xl text-skin-neutral-500">{title}</h3>
            <p className="font-semibold text-content-2 md:text-title-2 text-skin-primary-400">{subtitle}</p>
        </div>
    </div>
);


const FeatureCards: React.FC<FeatureCardsProps> = ({ features }) => {
    if (!features || features.length === 0) {
        return null;
    }
    const mappedFeatures = features.map(feature => ({
        imageSrc: feature?.icon?.icon_url || null,
        altText: feature.title,
        title: feature.title,
        subtitle: feature.subtitle
    }));


    return (
        <div className="grid grid-cols-2 sm:flex flex-wrap items-center justify-center gap-2.5 md:gap-6 xl:gap-12">
            {mappedFeatures.map((feature, index) => (
                <FeatureCard
                    key={index}
                    imageSrc={feature.imageSrc}
                    altText={feature.altText}
                    title={feature.title}
                    subtitle={feature.subtitle}
                />
            ))}
        </div>
    )
};

export default FeatureCards;
