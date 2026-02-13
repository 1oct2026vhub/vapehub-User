'use client'

import { useEffect } from "react";
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

/**
 * Triggers sign-out and redirect to login when mounted (same as LogoutButton action).
 * Use when the API returns "Unauthorized" or "Invalid or missing token" (e.g. customer deleted on admin).
 */
export function SignOutRedirectToLogin() {
  useEffect(() => {
    signOut({ callbackUrl: ROUTES.MY_ACCOUNT });
  }, []);

  return (
    <div className="flex items-center justify-center p-6 text-skin-neutral-400 text-content-1">
      Signing out…
    </div>
  );
} 