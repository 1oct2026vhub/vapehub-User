'use client';

import { useSession } from 'next-auth/react';
import AccountSidebar from './_components/AccountSidebar';
import MyAccountHeading from '@/components/ui/MyAccountHeading';

export default function MyAccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();

  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Loading...</p>
      </div>
    );
  }

  return (
   
    <div className="container mx-auto px-4 py-8 lg:px-12.5 w-full max-w-[1520px]">
     {status === 'authenticated' && 
     <MyAccountHeading className="mb-6" />}   
      <div className="flex flex-col md:flex-row gap-8">
        {status === 'authenticated' && (
          <div className="md:w-1/4">
            <AccountSidebar />
          </div>
        )}
        <div className={status === 'authenticated' ? 'md:w-3/4' : 'w-full'}>  
          {children}
        </div>
      </div>
    </div> 
  );
}
