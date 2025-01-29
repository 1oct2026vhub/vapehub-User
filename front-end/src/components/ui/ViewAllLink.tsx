import React from "react";

interface ViewAllLinkProps {
  href: string;
}

const ViewAllLink: React.FC<ViewAllLinkProps> = ({
  href,
}) => {

  return (
    <a href={href} className='text-content-2 md:text-title-2 xl:text-title-1 primary-gradient-100 whitespace-nowrap font-semibold'>View All</a>
  );
};

export default ViewAllLink;
