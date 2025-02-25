'use client';

import React from "react";
import { Input, InputProps } from "@nextui-org/react";

const InputForm: React.FC<InputProps> = (props) => {
    return (
        <Input
            {...props}
            classNames={{
                label: "!text-skin-neutral-400 !font-bold !text-content-2 md:!text-title-2 whitespace-nowrap",
                input: "!bg-skin-white !text-skin-neutral-400 font-bold text-content-2 md:!text-title-2 placeholder:!text-skin-neutral-400 max-md:placeholder:text-content-2",
                innerWrapper: "!bg-skin-white gap-2 hover:!bg-skin-white pb-0 group-data-[filled=true]:pt-9",
                inputWrapper: "pl-3 md:pl-5 pr-3 h-11 md:h-12 shadow-input rounded-lg lg:rounded-10 !bg-skin-white border border-skin-neutral-100 hover:border-skin-primary-500 data-[hover=true]:!bg-skin-white group-data-[focus=true]:border-skin-primary-300 group-data-[focus=true]:!bg-skin-white !cursor-text",
            }}
        />
    );
};

export default InputForm;
