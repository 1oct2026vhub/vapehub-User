import { cn } from "@/lib/utils";
import { Radio, RadioProps } from "@nextui-org/react";
import { ReactNode } from "react";

interface CustomRadioProps extends Omit<RadioProps, "classNames"> {
  children: ReactNode;
  className?: string;
}

export const CustomRadio: React.FC<CustomRadioProps> = ({ children, className, ...otherProps }) => {
  return (
    
    <Radio
      {...otherProps}
      classNames={{
        base: cn(
          "flex m-0 mb-2 bg-skin-white items-start",
          "flex-row cursor-pointer !w-full !max-w-full rounded gap-1 p-2 md:p-3.5 border border-skin-neutral-200",
          "data-[selected=true]:border-skin-primary-500",
          className
        ),
      }}
    >
      {children}
    </Radio>
  );
};
