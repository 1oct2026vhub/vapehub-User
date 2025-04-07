"use client";
import { Button } from "@nextui-org/button";
import { useRouter } from "next/navigation";

const GoBackButton = () => {
    const router = useRouter();
    const handleGoBack = () => {
        router.back();
    }
    return (
        <Button onPress={handleGoBack} className="btn primary-btn w-full text-center text-title-2 font-semibold">
            Go Back
        </Button>
    );
}

export default GoBackButton;
