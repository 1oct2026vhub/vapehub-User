'use client'

import MyAccountHeading from "@/components/ui/MyAccountHeading";
import { NextPage } from "next";
import React, { useState } from "react";
import AccountSidebar from "../_components/AccountSidebar";
import Link from "next/link";
import InputForm from "@/components/InputForm";
import { Button } from "@nextui-org/button";

const AccountSecurity: NextPage = () => {

    const [showButtons, setShowButtons] = useState(false);

    return (
        <main className="px-4 lg:px-9 xl:px-12.5 pt-5 pb-10 flex flex-col gap-6 lg:gap-10">
            <MyAccountHeading />
            <section className="flex flex-col md:flex-row items-start justify-between gap-4">
                <AccountSidebar />

                <form className="p-4 bg-skin-white rounded-14 shadow-card space-y-6 w-full h-full md:min-h-[670px]">
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
                            <h2 className="text-title-2 md:text-title-1 text-skin-neutral-400 font-semibold">Password</h2>
                            {!showButtons && (
                                <button
                                    onClick={() => setShowButtons(true)}
                                    className="pr-4 primary-gradient-100 text-content-1 font-semibold hover:border-b border-skin-primary-500 cursor-pointer"
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

                <div className="flex md:hidden bg-skin-white p-4 rounded-14 shadow-card w-full">
                    <Link
                        href="/logout"
                        className="mt-auto red-gradient-100 px-4 py-3 text-content-1 font-semibold text-center w-full rounded-lg"
                    >
                        Logout
                    </Link>
                </div>
            </section>
        </main>
    );
};

export default AccountSecurity;
