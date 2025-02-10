import { Metadata, NextPage } from "next";
import { AsyncReactElement, RouteParams } from "@/lib/config/app.config";
import ResetPasswordForm from "../_components/ResetPasswordForm";

export const metadata: Metadata = {
    title: "My account | Reset Password",
    description: "",
  };
  

interface Props {
  searchParams: Promise<RouteParams>;
}

const ResetPassword: NextPage<Props> = async ({
  searchParams
}): AsyncReactElement => {
  const {token} = await searchParams 

  if (!token) {
    return (
      <p>Invalid Reset Password link</p>
    );
  }

    return (
      <ResetPasswordForm token={token}/>        
    )
  }
export default ResetPassword;