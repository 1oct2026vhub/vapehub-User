import { Checkbox } from "@nextui-org/react";
import { ReactNode } from "react";

interface CustomCheckboxProps {
  label: ReactNode;
}

const CustomCheckbox: React.FC<CustomCheckboxProps> = ({ label }) => {
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
