import Image from "next/image";
import React from "react";
import { getFeatureContent } from "@/lib/server.actions";
import { ServerActionStatus } from "@/lib/config/app.config";
import { FeatureContent } from "@/lib/config/content.config";

interface FeatureCardProps {
  imageSrc: string;
  altText: string;
  title: string;
  subtitle: string;
}

interface FeatureCardsProps {
    features?: FeatureContent[];
}

const FeatureCard: React.FC<FeatureCardProps> = ({ imageSrc, altText, title, subtitle }) => (
    <div className="feature-card">
        <div className="relative h-14 w-14">
            <Image
                src={imageSrc}
                alt={altText}
                fill
                className="object-contain"
                loading="lazy"
            />
        </div>
        <div className="text-content-2 md:text-title-2 xl:text-title-1 text-center">
            <h3 className="font-semibold text-skin-neutral-400">{title}</h3>
            <h4 className="font-bold text-skin-primary-400">{subtitle}</h4>
        </div>
    </div>
);


const FeatureCards: React.FC<FeatureCardsProps> = async ({ features: initialFeatures }) => {

    let features = initialFeatures;

    if (!features) {
        const featuresResponse = await getFeatureContent({ page: 1, limit: 4 });

        if (featuresResponse.status !== ServerActionStatus.SUCCESS || !featuresResponse.data) {
            return null;
        }
        features = featuresResponse.data.featureContent;
    }


    const mappedFeatures = features.map(feature => ({
        imageSrc: feature.icon.icon_url,
        altText: feature.title,
        title: feature.title,
        subtitle: feature.subtitle
    }));


    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-6 xl:gap-12">
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
