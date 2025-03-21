import React from "react";
import { Metadata } from "next";
import FAQSection from "@/components/FAQSection";
import BreadCrumbs from "@/components/BreadCrumbs";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = {
    title: "Frequently Asked Questions | VapeHub",
    description: "Find answers to commonly asked questions about our products and services.",
};

const breadcrumbs = [
    { label: "Home", href: ROUTES.WELCOME },
    { label: "FAQ", href: ROUTES.FAQ, isActive: true },
];

export default function FAQPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    const type = (searchParams.type as "product" | "brand" | "category" | "variant" | "common") || "common";
    const id = parseInt(searchParams.id as string) || 0;

    return (
        <main className='px-4 lg:px-9 xl:px-12.5 py-7 xl:py-10 flex flex-col gap-7 xl:gap-10'>
            <BreadCrumbs items={breadcrumbs} />
            <section className="w-full ">
                    <FAQSection
                        title="Frequently Asked Questions"
                        type={type}
                        id={id}
                        showAll={true}
                    />              
            </section>
        </main>
    );
}
