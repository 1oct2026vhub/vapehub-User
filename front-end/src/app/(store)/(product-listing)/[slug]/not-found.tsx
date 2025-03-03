import { ROUTES } from '@/lib/routes';
import Link from 'next/link';
import React from 'react'; 

const NotFoundPage: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">404 - Page Not Found</h1>
            <p className="text-lg text-gray-600 mb-8">Sorry, the page you are looking for does not exist.</p>
            <Link href={ROUTES.WELCOME} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                    Go Back Home
            </Link>
        </div>
    );
};

export default NotFoundPage;