import { ReactElement } from "react";
import LostPasswordForm from "../_components/LostPasswordForm";
import { Metadata, NextPage } from "next";
import { redirectIfAuthenticated } from "@/lib/config/auth.config";

export const metadata: Metadata = {
    title: "My account | Lost Password",
    description: "",
  };

  const LostPassword: NextPage =  async ():Promise<ReactElement> => {
    await redirectIfAuthenticated();

    return (
        <LostPasswordForm/>
    )
  }
export default LostPassword;