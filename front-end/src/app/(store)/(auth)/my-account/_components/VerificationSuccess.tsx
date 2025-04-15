"use client"
import { VerifyUserEmailResponse } from "@/lib/config/auth.config";
import { ROUTES } from "@/lib/routes";
import { Button } from "@nextui-org/button";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FunctionComponent, ReactElement, useEffect } from "react";

interface Props {
    data: VerifyUserEmailResponse;
}

const VerificationSuccess: FunctionComponent<Props> = ({ data }): ReactElement => {
     const {status, } = useSession();
     const router = useRouter();
    const handleSubmit = async () => {
        await signIn('credentials', {
            ...data,
            redirect: false
        });

    }
    useEffect(() => {
        if (status === 'authenticated') {
            router.push(ROUTES.MY_ACCOUNT);
        }
    }, [status, router]);
    return (
        <div className="auth-form-container md:!py-40">
            <div className="auth-form-wrapper !max-w-[600px] !p-5 !gap-5">
                <div className="space-y-3.5 pb-3.5 border-b border-skin-neutral-100 text-center w-full">
                    <Image
                        src='/images/verify-email.svg'
                        alt="verify-email"
                        width={242}
                        height={203}
                        className="mx-auto"
                    />
                    <h2 className="mx-auto text-title-2 md:text-title-1 text-skin-neutral-300 font-bold ">You’re All Set to Blow Clouds!</h2>
                    <p className="text-content-2 md:text-content-1 text-center font-normal text-skin-neutral-300 mx-auto max-w-[406px]">Your email is verified. Get ready to explore and elevate your vaping journey!</p>
                </div>

                <Button
                    onPress={() => { handleSubmit() }}
                    size="lg"
                    radius="md"
                    color="primary"
                    className="btn primary-btn shadow-input text-content-1 !font-medium md:!min-w-28 h-11 mx-auto"
                >
                    Go to Dashboard
                </Button>

            </div>
        </div >
    );
};

export default VerificationSuccess;