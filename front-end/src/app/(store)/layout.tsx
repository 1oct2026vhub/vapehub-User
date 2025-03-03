import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { ServerActionStatus } from "@/lib/config/app.config";
import { Category } from "@/lib/config/category.config";
import { getCategoryList } from "@/lib/server.actions";
import { PropsWithChildren, ReactNode } from "react"

const StoreRootLayout = async ({
  children,
}: Readonly<PropsWithChildren>): Promise<ReactNode> => {
  const response = await getCategoryList();
    if(response.status !== ServerActionStatus.SUCCESS) {
      return <div>Failed to load categories</div>;
    }
    const categories: Category[] = response.data;
   
    
  return (
    <>
      <Header categories={categories}/>
        {children}
      <Footer categories={categories}/>
    </>
  )
}
export default StoreRootLayout;
