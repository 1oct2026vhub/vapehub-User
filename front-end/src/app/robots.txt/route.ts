import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_VAPE_HUB_API_BASE_URL;

// export async function GET(_: NextRequest) {
export async function GET() {
  try {
    const response = await fetch(`${API_URL}/api/seo/robots.txt`, {
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

    let robotsContent = await response.text();

    // Append rules to block parameter URLs and preserve crawl budget (see GSC parameter handling).
    // Product listing: sort, pagination, filters (price_range, categories, brand, deal_id, attribute_*).
    const parameterRules = `

# Block parameter URLs to preserve crawl budget (product listing + tracking)
Disallow: /*?vahukId=
Disallow: /*?attribute_pa_flavour=
Disallow: /*?order=
Disallow: /*?sort_by=
Disallow: /*?page=
Disallow: /*?offset=
Disallow: /*?price_range=
Disallow: /*?categories=
Disallow: /*?brand=
Disallow: /*?deal_id=
Disallow: /*?attribute_pa_
Disallow: /*?attribute_1=
Disallow: /*?attribute_2=
Disallow: /*?attribute_3=
Disallow: /*?attribute_4=
Disallow: /*?attribute_5=
Disallow: /*?attribute_6=
Disallow: /*?attribute_7=
Disallow: /*?attribute_8=
Disallow: /*?attribute_9=
`;
    robotsContent = robotsContent.trimEnd() + parameterRules;

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