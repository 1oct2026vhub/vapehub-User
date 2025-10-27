
import SectionHeading from "@/components/ui/SectionHeading";
import TestimonialSlider from "@/components/TestimonialSlider";
import { getReviews } from "@/lib/server.actions";
import { AsyncReactElement, ServerActionStatus } from "@/lib/config/app.config";
import { FunctionComponent } from "react";

interface TestimonialsProps {
    title?: string;
}

const Testimonials: FunctionComponent<TestimonialsProps> = async ({
    title = "Your Stamp of Approval",
}): AsyncReactElement => {
    const response = await getReviews({ is_visible: true, testimonial: true });

    if (response.status === ServerActionStatus.ERROR) {
        return <p>{response.message}</p>;
    }

    return (
        <section className="space-y-3 md:space-y-5">
            <SectionHeading title={title} />
            <div className="slider-container section-slider testimonial-slider">
                <TestimonialSlider data={response.data?.rows || []} />
            </div>
        </section>
    );
};

export default Testimonials;
