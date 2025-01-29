import { Breadcrumbs, BreadcrumbItem } from "@nextui-org/react";

interface Crumb {
  label: string;
  href: string;
  isActive?: boolean;
}

interface BreadcrumbsProps {
    items: Crumb[];
}

const BreadCrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <Breadcrumbs
      itemClasses={{
        separator: "px-2 leading-none !text-skin-neutral-200",
      }}
      separator=">>"
    >
      {items.map((crumb, index) => (
        <BreadcrumbItem
          key={index}
          href={crumb.href}
          classNames={{
            item: crumb.isActive
              ? "text-skin-neutral-500 text-title-2 font-bold"
              : "primary-gradient-100 text-title-2 font-bold",
          }}
        >
          {crumb.label}
        </BreadcrumbItem>
      ))}
    </Breadcrumbs>
  );
};

export default BreadCrumbs;
