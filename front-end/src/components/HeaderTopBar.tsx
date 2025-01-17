'use client'

import React from 'react'
import { MenuIcon, SearchIcon, ShoppingCartIcon, UserIcon } from "@/components/Icons";
import InputField from "@/components/InputField";
import Logo from "@/components/ui/Logo";
import { Button } from "@nextui-org/button";
import { Badge } from "@nextui-org/react";

const HeaderTopBar = () => {
    return (
        <>
            <div className="hidden lg:flex items-center justify-between gap-10">
                <Logo className='max-xl:max-w-64' />
                <div className="flex flex-1 flex-shrink justify-center items-center">
                    <InputField
                        type="search"
                        placeholder="Search products, brands or anything else!"
                        className="max-w-[650px]"
                        startContent={<SearchIcon />}
                    />
                </div>

                <div className="flex items-center gap-6">
                    <a href='#' className="flex items-center gap-0.5">
                        <ShoppingCartIcon />
                        <div>
                            <h6 className="uppercase text-content-1 font-extrabold text-skin-neutral-400 leading-tight">1 item</h6>
                            <h6 className="uppercase text-content-1 font-extrabold primary-gradient-100 leading-none">£ 3.99</h6>
                        </div>
                    </a>
                    <a href='#' className="flex items-center gap-0.5">
                        <UserIcon />
                        <div>
                            <h6 className="uppercase text-content-1 font-extrabold text-skin-neutral-400 leading-tight">welcome</h6>
                            <h6 className="uppercase text-content-1 font-extrabold primary-gradient-100 leading-none">my account</h6>
                        </div>
                    </a>
                </div>
            </div>

            <div className="flex flex-col gap-5 lg:hidden">
                <div className="flex items-center justify-between gap-5">
                    <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        startContent={<MenuIcon />}
                    />
                    <Logo className="max-w-[155px] max-h-[25px]" />
                    <div className="flex items-center gap-1">
                        <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            startContent={<UserIcon />}
                        />
                        <Badge content="1" size="md" className="bg-skin-white border-[#DCDCDC] text-skin-black text-content-2 font-bold">
                            <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                startContent={<ShoppingCartIcon />}
                            />
                        </Badge>
                    </div>
                </div>
                <div className="flex flex-1 flex-shrink justify-center items-center">
                    <InputField
                        type="search"
                        placeholder="Search products, brands or anything else!"
                        required
                        className="w-full"
                        startContent={<SearchIcon />}
                    />
                </div>
            </div>
        </>
    )
}

export default HeaderTopBar