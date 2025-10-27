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
    <h2 className={`primary-gradient-600 text-h5 md:text-h3 font-semibold ${className}`}>{title}</h2>
  );
};

export default SectionHeading;
