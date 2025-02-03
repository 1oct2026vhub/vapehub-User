import React from "react";
import { Accordion, AccordionItem } from "@nextui-org/react";
import SectionHeading from "./ui/SectionHeading";
import ViewAllLink from "./ui/ViewAllLink";


interface FAQProps {
    title?: string;
    viewAllHref?: string;
}

const FAQSection: React.FC<FAQProps> = ({
    title = "FAQ",
    viewAllHref = "#",
}) => {

    const faqs = [
        { question: "What are disposable vape kits?", answer: "Disposable vape kits (also known as disposable vapes/disposable e-cigarettes/disposable vape pens) are complete vaping devices that are ready to use straight out of the box. They contain everything you need to start vaping, including a built-in battery, coil and e-liquid chamber. They are pre-filled with e-liquid and are inhale activated therefore completely hassle-free. The e-liquid can be nicotine free or it can contain nicotine salt. Nicotine strength can differ between different disposable vapes." },
        { question: "What are disposable vape kits?", answer: "Disposable vape kits (also known as disposable vapes/disposable e-cigarettes/disposable vape pens) are complete vaping devices that are ready to use straight out of the box. They contain everything you need to start vaping, including a built-in battery, coil and e-liquid chamber. They are pre-filled with e-liquid and are inhale activated therefore completely hassle-free. The e-liquid can be nicotine free or it can contain nicotine salt. Nicotine strength can differ between different disposable vapes." },
        { question: "What are disposable vape kits?", answer: "Disposable vape kits (also known as disposable vapes/disposable e-cigarettes/disposable vape pens) are complete vaping devices that are ready to use straight out of the box. They contain everything you need to start vaping, including a built-in battery, coil and e-liquid chamber. They are pre-filled with e-liquid and are inhale activated therefore completely hassle-free. The e-liquid can be nicotine free or it can contain nicotine salt. Nicotine strength can differ between different disposable vapes." },
        { question: "What are disposable vape kits?", answer: "Disposable vape kits (also known as disposable vapes/disposable e-cigarettes/disposable vape pens) are complete vaping devices that are ready to use straight out of the box. They contain everything you need to start vaping, including a built-in battery, coil and e-liquid chamber. They are pre-filled with e-liquid and are inhale activated therefore completely hassle-free. The e-liquid can be nicotine free or it can contain nicotine salt. Nicotine strength can differ between different disposable vapes." },

    ];

    const itemClasses = {
        base: "w-full rounded-lg shadow-input border border-skin-neutral-100",
        title: "text-title-2 font-bold",
        trigger: '',
        indicator: "text-medium text-skin-neutral-500 -rotate-90 data-[open=true]:rotate-90",
        content: "font-bold text-skin-neutral-300 !text-content-1",
    };

    return (
        <div className="w-full space-y-3 md:space-y-5 xl:space-y-7.5">
            {/* FAQ Heading & View All */}
            <div className="flex items-center justify-between w-full">
                <SectionHeading title={title} />
                <ViewAllLink href={viewAllHref} />
            </div>

            {/* Accordion for FAQs */}
            <Accordion variant="splitted" className="!px-0" itemClasses={itemClasses} defaultExpandedKeys={["0"]}>
                {faqs.map((faq, index) => (
                    <AccordionItem key={index} aria-label={faq.question} title={faq.question}>
                        {faq.answer}
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );
};

export default FAQSection;
