// app/api/admin/pricing/route.ts
import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth/middleware';
import { sanityClient, sanityWriteClient, isSanityConfigured } from '@/lib/sanity';
import { validate, pricingPlanSchema } from '@/lib/validations';
import { jsonResponse, errorResponse } from '@/lib/api-helpers';
import { demoPricingPlans } from '@/lib/demo-data';

export async function GET(request: NextRequest) {
  const rejected = await requireAdmin(request);
  if (rejected) return rejected;

  // Return demo data if Sanity is not configured
  if (!isSanityConfigured()) {
    return jsonResponse(demoPricingPlans.map(p => ({ ...p, _isDemo: true })));
  }

  try {
    const plans = await sanityClient.fetch(
      `*[_type == "pricingPlan"] | order(order asc) {
        _id, _type, name, price, originalPrice, billingFrequency,
        features, badge, ctaText, ctaLink, order
      }`
    );
    // If Sanity is empty, return demo data with _isDemo flag
    if (plans.length === 0) {
      return jsonResponse(demoPricingPlans.map(p => ({ ...p, _isDemo: true })));
    }
    return jsonResponse(plans);
  } catch {
    // On error, return demo data
    return jsonResponse(demoPricingPlans.map(p => ({ ...p, _isDemo: true })));
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
