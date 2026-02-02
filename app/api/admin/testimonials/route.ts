// app/api/admin/testimonials/route.ts
import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth/middleware';
import { sanityClient, sanityWriteClient, isSanityConfigured } from '@/lib/sanity';
import { validate, testimonialSchema } from '@/lib/validations';
import { jsonResponse, errorResponse } from '@/lib/api-helpers';
import { demoTestimonials } from '@/lib/demo-data';

export async function GET(request: NextRequest) {
  const rejected = await requireAdmin(request);
  if (rejected) return rejected;

  // Return demo data if Sanity is not configured
  if (!isSanityConfigured()) {
    return jsonResponse(demoTestimonials.map(t => ({ ...t, _isDemo: true })));
  }

  try {
    const testimonials = await sanityClient.fetch(
      `*[_type == "testimonial"] | order(order asc) {
        _id, _type, clientName, quote, companyName, companyUrl,
        isFeatured, order, isActive
      }`
    );
    // If Sanity is empty, return demo data with _isDemo flag
    if (testimonials.length === 0) {
      return jsonResponse(demoTestimonials.map(t => ({ ...t, _isDemo: true })));
    }
    return jsonResponse(testimonials);
  } catch {
    // On error, return demo data
    return jsonResponse(demoTestimonials.map(t => ({ ...t, _isDemo: true })));
  }
}

export async function POST(request: NextRequest) {
  const rejected = await requireAdmin(request);
  if (rejected) return rejected;

  try {
    const body = await request.json();
    const data = validate(testimonialSchema, body);
    const result = await sanityWriteClient.create({
      _type: 'testimonial' as const,
      ...data,
    });
    return jsonResponse(result, 201);
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return errorResponse('Validation failed: ' + error.message, 400);
    }
    return errorResponse('Failed to create testimonial', 500);
  }
}
