"use client"
import React from 'react'
import HeaderTopBar from "@/components/HeaderTopBar";
import NavigationMenu from "@/components/NavigationMenu";
import { FlashNewsItem } from '@/lib/config/global.config';
// import { Category } from '@/lib/config/category.config';
import PromotionBanner from "@/components/ui/PromotionBanner";
// import { ServerActionStatus } from '@/lib/config/app.config';
import { HeaderMegaMenuResponse } from '@/lib/config/header.config';
import { usePathname } from 'next/navigation';

interface HeaderProps {
    megaMenu: HeaderMegaMenuResponse;
    flashNews: FlashNewsItem[];
}

const Header: React.FC<HeaderProps> = ({ megaMenu, flashNews }) => {
    const pathname = usePathname();
    const isVerificationPage = pathname.includes('/verify-email');

    return (
        <>
            {!isVerificationPage && <PromotionBanner messages={flashNews} />}
            <header className="px-4 lg:px-9 xl:px-12.5 pt-3.5 pb-2.5 lg:py-9.5 lg:border-b lg:border-skin-neutral-500 flex flex-col gap-9 bg-white relative">
                <HeaderTopBar categories={[]}/>
                {!isVerificationPage && <NavigationMenu menus={megaMenu.data}/>}
            </header>
        </>
    )
}

export default Header