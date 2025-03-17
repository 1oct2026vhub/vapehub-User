import { FunctionComponent, ReactElement } from 'react';

interface SuspenseLoaderProps {
  className?: string;
  height?: string;
}

const SuspenseLoader: FunctionComponent<SuspenseLoaderProps> = ({ 
  className = '',
  height = 'h-48'
}): ReactElement => {
  return (
    <div className={`animate-pulse ${height} bg-gray-200 rounded-lg ${className}`}></div>
  );
};

export default SuspenseLoader;
