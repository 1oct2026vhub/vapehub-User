'use client'

import React from 'react'
import { MenuIcon, SearchIcon, ShoppingCartIcon, UserIcon } from "@/components/Icons";
import InputField from "@/components/InputField";
import Logo from "@/components/ui/Logo";
import { Button } from "@nextui-org/button";
import { Badge } from "@nextui-org/react";
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { Header_FORM_CONFIG, HEADER_IN_SCHEMA, HeaderFormSchema } from '@/lib/config/header.config';
import { useForm } from 'react-hook-form';
import { Form } from '@/components/ui/Form';

const HeaderTopBar = () => {
     const searchFromConfig = useForm<HeaderFormSchema>({
            resolver: zodResolver(HEADER_IN_SCHEMA),
            mode: 'onBlur',
        });
    return (
        <>
            <div className="hidden lg:flex items-center justify-between gap-10">
                <Logo className='max-xl:max-w-64' />
                <div className="flex flex-1 flex-shrink justify-center items-center">
                <Form {...searchFromConfig}>
                <form noValidate className="w-full max-w-[650px] ">
                    <InputField
                        control={searchFromConfig.control}
                        name="search"
                        type={Header_FORM_CONFIG.SEARCH.TYPE}
                        placeholder={Header_FORM_CONFIG.SEARCH.PH}
                        className="max-w-[650px]"
                        classNames={{
                            input: '!text-content-3 md:!text-title-2 font-normal md:font-bold',
                        }}
                        startContent={<SearchIcon />}
                    />
                    </form>
                    </Form>
                </div>

                <div className="flex items-center gap-6">
                    <a href='#' className="flex items-center gap-0.5">
                        <ShoppingCartIcon />
                        <div>
                            <h6 className="uppercase text-content-1 font-extrabold text-skin-neutral-400 leading-tight">1 item</h6>
                            <h6 className="uppercase text-content-1 font-extrabold primary-gradient-100 leading-none">£ 3.99</h6>
                        </div>
                    </a>
                    <Link href='/my-account' className="flex items-center gap-0.5">
                        <UserIcon />
                        <div>
                            <h6 className="uppercase text-content-1 font-extrabold text-skin-neutral-400 leading-tight">welcome</h6>
                            <h6 className="uppercase text-content-1 font-extrabold primary-gradient-100 leading-none">my account</h6>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Responsive screens */}

            <div className="flex flex-col space-y-3.5 lg:hidden">
                <div className="flex items-center justify-between gap-5">
                    <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        startContent={<MenuIcon />}
                    />
                    <Logo className="max-w-[174px] max-h-[28px] ml-6" />
                    <div className="flex items-center gap-1">
                    <Link href='/my-account'>
                        <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            startContent={<UserIcon />}
                        />
                        </Link>
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
                    
                    <Form {...searchFromConfig}>
                <form noValidate className="w-full">
                    <InputField
                        control={searchFromConfig.control}
                        name="search"
                        type={Header_FORM_CONFIG.SEARCH.TYPE}
                        placeholder={Header_FORM_CONFIG.SEARCH.PH}
                        className="w-full"                        
                        startContent={<SearchIcon />}
                    />
                    </form>
                    </Form>
                </div>
            </div>
        </>
    )
}

export default HeaderTopBar