import React from 'react'; 
import Link from 'next/link';

interface EmptyPlaceholderProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  actionLabel?: string;
  className?: string;
  href?: string;
}

const EmptyPlaceholder: React.FC<EmptyPlaceholderProps> = ({
  icon,
  title = 'No Data Available',
  description = 'There are no items to display at the moment.',
  actionLabel, 
  className,
  href,
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center ${className ?? ''}`}
    >
      {icon && <div className="mb-4 text-gray-400">{icon}</div>}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 mb-4 max-w-sm">{description}</p>
      {actionLabel && href && (
        <Link 
          href={href}          
          className="mt-2"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
};

export default EmptyPlaceholder; 