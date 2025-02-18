
import UiError from "@/components/ui/UiError";
import { ServerActionStatus } from "@/lib/config/app.config";
import { ROUTES } from "@/lib/routes";
import { verifyUserEmailAction } from "@/lib/server.actions";
import { Button } from "@nextui-org/button";
import Image from "next/image";
import Link from "next/link";
import { FunctionComponent, ReactElement } from "react";

interface Props {
    token: string;
}

const ValidateEmail: FunctionComponent<Props> = async ({ token }): Promise<ReactElement> => {
    const response = await verifyUserEmailAction(token);

    if (response.status === ServerActionStatus.ERROR) {

        return <UiError
            error='Verification process failed'
            description={response.message}
            redirect={{
                link: ROUTES.MY_ACCOUNT,
                name: 'login',
            }}
        />
    }

    if (response.status === ServerActionStatus.SUCCESS)
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
                        as={Link}
                        href={ROUTES.MY_ACCOUNT}
                        size="lg"
                        radius="md"
                        color="primary"
                        className="btn primary-btn shadow-input text-content-1 !font-medium md:!min-w-28 h-11 mx-auto"
                    >
                        Login Now
                    </Button>

                </div>
            </div >);


    return (
        <UiError
            error='Verification process failed'
            description={"Expired"}
            redirect={{
                link: ROUTES.MY_ACCOUNT,
                name: 'login',
            }}
        />
    )
};

export default ValidateEmail;