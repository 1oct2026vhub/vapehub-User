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
            label: "!text-content-2",
          }}
        >
          <span className="text-skin-neutral-400 font-medium">{label}</span>
          <span className="text-skin-neutral-500 font-normal">  ({count}) </span>
        </Checkbox>
      ))}
    </CheckboxGroup>
  );
};

export default FilterCheckboxGroup;
