import EmptyPlaceholder from "@/components/ui/EmptyPlaceholder";
import SectionHeading from "@/components/ui/SectionHeading";
import { AttributeTerms } from "@/lib/config/product.config";
import Image from "next/image";
import React from "react";

interface FeatureCardProps {
    imageSrc: string;
    altText: string;
    title: string;
    subtitle: string;
}

const features: FeatureCardProps[] = [
    {
        imageSrc: "/images/battery-capacity.svg",
        altText: "Battery capacity",
        title: "Battery Capacity",
        subtitle: "500 mAh",
    },
    {
        imageSrc: "/images/liquid-capacity.svg",
        altText: "E-Liquid Capacity",
        title: "E-Liquid Capacity",
        subtitle: "2 ml",
    },
    {
        imageSrc: "/images/function.svg",
        altText: "Function",
        title: "Function",
        subtitle: "Fixed Power",
    },
    {
        imageSrc: "/images/nicotine-strength.svg",
        altText: "Nicotine Strength",
        title: "Nicotine Strength",
        subtitle: "20 mg",
    },
    {
        imageSrc: "/images/power-supply.svg",
        altText: "Power Supply",
        title: "Power Supply",
        subtitle: "Built-in",
    },
    {
        imageSrc: "/images/puff-count.svg",
        altText: "Puff Count",
        title: "Puff Count",
        subtitle: "Approx. 600",
    },
];

interface ProductFeaturesProps {
    productFeatures: AttributeTerms[];
}

const FeatureCard: React.FC<FeatureCardProps> = ({ imageSrc, altText, title, subtitle }) => (
    <div className="feature-card w-full flex basis-[1/6] min-h-24 md:max-w-xs">
        <Image
            src={imageSrc}
            alt={altText}
            width={58}
            height={58}
            className="max-w-9 lg:max-w-fit"
        />
        <div className="text-content-2 md:text-title-2 xl:text-title-1 text-center">
            <h4 className="font-semibold text-skin-neutral-400 capitalize">{title}</h4>
            <h5 className="font-bold text-skin-primary-400">{subtitle}</h5>
        </div>
    </div>
);


const ProductFeatures: React.FC<ProductFeaturesProps> = ({ productFeatures }) => (
    <section className="bg-skin-white p-4 md:p-6 xl:p-10 rounded-2xl shadow-card space-y-2 lg:space-y-7.5">
        <SectionHeading title="Product Features" className="w-fit" />
        {productFeatures.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex flex-wrap items-center gap-3 lg:gap-x-5 lg:gap-y-10 justify-center">

                {productFeatures.map((feature, index) => (
                    features?.[index] && (
                    <FeatureCard
                        key={index}
                        imageSrc={features?.[index]?.imageSrc || ""}
                        altText={feature.attribute.name}
                        title={feature.attribute.name}
                        subtitle={feature.terms?.[0]?.name}
                    />
                    )
                ))}
            </div>) : (
            <EmptyPlaceholder
                title="No features available"
                description="This product does not have any features"
                className="h-full w-full"
            />
        )}
    </section>
);

export default ProductFeatures;
