'use client';

import React from "react";
import { Input, InputProps } from "@nextui-org/react";

const InputForm: React.FC<InputProps> = (props) => {
    return (
        <Input
            {...props}
            classNames={{
                label: "!text-skin-neutral-400 !font-bold text-content-2 md:!text-title-2",
                input: "!bg-skin-white !text-skin-neutral-400 font-bold text-content-2 md:!text-title-2 placeholder:!text-skin-neutral-400",
                innerWrapper: "!bg-skin-white gap-2 hover:!bg-skin-white group-data-[filled=true]:!bg-skin-neutral-50",
                inputWrapper: "pl-5 pr-3 h-12 shadow-input rounded-lg lg:rounded-10 !bg-skin-white border border-skin-neutral-100 hover:border-skin-primary-500 data-[hover=true]:!bg-skin-white group-data-[filled=true]:!bg-skin-neutral-50 group-data-[focus=true]:border-skin-primary-300 group-data-[focus=true]:!bg-skin-white !cursor-text",
            }}
        />
    );
};

export default InputForm;
