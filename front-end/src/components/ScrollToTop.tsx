 "use client"
import { useLayoutEffect } from "react"; 

const ScrollToTop: React.FC = () => {
    useLayoutEffect(() => {
        window.history.scrollRestoration = 'manual';
      }, []);
    return null;
};

export default ScrollToTop;
 