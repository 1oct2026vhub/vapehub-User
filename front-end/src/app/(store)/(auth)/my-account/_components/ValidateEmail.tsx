import UiError from "@/components/ui/UiError";
import { ServerActionStatus } from "@/lib/config/app.config";
import { ROUTES } from "@/lib/routes";
import { verifyUserEmailAction } from "@/lib/server.actions";
import { FunctionComponent, ReactElement } from "react";
import VerificationSuccess from "./VerificationSuccess";
import { headers } from "next/headers";

interface Props {
    token: string;
}

const ValidateEmail: FunctionComponent<Props> = async ({ token }): Promise<ReactElement> => {
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || '';

    // Block bots, crawlers, previews, and known non-browser HTTP clients
    const isUnsupportedEnvironment = /Googlebot|Bingbot|Slurp|DuckDuckBot|YandexBot|facebot|ia_archiver|LinkedInBot|Twitterbot|Slackbot|TelegramBot|WhatsApp|SkypeUriPreview|Discordbot|facebookexternalhit|FBAN|FBAV|Instagram|Line|Messenger|curl|python-requests|Java|Ruby|Go-http-client|okhttp/i.test(userAgent);

    if (isUnsupportedEnvironment) {
        return <UiError
            error="Verification not supported in this view"
            description="Please open this link in a standard web browser (like Chrome or Safari) to verify your email."
            redirect={{
                link: ROUTES.MY_ACCOUNT,
                name: 'Login',
            }}
        />
    }

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