import React from 'react'
import HeaderTopBar from "@/components/HeaderTopBar";
import NavigationMenu from "@/components/NavigationMenu";
import PromotionBanner from "@/components/ui/PromotionBanner";
import { Category } from '@/lib/config/category.config';
import { getCategoryList } from '@/lib/server.actions';
import { ServerActionStatus } from '@/lib/config/app.config';

const Header = async () => {
     const response = await getCategoryList();
        if(response.status !== ServerActionStatus.SUCCESS) {
          return <div>{response.message}</div>;
        }
        const categories: Category[] = response.data;
        // const megaMenuResponse = await getHeaderMegaMenu();
        // if(megaMenuResponse.status !== ServerActionStatus.SUCCESS) {
        //   return <div>{megaMenuResponse.message}</div>;
        // }
        // const megaMenu: HeaderMegaMenuResponse = megaMenuResponse.data;
        // console.log(megaMenu);
       
        
    return (
        <>
            <PromotionBanner message="New! Try the AL-Fakher Hypermax 15000 Puffs!" />
            <header className="px-4 lg:px-9 xl:px-12.5 pt-3.5 pb-2.5 lg:py-9.5 lg:border-b lg:border-skin-neutral-500 flex flex-col gap-9 bg-white relative">
                <HeaderTopBar categories={categories}/>
                <NavigationMenu categories={categories}/>
            </header>
        </>
    )
}

export default Header