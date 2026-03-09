import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_VAPE_HUB_API_BASE_URL;

// export async function GET(_: NextRequest) {
export async function GET() {
  try {
    const response = await fetch(`${API_URL}/api/seo/robots.txt`, {
      headers: {
        Accept: 'text/plain',
      },
      cache: 'no-store',
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
    console.error('Error fetching robots.txt:', error);
    return new NextResponse('Error generating robots.txt.', { status: 500 });
  }
} 