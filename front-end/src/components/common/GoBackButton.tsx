"use client";
import { Button } from "@nextui-org/button";
import { useRouter } from "next/navigation";

const GoBackButton = () => {
    const router = useRouter();
    const handleGoBack = () => {
        router.back();
    }
    return (
        <Button onPress={handleGoBack} className="btn primary-btn w-full text-center text-xl md:text-2xl font-semibold uppercase !h-12">
            Go Back
        </Button>
    );
}

export default GoBackButton;
