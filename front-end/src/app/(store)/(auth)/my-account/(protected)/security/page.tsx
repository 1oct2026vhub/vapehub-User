'use client'

import MyAccountHeading from "@/components/ui/MyAccountHeading";
import { NextPage } from "next";
import React, { useState } from "react";
import InputForm from "@/components/InputForm";
import { Button } from "@nextui-org/button";
import LogoutButton from "../../_components/LogoutButton";

const AccountSecurity: NextPage = () => {
    const [showButtons, setShowButtons] = useState(false);

    return (
        <main>
            <MyAccountHeading />
            <form className="p-4 bg-skin-white rounded-14 shadow-card space-y-6 w-full h-full md:min-h-[670px] border border-skin-neutral-50">
                <div className="flex items-start flex-col gap-4.5">
                    <h2 className="text-title-2 md:text-title-1 text-skin-neutral-400 font-semibold">
                        User ID
                    </h2>
                    <InputForm
                        type='email'
                        placeholder='dummy@email.com'
                        disabled
                        className='w-full md:max-w-[50%] disabled-input'
                    />
                </div>
                <div className="flex items-start flex-col gap-4.5">
                    <div className='flex items-center gap-4'>
                        <h2 className="text-title-2 md:text-title-1 text-skin-neutral-400 font-semibold leading-none">Password</h2>
                        {!showButtons && (
                            <button
                                onClick={() => setShowButtons(true)}
                                className="primary-gradient-100 text-content-1 font-semibold hover:border-b border-skin-primary-500 cursor-pointer"
                            >
                                Edit
                            </button>
                        )}
                    </div>
                    <InputForm
                        type='password'
                        label='Password'
                        isRequired
                        className='w-full md:max-w-[50%]'
                        aria-disabled="true"
                    />
                </div>
                {showButtons && (
                    <div className="flex items-center gap-4.5 pt-6">
                        <Button
                            type="button"
                            size="lg"
                            radius="md"
                            color="primary"
                            className="btn text-content-1 max-md:h-10 rounded-10 primary-outline-btn !font-extrabold"
                            onPress={() => setShowButtons(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            size="lg"
                            radius="md"
                            color="primary"
                            className="btn text-content-1 max-md:h-10 rounded-10 primary-btn !font-extrabold"
                        >
                            Save
                        </Button>
                    </div>
                )}
            </form>
            <div className="flex md:hidden bg-skin-white p-4 rounded-14 shadow-card w-full mt-4">
                <LogoutButton className="mt-auto red-gradient-100 px-4 py-3 text-content-1 bg-skin-white font-semibold w-full rounded-lg" />
            </div>
        </main>
    );
};

export default AccountSecurity;
