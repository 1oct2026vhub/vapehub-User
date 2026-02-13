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
          <div
            role="button"
            tabIndex={0}
            className="min-h-[28px] py-2 flex items-start gap-2 cursor-pointer max-w-full rounded-medium outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
            onClick={(e) => {
              if ((e.target as HTMLElement).closest("a")) return;
              e.preventDefault();
              field.onChange(!field.value);
            }}
            onKeyDown={(e) => {
              if (e.key === " " || e.key === "Enter") {
                e.preventDefault();
                if (!(e.target as HTMLElement).closest("a")) field.onChange(!field.value);
              }
            }}
          >
            <Checkbox
              {...field}
              isSelected={field.value}
              classNames={{
                base: "!py-0 pointer-events-none max-w-full",
                wrapper: "after:bg-primary-gradient-100",
                label: "!text-content-2 md:!text-title-2 text-skin-neutral-300 font-semibold pointer-events-none",
                icon: "pointer-events-none",
              }}
            >
              {label}
            </Checkbox>
          </div>
          {error && <p className="text-danger text-tiny p-1">{error.message}</p>}
        </div>
      )}
    />
  );
};

export default CustomCheckbox;
