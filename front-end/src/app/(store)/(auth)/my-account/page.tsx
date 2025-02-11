

import { Metadata, NextPage } from "next";
import { ReactElement } from "react";
import MyAccountTab from "./_components/MyAccountTab";

export const metadata: Metadata = {
    title: "My account | VapeHub",
    description: "",
};

const MyAccount: NextPage = (): ReactElement => {
    return (
        <div className="auth-form-container">
            <MyAccountTab />
        </div >
    );
};

export default MyAccount;