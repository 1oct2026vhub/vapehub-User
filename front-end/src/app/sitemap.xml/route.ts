import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.vapehub.devateam.com/api';

// export async function GET(_: NextRequest) {
export async function GET() {
  try {
    const response = await fetch(`${API_URL}/seo/sitemap.xml`, {
      headers: {
        Accept: 'application/xml',
      },
      next: {
        // Revalidate every 24 hours
        revalidate: 86400,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch sitemap: ${response.statusText}`);
    }

    const sitemapContent = await response.text();

    return new NextResponse(sitemapContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  } catch (error) {
    console.error('Error fetching sitemap:', error);
    return new NextResponse('Error generating sitemap.', { status: 500 });
  }
} 