import { Metadata } from "next";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
// import { PropsWithChildren, ReactElement } from "react"
import { PropsWithChildren, ReactElement, Suspense } from "react"
import { getCategoryList, getFlashNews, getHeaderMegaMenu } from '@/lib/server.actions';
import { ServerActionStatus } from '@/lib/config/app.config';
import { FlashNewsItem } from '@/lib/config/global.config';
import HistoryProvider from "@/components/HistoryProvider";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || ''),
  alternates: {
    canonical: './',
  },
};

const StoreRootLayout = async ({
  children,
}: Readonly<PropsWithChildren>): Promise<ReactElement> => {
  const megaMenuResponse = await getHeaderMegaMenu();
  if (megaMenuResponse.status !== ServerActionStatus.SUCCESS) {
    return <div>{megaMenuResponse.message}</div>;
  }
  const megaMenu = megaMenuResponse.data;

  const response = await getCategoryList();
  if (response.status !== ServerActionStatus.SUCCESS) {
    return <div>{response.message}</div>;
  }

  const flashNewsResponse = await getFlashNews(true);
  let flashNews: FlashNewsItem[] = [];
  if (flashNewsResponse.status === ServerActionStatus.SUCCESS) {
    flashNews = flashNewsResponse.data;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header megaMenu={megaMenu} flashNews={flashNews} />
      <Suspense fallback={
        <div className="w-full max-w-[1520px] mx-auto">
          {children}
        </div>
      }>
        <HistoryProvider>
          <div className="w-full max-w-[1520px] mx-auto">
            {children}
          </div>
        </HistoryProvider>
      </Suspense>
      <Footer />
    </div>
  )
}
export default StoreRootLayout;
