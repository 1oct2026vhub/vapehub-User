import React from "react";
import { Metadata, NextPage } from "next";
import FAQSection from "@/components/FAQSection";
import BreadCrumbs from "@/components/BreadCrumbs";
import { ROUTES } from "@/lib/routes";
import { AsyncReactElement } from "@/lib/config/app.config";

export const metadata: Metadata = {
    title: "FAQ | VapeHub",
    description: "Find answers to commonly asked questions about our products and services.",
};


interface Props {  
    searchParams: Promise<{
        [key: string]: string | string[] | undefined;
    }>
} 
const breadcrumbs = [
    { label: "Home", href: ROUTES.WELCOME },
    { label: "FAQ", href: ROUTES.FAQ, isActive: true },
];

const FAQPage: NextPage<Props> = async ({
    searchParams,
}): AsyncReactElement => {
    const params = await searchParams;
    const type =  (params?.type as "product" | "brand" | "category" | "variant" | "common") || "common";
    const id = parseInt(params?.id as string) || 0;

    return (
        <main className='px-4 lg:px-9 xl:px-12.5 py-7 xl:py-10 flex flex-col gap-7 xl:gap-10'>
            <BreadCrumbs items={breadcrumbs} />
            <section className="w-full ">
                    <FAQSection
                        title="Frequently Asked Questions"
                        type={type}
                        id={id}
                    />              
            </section>
        </main>
    );
}

export default FAQPage;
