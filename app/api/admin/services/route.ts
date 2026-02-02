// app/api/admin/services/route.ts
import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth/middleware';
import { sanityClient, sanityWriteClient, isSanityConfigured } from '@/lib/sanity';
import { validate, serviceSchema } from '@/lib/validations';
import { jsonResponse, errorResponse } from '@/lib/api-helpers';
import { demoServices } from '@/lib/demo-data';

export async function GET(request: NextRequest) {
  const rejected = await requireAdmin(request);
  if (rejected) return rejected;

  // Return demo data if Sanity is not configured
  if (!isSanityConfigured()) {
    return jsonResponse(demoServices.map(s => ({ ...s, _isDemo: true })));
  }

  try {
    const services = await sanityClient.fetch(
      `*[_type == "service"] | order(order asc) {
        _id, _type, name, slug, icon, tagline, description, highlights, order, isActive
      }`
    );
    // If Sanity is empty, return demo data with _isDemo flag
    if (services.length === 0) {
      return jsonResponse(demoServices.map(s => ({ ...s, _isDemo: true })));
    }
    return jsonResponse(services);
  } catch {
    // On error, return demo data
    return jsonResponse(demoServices.map(s => ({ ...s, _isDemo: true })));
  }
}

export async function POST(request: NextRequest) {
  const rejected = await requireAdmin(request);
  if (rejected) return rejected;

  try {
    const body = await request.json();
    const data = validate(serviceSchema, body);

    // Auto-generate slug from name if not provided
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const result = await sanityWriteClient.create({
      _type: 'service' as const,
      ...data,
      slug,
    });
    return jsonResponse(result, 201);
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return errorResponse('Validation failed: ' + error.message, 400);
    }
    return errorResponse('Failed to create service', 500);
  }
}
