import { getLegalContentByKey } from '@/lib/server.actions';
import { ServerActionStatus } from '@/lib/config/app.config';
import { Metadata } from 'next';
import BreadCrumbs from '@/components/BreadCrumbs';

export const metadata: Metadata = {
  title: 'Returns Policy | Vape Hub',
  description: 'Our returns and refunds policy information',
};

export default async function ReturnsPolicyPage() {
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Returns Policy', href: '/returns-policy', isActive: true },
  ];

  const response = await getLegalContentByKey('returns_policy');

  if (response.status !== ServerActionStatus.SUCCESS || !response.data) {
    return (
      <div className="px-4 lg:px-9 xl:px-12.5 py-7 xl:py-10">
        <BreadCrumbs items={breadcrumbs} />
        <div className="max-w-4xl mt-6">
          <h1 className="text-3xl font-bold mb-6">Returns Policy</h1>
          <p className="text-gray-600">Content not available at the moment. Please try again later.</p>
        </div>
      </div>
    );
  }

  const { content } = response.data;

  return (
    <div className="px-4 lg:px-9 xl:px-12.5 py-7 xl:py-10">
      <BreadCrumbs items={breadcrumbs} />
      <div className="mt-6">
        <h1 className="text-3xl font-bold mb-6">Returns Policy</h1>
        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </div>
  );
}

