import React, { FunctionComponent, ReactElement, useEffect, useState } from "react";
import { Input, InputProps } from "@nextui-org/react";
import { Controller, Control, FieldValues, Path, useFormContext, useWatch } from "react-hook-form";
import {
    DEFAULT_PASSWORD_STATUS,
    PASSWORD_STRENGTH_MESSAGE,
    PasswordStrengthStatus,
    PasswordStrengthTypes,
  } from '@/lib/config/form.config';

interface InputFieldProps<T extends FieldValues> extends InputProps {
  control: Control<T>; // ✅ Hook Form Control
  name: Path<T>; // ✅ Ensures valid field names
  showStatus?: boolean
}

const InputField = <T extends FieldValues>({ control, name,showStatus = false, ...props }: InputFieldProps<T>) => {
   
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <>
        <Input
          {...field}
          {...props} // ✅ Preserves your existing props (like `type`, `placeholder`, etc.)
          isInvalid={!!error} // ✅ Show error styling when invalid
          errorMessage={error?.message} // ✅ Display validation errors          
          classNames={{
            label: "!text-skin-neutral-400 !font-bold text-content-2 md:!text-title-2",
            input: "!bg-skin-white !text-skin-neutral-400 font-bold !text-content-2 md:!text-title-2 placeholder:!text-skin-neutral-400 truncate",
            innerWrapper: "!bg-skin-white gap-2 hover:!bg-skin-white group-data-[has-label=true]:pt-9",
            inputWrapper:
              "pl-5 pr-3 h-11 md:h-12 shadow-input rounded-lg lg:rounded-[10px] !bg-skin-white border border-skin-neutral-100 hover:border-skin-primary-500 data-[hover=true]:!bg-skin-white group-data-[focus=true]:border-skin-primary-300 group-data-[focus=true]:!bg-skin-white !cursor-text",
          }}
          
        />
        {(showStatus && error?.message) && <ShowPasswordValidityStatus name={name as string} />}
        </>
      )}
    />
  );
};

export default InputField;


interface StatusProps {
  name: string;
}
const ShowPasswordValidityStatus: FunctionComponent<StatusProps> = ({
    name,
  }): ReactElement => {
    const { status: passwordStatus, isDirty } =
      usePasswordStrengthValidator(name);
  
    return (
      <>
        {isDirty && (
          <ul className='ms-4 list-disc'>
            {Object.entries(PASSWORD_STRENGTH_MESSAGE).map(([_key, _value]) => (
              <li
                key={_key}
                className={`mt-1 text-sm font-medium ${
                  passwordStatus[_key as PasswordStrengthTypes]
                    ? 'text-skin-primary-400 text-opacity-85'
                    : 'text-danger'
                }`}
              >
                {_value}
              </li>
            ))}
          </ul>
        )}
      </>
    );
  };

  const usePasswordStrengthValidator = (
    name: string
  ): {
    status: PasswordStrengthStatus;
    isDirty: boolean;
  } => {
    const [status, setStatus] = useState<PasswordStrengthStatus>(
      DEFAULT_PASSWORD_STATUS
    );
  
    const { getFieldState } = useFormContext();
  
    const password = useWatch({
      name,
    });
  
    useEffect(() => {
      setStatus({
        length: password?.trim().length >= 8,
        upperCase: /[A-Z]/.test(password ?? ''),
        lowerCase: /[a-z]/.test(password ?? ''),
        specialCh: /[!@#$%^&*()_+{}\[\]:;<>,.?~\\-]/.test(password ?? ''),
        totalNumber: /\d/.test(password ?? ''),
      });
    }, [password]);
  
    return {
      status,
      isDirty: getFieldState(name).isDirty,
    };
  };