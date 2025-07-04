import React from 'react'
import HeaderTopBar from "@/components/HeaderTopBar";
import NavigationMenu from "@/components/NavigationMenu";
import { FlashNewsItem } from '@/lib/config/global.config';
// import { Category } from '@/lib/config/category.config';
import { getCategoryList, getFlashNews } from '@/lib/server.actions';
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
       const response = await getCategoryList();
    if (response.status !== ServerActionStatus.SUCCESS) {
        return <div>{response.message}</div>;
    }
    // const categories: Category[] = response.data;
    const flashNewsResponse = await getFlashNews(true);
    let flashNews: FlashNewsItem[] = [];
    if (flashNewsResponse.status === ServerActionStatus.SUCCESS) {
        flashNews = flashNewsResponse.data;
    }
        console.log("megaMenu",megaMenu);
    return (
        <>
            <PromotionBanner messages={flashNews} />
            <header className="px-4 lg:px-9 xl:px-12.5 pt-3.5 pb-2.5 lg:py-9.5 lg:border-b lg:border-skin-neutral-500 flex flex-col gap-9 bg-white relative">
                <HeaderTopBar categories={[]}/>
                <NavigationMenu menus={megaMenu.data}/>
            </header>
        </>
    )
}

export default Header