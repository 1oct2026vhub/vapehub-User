import SectionHeading from "@/components/ui/SectionHeading";
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


const FeatureCard: React.FC<FeatureCardProps> = ({ imageSrc, altText, title, subtitle }) => (
    <div className="feature-card w-full flex basis-[1/6] max-w-xs">
        <Image
            src={imageSrc}
            alt={altText}
            width={58}
            height={58}
            className="max-w-9 lg:max-w-fit"
        />
        <div className="text-content-2 md:text-title-2 xl:text-title-1 text-center">
            <h4 className="font-semibold text-skin-neutral-400">{title}</h4>
            <h3 className="font-bold text-skin-primary-400">{subtitle}</h3>
        </div>
    </div>
);


const ProductFeatures: React.FC = () => (
    <section className="bg-skin-white p-4 md:p-7.5 xl:p-10 rounded-2xl shadow-card space-y-7.5">
        <SectionHeading title="Product Features" className="w-fit" />
        <div className="flex flex-wrap items-center gap-x-5 gap-y-10 justify-center">
            {features.map((feature, index) => (
                <FeatureCard
                    key={index}
                    imageSrc={feature.imageSrc}
                    altText={feature.altText}
                    title={feature.title}
                    subtitle={feature.subtitle}
                />
            ))}
        </div>
    </section>
);

export default ProductFeatures;
