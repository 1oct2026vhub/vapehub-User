
import SectionHeading from "@/components/ui/SectionHeading";
import TestimonialSlider, { Testimonial } from "@/components/TestimonialSlider";
import { getTrustpilotReviews } from "@/lib/server.actions";
import { AsyncReactElement, ServerActionStatus } from "@/lib/config/app.config";
import { FunctionComponent } from "react";

interface TestimonialsProps {
    title?: string;
}

const Testimonials: FunctionComponent<TestimonialsProps> = async ({
    title = "Your Stamp of Approval",
}): AsyncReactElement => {
    const response = await getTrustpilotReviews({ page: 1, per_page: 20 });

    if (response.status === ServerActionStatus.ERROR) {
        return <p>{response.message}</p>;
    }

    // Map Trustpilot reviews to the format expected by TestimonialSlider
    const testimonials: Testimonial[] = response.data?.reviews?.map((review) => ({
        id: review.id,
        user_name: review.consumer?.displayName || 'Anonymous',
        rating: review.stars,
        comment: review.text,
        verified_by: true, // Trustpilot reviews are always verified
        user: null, // Trustpilot doesn't provide user profile data
    })) || [];

    return (
        <section className="space-y-3 md:space-y-5">
            <SectionHeading title={title} />
            <div className="slider-container section-slider testimonial-slider">
                <TestimonialSlider data={testimonials} />
            </div>
        </section>
    );
};

export default Testimonials;
