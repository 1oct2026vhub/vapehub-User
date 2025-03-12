"use client"

import { Radio, RadioGroup } from "@nextui-org/react";
import { FunctionComponent, useCallback } from "react";

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
  const handleSelectionChange = useCallback(
    (value: string) => {
      if (onChange) {
        onChange(value);
      }
    },
    [onChange]
  );

  return (
    <RadioGroup
      defaultValue={defaultValues[0]}
      onChange={(e) => handleSelectionChange(e.target.value)}
      className="gap-1"
    >
      {options.map((option) => (
        <Radio
          key={option.value}
          value={option.value}
          className="text-skin-neutral-300"
        >
          {`${option.label} (${option.count})`}
        </Radio>
      ))}
    </RadioGroup>
  );
};

export default FilterRadioGroup; 