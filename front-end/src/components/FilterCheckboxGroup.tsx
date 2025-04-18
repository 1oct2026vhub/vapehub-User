import React, { useState, useEffect } from "react";
import { Checkbox, CheckboxGroup } from "@nextui-org/react";

interface Option {
  label: string;
  count: number;
  value: string;
}

interface FilterCheckboxGroupProps {
  options: Option[];
  defaultValues?: string[];
  isDisabled?: boolean;
  onChange?: (values: string[]) => void;
}

const FilterCheckboxGroup: React.FC<FilterCheckboxGroupProps> = ({
  options,
  defaultValues = [],
  isDisabled = false,
  onChange,
}) => {
  const [selectedValues, setSelectedValues] = useState<string[]>(defaultValues);

  useEffect(() => {
    setSelectedValues(defaultValues);
  }, [defaultValues]);

  const handleValueChange = (values: string[]) => {
    setSelectedValues(values);
    if (onChange) {
      onChange(values);
    }
  };

  return (
    <CheckboxGroup 
      value={selectedValues}
      onValueChange={handleValueChange}
    >
      {options.map(({ label, count, value }) => (
        <Checkbox
          key={value}
          size="md"
          value={value}
          isDisabled={isDisabled || count === 0}
          classNames={{
            base: "mb-2",
            wrapper: "after:bg-primary-gradient-100 after:rounded",
            label: "!text-content-2",
          }}
        >
          <span className="text-skin-neutral-300 font-normal">{label}</span>
          <span className="text-skin-neutral-500 font-medium">  ({count}) </span>
        </Checkbox>
      ))}
    </CheckboxGroup>
  );
};

export default FilterCheckboxGroup;
