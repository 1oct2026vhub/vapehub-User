import React from "react";
import { Checkbox, CheckboxGroup } from "@nextui-org/react";

interface Option {
  label: string;
  count: number;
  value: string;
}

interface FilterCheckboxGroupProps {
  options: Option[];
  defaultValues?: string[];
}

const FilterCheckboxGroup: React.FC<FilterCheckboxGroupProps> = ({
  options,
  defaultValues = [],
}) => {
  return (
    <CheckboxGroup defaultValue={defaultValues}>
      {options.map(({ label, count, value }) => (
        <Checkbox
          key={value}
          size="md"
          value={value}
          classNames={{
            base: "mb-2",
            wrapper: "after:bg-primary-gradient-100 after:rounded",
            label: "!text-content-2 text-nowrap",
          }}
        >
          <span className="text-skin-neutral-300 font-normal">{label}</span>
          <span className="text-skin-neutral-500 font-medium">  ({count}) </span>
        </Checkbox>
      ))}
    </CheckboxGroup>
  );
};

export default FilterCheckboxGroup;
