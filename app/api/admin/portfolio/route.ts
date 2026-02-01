// app/api/admin/portfolio/route.ts
import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth/middleware';
import { sanityClient, sanityWriteClient } from '@/lib/sanity';
import { validate, portfolioSiteSchema } from '@/lib/validations';
import { jsonResponse, errorResponse } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  const rejected = await requireAdmin(request);
  if (rejected) return rejected;

  try {
    const sites = await sanityClient.fetch(
      `*[_type == "portfolioSite"] | order(order asc) {
        _id, _type, clientName, "logo": logo { asset->{ _id, url } },
        websiteUrl, order, isActive
      }`
    );
    return jsonResponse(sites);
  } catch {
    return errorResponse('Failed to fetch portfolio sites', 500);
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
