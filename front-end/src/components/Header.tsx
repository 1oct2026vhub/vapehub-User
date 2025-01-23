'use client'

import React from 'react'
import HeaderTopBar from "@/components/HeaderTopBar";
import NavigationMenu from "@/components/NavigationMenu";
import PromotionBanner from "@/components/ui/PromotionBanner";

const Header = () => {
    return (
        <>
            <PromotionBanner message="New! Try the AL-Fakher Hypermax 15000 Puffs!" />
            <header className="px-4 lg:px-12.5 pt-3.5 pb-2.5 lg:py-9.5  lg:border-b lg:border-skin-neutral-500 flex flex-col gap-9 bg-white">
                <HeaderTopBar />
                <NavigationMenu />
            </header>
        </>
    )
}

export default Header