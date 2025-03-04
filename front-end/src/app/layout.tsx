import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import GlobalProvider from "@/providers/GlobalProvider";
import { Toaster } from "sonner";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "VapeHub - The Ultimate Online Vape Store",
  description: "Vapehub is the one-stop shop for all your vaping needs! Our online store boasts all the popular brands and products at unbeatable prices with amazing deals.",
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
          content='width=device-width, initial-scale=1.0'
        />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest"></link>
      </head>
      <body
        className={`m-0 min-h-screen bg-skin-white lg:bg-skin-base text-skin-black font-poppins antialiased ${poppins.variable}`}
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
