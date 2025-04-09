import { Checkbox } from "@nextui-org/react";
import { ReactNode } from "react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";

interface CustomCheckboxProps<T extends FieldValues> {
  label: ReactNode;
  control: Control<T>;
  name: Path<T>;
}

const CustomCheckbox = <T extends FieldValues>({ label, control, name }: CustomCheckboxProps<T>) => {
  return (
    <Controller
      name={name}
      control={control}      
      render={({ field, fieldState: { error } }) => (
        <div className="flex flex-col gap-2">
        <Checkbox
          {...field}
          isSelected={field.value} 
          classNames={{
            base: "!py-0",
            wrapper: "after:bg-primary-gradient-100",
            label: "!text-content-2 md:!text-title-2 text-skin-neutral-300 font-bold pointer-events-none",
            icon: "pointer-events-none",
          }}
        >
          {label}
        </Checkbox>
        {error && <p className="text-danger text-tiny p-1">{error.message}</p>}
        </div>
      )}
    />
  );
};

export default CustomCheckbox;
