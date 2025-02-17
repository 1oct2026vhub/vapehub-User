import { Checkbox } from "@nextui-org/react";
import { ReactNode } from "react";

interface CustomCheckboxProps {
  label: ReactNode;
  className?: string;
}

const CustomCheckbox: React.FC<CustomCheckboxProps> = ({ label, className }) => {
  return (
    <Checkbox
      classNames={{
        base: "!py-0",
        wrapper: "after:bg-primary-gradient-100",
        label: "!text-content-2 md:!text-title-2 text-skin-neutral-300 font-bold pointer-events-none",
        icon: "pointer-events-none",
      }}
    >
      {label}
    </Checkbox>
  );
};

export default CustomCheckbox;
