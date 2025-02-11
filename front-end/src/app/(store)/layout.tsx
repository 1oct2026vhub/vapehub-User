import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { PropsWithChildren, ReactNode } from "react"

const StoreRootLayout = ({
  children,
}: Readonly<PropsWithChildren>): ReactNode => {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  )
}
export default StoreRootLayout;
