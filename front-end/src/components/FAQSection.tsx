"use client"
import React, { useEffect, useState } from "react";
import { Accordion, AccordionItem } from "@nextui-org/react";
import SectionHeading from "./ui/SectionHeading";
// import ViewAllLink from "./ui/ViewAllLink";
import { getFaqs } from "@/lib/server.actions";
import { FaqResponse } from "@/lib/config/global.config";
import { ServerActionStatus } from "@/lib/config/app.config";
import { toast } from "sonner";
import EmptyPlaceholder from "./ui/EmptyPlaceholder";
// import Link from "next/link";
// import { ROUTES } from "@/lib/routes";

interface FAQProps {
    title?: string;
    viewAllHref?: string;
    type: "product" | "brand" | "category" | "variant" | "common";
    id: number;
    showAll?: boolean;
}

const FAQSection: React.FC<FAQProps> = ({
    title = "FAQ",
    // viewAllHref = ROUTES.FAQ,
    type,
    id,
    showAll = false,
}) => {
 
    const itemClasses = {
        base: "w-full rounded-lg shadow-input border border-skin-neutral-100",
        title: "text-title-2 font-bold",
        trigger: '',
        indicator: "text-medium text-skin-neutral-500 -rotate-90 data-[open=true]:rotate-90",
        content: "font-bold text-skin-neutral-300 !text-content-1 !py-0 !pb-4",
    };
    const [faqs, setFaqs] = useState<FaqResponse[]>([]);
    useEffect(() => {
        const fetchFaqs = async () => {
          const faqs = await getFaqs(type, id);
          if (faqs.status === ServerActionStatus.SUCCESS) {
            setFaqs(showAll ? faqs.data : faqs.data.slice(0, 10));
          } else {
            setFaqs([]);
            toast.error(faqs.message);
          }
        };
        fetchFaqs();
      }, [type, id, showAll]);

    return (
        <div className="w-full space-y-3 md:space-y-5 xl:space-y-7.5">
            {/* FAQ Heading & View All */}
            <div className="flex items-center justify-between w-full">
                <SectionHeading title={title} />
                {/* {!showAll && <ViewAllLink href={viewAllHref + `?type=${type}&id=${id}`} />} */}
            </div>
            {faqs.length > 0 ? (
               
            <Accordion variant="splitted" className="!px-0" itemClasses={itemClasses} defaultExpandedKeys={["0"]}>
                {faqs.map((faq, index) => (
                    <AccordionItem key={index} aria-label={faq.question} title={faq.question}>
                        {faq.answer}
                    </AccordionItem>
                //     <Link href={`${viewAllHref}#faq-${index}`} className="hover:text-skin-primary">
                //     {faq.question}
                // </Link>
                ))}
            </Accordion> 
            ) : (
                <EmptyPlaceholder title='Uh, oh!' description='No FAQs found' />
            )}
        </div>
    );
};

export default FAQSection;
