import React from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import TestimonialSlider from "@/components/TestimonialSlider";

interface TestimonialsProps {
    title?: string;
}

const Testimonials: React.FC<TestimonialsProps> = ({
    title = "Your Stamp of Approval",
}) => {
    return (
        <section className="space-y-4.5 md:space-y-7.5">
            <SectionHeading title={title} />
            <div className="slider-container section-slider testimonial-slider">
                <TestimonialSlider />
            </div>
        </section>
    );
};

export default Testimonials;
