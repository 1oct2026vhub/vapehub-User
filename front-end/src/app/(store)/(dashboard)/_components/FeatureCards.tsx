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
    imageSrc: "/images/price.svg",
    altText: "Unbelievable Prices",
    title: "Unbelievable Prices",
    subtitle: "Always",
  },
  {
    imageSrc: "/images/delivery.svg",
    altText: "Free UK Delivery",
    title: "Free UK Delivery",
    subtitle: "Orders-£30",
  },
  {
    imageSrc: "/images/dispatch.svg",
    altText: "Fast Dispatch",
    title: "Fast Dispatch",
    subtitle: "Orders-3pm",
  },
  {
    imageSrc: "/images/price.svg",
    altText: "Multibuy Deals",
    title: "Multibuy Deals",
    subtitle: "Huge Savings",
  },
];


const FeatureCard: React.FC<FeatureCardProps> = ({ imageSrc, altText, title, subtitle }) => (
  <div className="feature-card">
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


const FeatureCards: React.FC = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-6 xl:gap-12">
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
);

export default FeatureCards;
