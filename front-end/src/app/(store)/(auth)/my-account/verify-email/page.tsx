import { Metadata, NextPage } from "next"; 
import ValidateEmail from "../_components/ValidateEmail";
import {  AsyncReactElement, RouteParams } from "@/lib/config/app.config";
  
export const metadata: Metadata = {
  title: "My account | Verify Email",
  description: "",
};

interface Props {
  searchParams: Promise<RouteParams>;
}

const VerifyEmail: NextPage<Props> = async ({
  searchParams
}
): AsyncReactElement => {
    // asynchronous access of `params.token`. 
  const { token } = await searchParams
  
  if (!token) {
    return (
       <p>Invalid verification link</p>
    );
  }

    return (
        <ValidateEmail token={token} />
    );
};

export default VerifyEmail;