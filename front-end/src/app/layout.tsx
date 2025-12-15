import type { Metadata } from "next";
import { Oswald, Open_Sans } from "next/font/google";
import "./globals.css";
import GlobalProvider from "@/providers/GlobalProvider";
import { Toaster } from "sonner";
import GoogleAnalytics from "@/components/GoogleAnalytics";

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
});

const openSans = Open_Sans({
  variable: "--font-opensans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "VapeHub - The Ultimate Online Vape Store",
  description: "Vapehub is the one-stop shop for all your vaping needs! Our online store boasts all the popular brands and products at unbeatable prices with amazing deals.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "VapeHub - The Ultimate Online Vape Store",
    description: "Vapehub is the one-stop shop for all your vaping needs! Our online store boasts all the popular brands and products at unbeatable prices with amazing deals.",
    url: "https://www.vapehub.devateam.com/",
    siteName: "VapeHub",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta charSet='UTF-8' />
        <meta
          name='viewport'
          content='width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
        />
        <meta name="robots" content="follow, index, max-snippet:-1, max-video-preview:-1, max-image-preview:large"/>
        <GoogleAnalytics
        GA_MEASUREMENT_ID={process.env.NEXT_PUBLIC_MEASUREMENT_ID ?? ''}
      />
      </head>
      <body
        className={`m-0 min-h-screen bg-white text-skin-black font-opensans antialiased ${oswald.variable} ${openSans.variable}`}
      >
        <GlobalProvider>
          <Toaster
            richColors
            position='top-right'
          />
          {children}
        </GlobalProvider>
      </body>
    </html>
  );
}
