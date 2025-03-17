"use client"
import React, { useEffect, useState } from "react";
import { Accordion, AccordionItem } from "@nextui-org/react";
import SectionHeading from "./ui/SectionHeading";
import ViewAllLink from "./ui/ViewAllLink";
import { getFaqs } from "@/lib/server.actions";
import { FaqResponse } from "@/lib/config/global.config";
import { ServerActionStatus } from "@/lib/config/app.config";
import { toast } from "sonner";


interface FAQProps {
    title?: string;
    viewAllHref?: string;
    type: "product" | "brand" | "category" | "variant" | "common";
    id: number;
}

const FAQSection: React.FC<FAQProps> = ({
    title = "FAQ",
    viewAllHref = "#",
    type,
    id,
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
            setFaqs(faqs.data);
          } else {
            setFaqs([]);
            toast.error(faqs.message);
          }
        };
        fetchFaqs();
      }, []);

    return (
        <div className="w-full space-y-3 md:space-y-5 xl:space-y-7.5">
            {/* FAQ Heading & View All */}
            <div className="flex items-center justify-between w-full">
                <SectionHeading title={title} />
                <ViewAllLink href={viewAllHref} />
            </div>
            {faqs.length > 0 ? (
               
            <Accordion variant="splitted" className="!px-0" itemClasses={itemClasses} defaultExpandedKeys={["0"]}>
                {faqs.map((faq, index) => (
                    <AccordionItem key={index} aria-label={faq.question} title={faq.question}>
                        {faq.answer}
                    </AccordionItem>
                ))}
            </Accordion> 
            ) : (
                <div className="text-center text-skin-neutral-300 text-content-1">No FAQs found</div>
            )}
        </div>
    );
};

export default FAQSection;
