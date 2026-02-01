// app/api/admin/pricing/route.ts
import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth/middleware';
import { sanityClient, sanityWriteClient } from '@/lib/sanity';
import { validate, pricingPlanSchema } from '@/lib/validations';
import { jsonResponse, errorResponse } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  const rejected = await requireAdmin(request);
  if (rejected) return rejected;

  try {
    const plans = await sanityClient.fetch(
      `*[_type == "pricingPlan"] | order(order asc) {
        _id, _type, name, price, originalPrice, billingFrequency,
        features, badge, ctaText, ctaLink, order
      }`
    );
    return jsonResponse(plans);
  } catch {
    return errorResponse('Failed to fetch pricing plans', 500);
  }
}

export async function POST(request: NextRequest) {
  const rejected = await requireAdmin(request);
  if (rejected) return rejected;

  try {
    const body = await request.json();
    const data = validate(pricingPlanSchema, body);
    const result = await sanityWriteClient.create({
      _type: 'pricingPlan' as const,
      ...data,
    });
    return jsonResponse(result, 201);
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return errorResponse('Validation failed: ' + error.message, 400);
    }
    return errorResponse('Failed to create pricing plan', 500);
  }
}
