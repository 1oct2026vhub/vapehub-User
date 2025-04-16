'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { getCookie, setCookie } from 'cookies-next';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@nextui-org/react";

interface AgeVerificationContextType {
  isVerified: boolean;
  setIsVerified: (value: boolean) => void;
}

const AgeVerificationContext = createContext<AgeVerificationContextType | undefined>(undefined);

export function AgeVerificationProvider({ children }: { children: React.ReactNode }) {
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isDenied, setIsDenied] = useState<boolean>(false);

  useEffect(() => {
    const ageVerified = getCookie('age-verified');
    if (ageVerified === 'true') {
      setIsVerified(true);
    } else {
      setIsModalOpen(true);
      setIsVerified(false);
    }
  }, []);

  const handleVerification = () => {
    setCookie('age-verified', 'true', { maxAge: 365 * 24 * 60 * 60 }); // Cookie expires in 1 year
    setIsVerified(true);
    setIsModalOpen(false);
    setIsDenied(false);
  };

  const handleDeny = () => {
    setIsVerified(false);
    setIsModalOpen(false);
    setIsDenied(true);
  };

  // Show nothing during initial load
  if (isVerified === null) {
    return null;
  }

  return (
    <AgeVerificationContext.Provider value={{ isVerified: Boolean(isVerified), setIsVerified }}>
      {isDenied ? (
        <div className="flex min-h-screen items-center justify-center bg-white">
          <div className="text-center p-8 max-w-md">
            <h1 className="text-2xl font-bold mb-4">Sorry!</h1>
            <p>You are not old enough to view the site ...</p>
          </div>
        </div>
      ) : (
        <>
          <Modal 
            isOpen={isModalOpen}
            onClose={() => {}}
            hideCloseButton
            isDismissable={false}
          >
            <ModalContent>
              <ModalHeader className="flex flex-col gap-1">Age Verification Required</ModalHeader>
              <ModalBody>
                <p>You must be 18 years old to access this website.</p>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="bordered" onPress={handleDeny}>
                  No
                </Button>
                <Button color="primary" onPress={handleVerification}>
                  Yes, I am of legal age
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
          {children}
        </>
      )}
    </AgeVerificationContext.Provider>
  );
}

export const useAgeVerification = () => {
  const context = useContext(AgeVerificationContext);
  if (context === undefined) {
    throw new Error('useAgeVerification must be used within an AgeVerificationProvider');
  }
  return context;
}; 