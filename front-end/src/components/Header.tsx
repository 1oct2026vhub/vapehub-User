import React from 'react'
import HeaderTopBar from "@/components/HeaderTopBar";
import NavigationMenu from "@/components/NavigationMenu";
import PromotionBanner from "@/components/ui/PromotionBanner";
import { getHeaderMegaMenu } from '@/lib/server.actions';
import { ServerActionStatus } from '@/lib/config/app.config';
import { HeaderMegaMenuResponse } from '@/lib/config/header.config';

const Header = async () => {
        const megaMenuResponse = await getHeaderMegaMenu();
        if(megaMenuResponse.status !== ServerActionStatus.SUCCESS) {
          return <div>{megaMenuResponse.message}</div>;
        }
        const megaMenu: HeaderMegaMenuResponse = megaMenuResponse.data;
       
        console.log("megaMenu",megaMenu);
    return (
        <>
            <PromotionBanner message="New! Try the AL-Fakher Hypermax 15000 Puffs!" />
            <header className="px-4 lg:px-9 xl:px-12.5 pt-3.5 pb-2.5 lg:py-9.5 lg:border-b lg:border-skin-neutral-500 flex flex-col gap-9 bg-white relative">
                <HeaderTopBar categories={[]}/>
                <NavigationMenu menus={megaMenu.data}/>
            </header>
        </>
    )
}

export default Header