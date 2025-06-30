import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.vapehub.devateam.com/api';

export async function GET(_: NextRequest) {
  try {
    const response = await fetch(`${API_URL}/seo/robots.txt`, {
      headers: {
        Accept: 'text/plain',
      },
      next: {
        // Revalidate every 24 hours
        revalidate: 86400,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch robots.txt: ${response.statusText}`);
    }

    const robotsContent = await response.text();

    return new NextResponse(robotsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching robots.txt:', error);
    return new NextResponse('Error generating robots.txt.', { status: 500 });
  }
} 