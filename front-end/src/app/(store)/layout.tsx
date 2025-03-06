import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { PropsWithChildren, ReactElement } from "react"

const StoreRootLayout = ({
  children,
}: Readonly<PropsWithChildren>): ReactElement => {
     
  return (
    <>
      <Header/>
        {children}
      <Footer/>
    </>
  )
}
export default StoreRootLayout;
