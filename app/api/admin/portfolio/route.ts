// app/api/admin/portfolio/route.ts
import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth/middleware';
import { sanityClient, sanityWriteClient, isSanityConfigured } from '@/lib/sanity';
import { validate, portfolioSiteSchema } from '@/lib/validations';
import { jsonResponse, errorResponse } from '@/lib/api-helpers';
import { demoPortfolioSites } from '@/lib/demo-data';

export async function GET(request: NextRequest) {
  const rejected = await requireAdmin(request);
  if (rejected) return rejected;

  // Return demo data if Sanity is not configured
  if (!isSanityConfigured()) {
    return jsonResponse(demoPortfolioSites.map(s => ({ ...s, _isDemo: true })));
  }

  try {
    const sites = await sanityClient.fetch(
      `*[_type == "portfolioSite"] | order(order asc) {
        _id, _type, clientName, "logo": logo { asset->{ _id, url } },
        websiteUrl, order, isActive
      }`
    );
    // If Sanity is empty, return demo data with _isDemo flag
    if (sites.length === 0) {
      return jsonResponse(demoPortfolioSites.map(s => ({ ...s, _isDemo: true })));
    }
    return jsonResponse(sites);
  } catch {
    // On error, return demo data
    return jsonResponse(demoPortfolioSites.map(s => ({ ...s, _isDemo: true })));
  }
}

export async function POST(request: NextRequest) {
  const rejected = await requireAdmin(request);
  if (rejected) return rejected;

  try {
    const body = await request.json();
    const data = validate(portfolioSiteSchema, body);

    // If logo is a Sanity asset ID, convert to reference format
    const result = await sanityWriteClient.create({
      _type: 'portfolioSite' as const,
      clientName: data.clientName,
      websiteUrl: data.websiteUrl,
      order: data.order,
      isActive: data.isActive,
      ...(data.logo
        ? { logo: { _type: 'image', asset: { _type: 'reference', _ref: data.logo } } }
        : {}),
    });
    return jsonResponse(result, 201);
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return errorResponse('Validation failed: ' + error.message, 400);
    }
    return errorResponse('Failed to create portfolio site', 500);
  }
}
