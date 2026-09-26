import { Metadata } from "next";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import SitewideTrustStrip from "@/components/SitewideTrustStrip";
// import { PropsWithChildren, ReactElement } from "react"
import { PropsWithChildren, ReactElement } from "react"
import { headers } from "next/headers";
import { getCategoryList, getFlashNews, getFooterMenu, getHeaderMegaMenu } from '@/lib/server.actions';
import { ServerActionStatus } from '@/lib/config/app.config';
import { FlashNewsItem } from '@/lib/config/global.config';
import { FooterMenuResponse, HeaderMegaMenuResponse } from '@/lib/config/header.config';
import HistoryProvider from "@/components/HistoryProvider";
import NormalizeInternalLinks from "@/components/NormalizeInternalLinks";
import { resolveSiteUrl } from "@/lib/site-url";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const isSoft404Request = requestHeaders.get('x-vapehub-soft404') === '1';
  const siteUrl = resolveSiteUrl();

  return {
    metadataBase: new URL(siteUrl),
    alternates: isSoft404Request ? { canonical: null } : { canonical: './' },
  };
}

const StoreRootLayout = async ({
  children,
}: Readonly<PropsWithChildren>): Promise<ReactElement> => {
  const [megaMenuResult, categoryListResult, flashNewsResult, footerMenuResult] = await Promise.allSettled([
    getHeaderMegaMenu(),
    getCategoryList(),
    getFlashNews(true),
    getFooterMenu(),
  ]);

  const megaMenu: HeaderMegaMenuResponse =
    megaMenuResult.status === 'fulfilled' &&
    megaMenuResult.value.status === ServerActionStatus.SUCCESS
      ? megaMenuResult.value.data
      : { data: [] };

  // Preserve category list fetch without hard-failing the whole store layout.
  // Some downstream flows rely on this request path, but UI should degrade gracefully.
  const categoryListResponse =
    categoryListResult.status === 'fulfilled' ? categoryListResult.value : null;
  void categoryListResponse;

  let flashNews: FlashNewsItem[] = [];
  if (
    flashNewsResult.status === 'fulfilled' &&
    flashNewsResult.value.status === ServerActionStatus.SUCCESS
  ) {
    flashNews = flashNewsResult.value.data;
  }

  const footerMenu: FooterMenuResponse =
    footerMenuResult.status === 'fulfilled'
      ? footerMenuResult.value
      : {
          data: [],
          socialLinks: {},
          badges: [],
          status: ServerActionStatus.ERROR,
          message: 'Footer menu unavailable',
        };

  return (
    <div className="flex flex-col min-h-screen">
      <NormalizeInternalLinks />
      <Header megaMenu={megaMenu} flashNews={flashNews} />
      <HistoryProvider>
        <div className="w-full max-w-[1520px] mx-auto flex-1">
          {children}
        </div>
      </HistoryProvider>
      <SitewideTrustStrip footerMenu={footerMenu} />
      <Footer footerMenu={footerMenu} />
    </div>
  )
}
export default StoreRootLayout;
