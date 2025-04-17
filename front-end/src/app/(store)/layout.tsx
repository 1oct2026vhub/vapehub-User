import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { PropsWithChildren, ReactElement } from "react"

const StoreRootLayout = ({
  children,
}: Readonly<PropsWithChildren>): ReactElement => {
     
  return (
    <div className="flex flex-col min-h-screen">
      <Header/>
        {children}
      <Footer/>
    </div>
  )
}
export default StoreRootLayout;
