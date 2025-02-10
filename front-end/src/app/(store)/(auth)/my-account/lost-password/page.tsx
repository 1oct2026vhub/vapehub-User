import { ReactElement } from "react";
import LostPasswordForm from "../_components/LostPasswordForm";
import { Metadata, NextPage } from "next";

export const metadata: Metadata = {
    title: "My account | Lost Password",
    description: "",
  };

  const LostPassword: NextPage =  ():ReactElement => {
    return (
        <LostPasswordForm/>
    )
  }
export default LostPassword;