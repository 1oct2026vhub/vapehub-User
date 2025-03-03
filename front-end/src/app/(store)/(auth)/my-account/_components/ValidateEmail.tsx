
import UiError from "@/components/ui/UiError";
import { ServerActionStatus } from "@/lib/config/app.config";
import { ROUTES } from "@/lib/routes";
import { verifyUserEmailAction } from "@/lib/server.actions";
import { FunctionComponent, ReactElement } from "react";
import VerificationSuccess from "./VerificationSuccess";

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
                name: 'Login',
            }}
        />
    }

    if (response.status === ServerActionStatus.SUCCESS)
        return (
            <VerificationSuccess data={response.data}/>
        );


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