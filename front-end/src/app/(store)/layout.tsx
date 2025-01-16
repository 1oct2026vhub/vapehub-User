import { PropsWithChildren, ReactNode } from "react"

const StoreRootLayout = ({
    children,
  }: Readonly<PropsWithChildren>): ReactNode => {
    return (
        <>{children}</>
    )
  }
  export default StoreRootLayout;
