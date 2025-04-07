"use client"

import { Radio, RadioGroup } from "@nextui-org/react";
import { FunctionComponent } from "react";

interface Option {
  label: string;
  count: number;
  value: string;
}

interface FilterRadioGroupProps {
  options: Option[];
  defaultValues?: string;
  onChange?: (value: string) => void;
}

const FilterRadioGroup: FunctionComponent<FilterRadioGroupProps> = ({
  options,
  defaultValues = "",
  onChange,
}) => {
   
  const handleValueChange = (value: string) => {
     
    if (onChange) {
      onChange(value);
    }
  };

  return (
    <RadioGroup
      value={defaultValues}
      onValueChange={handleValueChange}
      className="gap-1"
    >
      {options.map((option) => (
        <Radio
          key={option.value}
          value={option.value}
          isDisabled={option.count === 0}
          classNames={{
            base: "mb-2",
            wrapper: "after:bg-primary-gradient-100 after:rounded",
            label: "!text-content-2 text-nowrap",
          }}
        > 
          <span className="text-skin-neutral-300 font-normal">{option.label}</span>
          <span className="text-skin-neutral-500 font-medium">  ({option.count}) </span>
        </Radio>
      ))}
    </RadioGroup>
  );
};

export default FilterRadioGroup; 