'use client';

import React from "react";
import { Input, InputProps } from "@nextui-org/react";
import { Controller, Control, FieldValues, Path } from "react-hook-form";

interface InputFormProps<T extends FieldValues> extends InputProps {
    control: Control<T>;
    name: Path<T>;
    inputClassName?: string;
}

const InputForm = <T extends FieldValues>({ control, name, inputClassName, ...props }: InputFormProps<T>) => {
    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState: { error } }) => (
                <Input
                    {...field}
                    {...props}
                    isInvalid={!!error}
                    errorMessage={error?.message}
                    classNames={{
                        label: "!text-skin-neutral-400 !font-bold !text-content-2 md:!text-title-2 whitespace-nowrap group-data-[filled-within=true]:mt-1",
                        input: `!bg-skin-white !text-skin-neutral-400 font-bold text-content-2 md:!text-title-2 placeholder:!text-skin-neutral-200 placeholder:font-semibold max-md:placeholder:text-content-1 ${inputClassName}`,
                        innerWrapper: "!bg-skin-white disabled:!bg-skin-neutral-50 gap-2 hover:!bg-skin-white pb-0 group-data-[has-label=true]:pt-9",
                        inputWrapper: "pl-3 md:pl-5 pr-3 h-11 md:h-12 shadow-input rounded-lg lg:rounded-10 !bg-skin-white border border-skin-neutral-100 hover:border-skin-primary-500 group-data-[filled-within=true]:border-skin-primary-400 data-[hover=true]:!bg-skin-white group-data-[focus=true]:border-skin-primary-300 group-data-[focus=true]:!bg-skin-white !cursor-text disabled:!bg-skin-neutral-50",
                        }}
                />
            )}
        />
    );
};

export default InputForm;
