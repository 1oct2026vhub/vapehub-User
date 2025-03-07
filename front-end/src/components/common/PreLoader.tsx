import { Spinner } from '@nextui-org/react';
import React from 'react';

const PreLoader: React.FC = () => {
    return (
        <div className="px-4 lg:px-12.5 py-4.5 lg:py-10 flex flex-col gap-4.5 sm:gap-7 md:gap-10 justify-center items-center h-[500px]">
          <Spinner classNames={{label: "text-foreground mt-4"}} label="Loading..."    />
 
        </div>
    );
};

export default PreLoader;