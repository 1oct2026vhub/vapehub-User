'use client'

import { ROUTES } from "@/lib/routes";
import { Button } from "@nextui-org/button";
import { signOut } from "next-auth/react";
import React from "react";

interface LogoutButtonProps {
  className?: string;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ className }) => {
  const handleLogout = () => {
    signOut({ callbackUrl: ROUTES.MY_ACCOUNT });
  };

  return (
    <Button onPress={handleLogout} className={className}>
      Logout
    </Button>
  );
};

export default LogoutButton; 