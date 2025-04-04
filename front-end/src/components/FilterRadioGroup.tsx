"use client"

import { Radio, RadioGroup } from "@nextui-org/react";
import { FunctionComponent, useState, useEffect } from "react";

interface Option {
  label: string;
  count: number;
  value: string;
}

interface FilterRadioGroupProps {
  options: Option[];
  defaultValues?: string[];
  onChange?: (value: string) => void;
}

const FilterRadioGroup: FunctionComponent<FilterRadioGroupProps> = ({
  options,
  defaultValues = [],
  onChange,
}) => {
  const [selectedValue, setSelectedValue] = useState<string>(defaultValues[0] || "");

  useEffect(() => {
    setSelectedValue(defaultValues[0] || "");
  }, [defaultValues]);

  const handleValueChange = (value: string) => {
    setSelectedValue(value);
    if (onChange) {
      onChange(value);
    }
  };

  return (
    <RadioGroup
      value={selectedValue}
      onValueChange={handleValueChange}
      className="gap-1"
    >
      {options.map((option) => (
        <Radio
          key={option.value}
          value={option.value}
          classNames={{
            base: "mb-2",
            wrapper: "after:bg-primary-gradient-100 after:rounded",
            label: "!text-content-2 text-nowrap",
          }}
        > 
          <span className="text-skin-neutral-300 font-normal">{option.label}</span>
          <span className="text-skin-neutral-500 font-medium">  ({option.count}) </span>
        </Radio>
      ))}
    </RadioGroup>
  );
};

export default FilterRadioGroup; 