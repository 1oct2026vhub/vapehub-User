
import SectionHeading from "@/components/ui/SectionHeading";
import TestimonialSlider from "@/components/TestimonialSlider";
import { getTestimonialsList } from "@/lib/server.actions";
import { AsyncReactElement, ServerActionStatus } from "@/lib/config/app.config";
import { FunctionComponent } from "react";

interface TestimonialsProps {
    title?: string;
}

const Testimonials: FunctionComponent<TestimonialsProps> = async ({
    title = "Your Stamp of Approval",
}): AsyncReactElement => {
    const response = await getTestimonialsList();
    if (response.status == ServerActionStatus.ERROR) {
        return (<p>{response.message}</p>);
    }
    return (
        <section className="space-y-4.5 md:space-y-7.5">
            <SectionHeading title={title} />
            <div className="slider-container section-slider testimonial-slider">
                <TestimonialSlider data={response.data}/>
            </div>
        </section>
    );
};

export default Testimonials;
