import Link from "next/link";
import React from "react";

interface ViewAllLinkProps {
  href: string;
}

const ViewAllLink: React.FC<ViewAllLinkProps> = ({
  href,
}) => {

  return (
    <div className="hover:underline">
      <Link href={href} className='text-content-2 sm:text-title-2 lg:text-title-1 primary-gradient-100 whitespace-nowrap font-semibold hover:pr-2 transition-all duration-300'>View All</Link>
    </div>
  );
};

export default ViewAllLink;
