import React from 'react'
import HeaderTopBar from "@/components/HeaderTopBar";
import NavigationMenu from "@/components/NavigationMenu";
import PromotionBanner from "@/components/ui/PromotionBanner";
import { Category } from '@/lib/config/category.config';
import { getCategoryList, getFlashNews } from '@/lib/server.actions';
import { ServerActionStatus } from '@/lib/config/app.config';
import { FlashNewsItem } from '@/lib/config/global.config';

const Header = async () => {
    const response = await getCategoryList();
    if (response.status !== ServerActionStatus.SUCCESS) {
        return <div>{response.message}</div>;
    }
    const categories: Category[] = response.data;
    const flashNewsResponse = await getFlashNews(true);
    let flashNews: FlashNewsItem[] = [];
    if (flashNewsResponse.status === ServerActionStatus.SUCCESS) {
        flashNews = flashNewsResponse.data;
    }

    return (
        <>
            <PromotionBanner messages={flashNews} />
            <header className="px-4 lg:px-9 xl:px-12.5 pt-3.5 pb-2.5 lg:py-9.5 lg:border-b lg:border-skin-neutral-500 flex flex-col gap-9 bg-white relative">
                <HeaderTopBar categories={categories} />
                <NavigationMenu categories={categories} />
            </header>
        </>
    )
}

export default Header