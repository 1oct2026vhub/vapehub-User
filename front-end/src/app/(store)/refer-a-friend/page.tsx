import { redirectIfUnauthenticated } from "@/lib/config/auth.config";
import { Metadata, NextPage } from "next";
import { ReactElement } from "react";
import ReferralForm from "./ReferralForm";
import BreadCrumbs from "@/components/BreadCrumbs";
import { ROUTES } from "@/lib/routes";
import { getUserProfile } from "@/lib/server.actions";
import { ServerActionStatus } from "@/lib/config/app.config";

export const metadata: Metadata = {
    title: "Refer a Friend | VapeHub",
    description: "At Vapehub we believe that friends and family should be treated every so often! We have made it super easy for you to treat multiple people with a discount",
};
const breadcrumbs = [
    { label: "Home", href: ROUTES.WELCOME },
    { label: "Refer a Friend", href: ROUTES.REFERRAL, isActive: true },
];

const ReferFriend: NextPage = async (): Promise<ReactElement> => {
    await redirectIfUnauthenticated();
    const response = await getUserProfile();
    const referralCode = response.status === ServerActionStatus.SUCCESS ? response.data?.referral_code: "";

    return (
        <section className="product-listing-container flex-col">
            <BreadCrumbs items={breadcrumbs} />
            <div className="space-y-6">
                <div className='space-y-4'>
                    <h1 className='primary-gradient-600 text-h5 md:text-h3 font-bold w-fit'>Refer a Friend</h1>
                    <div className="text-content-2 md:text-content-1 font-semibold md:font-bold text-skin-neutral-400">
                        <p>
                            At Vapehub we believe that friends and family should be treated every so often! We have made it super easy for you to treat multiple people with a discount code. What’s great is that in return for you sharing a treat with your friend, we will treat you. So, how does it all work? It’s very straightforward. Firstly, refer multiple people by using the form below. Secondly, your friend(s) shall receive a unique discount code from us. Finally, you will also receive a discount code once your friend shops with us and uses their discount code. By referring multiple friends, you will receive a discount code each time a friend completes a purchase and uses their discount code!
                        </p>
                    </div>
                </div>
            </div>
            <ReferralForm referralCode={referralCode} />
        </section>
         
    );
};

export default ReferFriend;
