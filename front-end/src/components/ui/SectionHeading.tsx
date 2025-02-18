import React from "react";

interface SectionHeadingProps {
  title: string;
  className?: string;
}

const SectionHeading: React.FC<SectionHeadingProps> = ({
  title,
  className
}) => {

  return (
    <h2 className={`primary-gradient-600 text-title-1 md:text-h5 xl:text-h3 font-bold ${className}`}>{title}</h2>
  );
};

export default SectionHeading;
