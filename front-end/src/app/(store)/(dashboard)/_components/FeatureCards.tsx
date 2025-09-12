'use client'

import Image from "next/image";
import React, { useEffect, useState } from "react";
import { getFeatureContent } from "@/lib/server.actions";
import { ServerActionStatus } from "@/lib/config/app.config";
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
        <div className="text-content-2 md:text-title-2 xl:text-title-1 text-center">
            <h3 className="font-semibold md:text-nowrap text-skin-neutral-400">{title}</h3>
            <h4 className="font-bold text-skin-primary-400">{subtitle}</h4>
        </div>
    </div>
);


const FeatureCards: React.FC<FeatureCardsProps> = ({ features: initialFeatures }) => {

    const [features, setFeatures] = useState(initialFeatures);

    useEffect(() => {
        if (!initialFeatures) {
            const fetchFeatures = async () => {
                const featuresResponse = await getFeatureContent({ page: 1, limit: 4 });

                if (featuresResponse.status === ServerActionStatus.SUCCESS && featuresResponse.data) {
                    setFeatures(featuresResponse.data.featureContent);
                }
            };
            fetchFeatures();
        }
    }, [initialFeatures]);

    if (!features) {
        return null;
    }
console.log("features", features);

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
