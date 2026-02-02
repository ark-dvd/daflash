// app/api/admin/pricing/[id]/route.ts
import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth/middleware';
import { sanityWriteClient, isSanityConfigured } from '@/lib/sanity';
import { validate, pricingPlanSchema } from '@/lib/validations';
import { jsonResponse, errorResponse } from '@/lib/api-helpers';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const rejected = await requireAdmin(request);
  if (rejected) return rejected;

  // Check if Sanity is configured for write operations
  if (!isSanityConfigured()) {
    return errorResponse('Sanity is not configured. Cannot save changes.', 400);
  }

  try {
    const body = await request.json();
    const data = validate(pricingPlanSchema, body);

    // Check if this is a demo item (not in Sanity)
    if (params.id.startsWith('demo-')) {
      // Create a new real document in Sanity instead of patching
      const result = await sanityWriteClient.create({
        _type: 'pricingPlan' as const,
        ...data,
      });
      return jsonResponse(result);
    }

    // Normal update for real Sanity documents
    const result = await sanityWriteClient
      .patch(params.id)
      .set(data)
      .commit();
    return jsonResponse(result);
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return errorResponse('Validation failed: ' + error.message, 400);
    }
    return errorResponse('Failed to update pricing plan', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const rejected = await requireAdmin(request);
  if (rejected) return rejected;

  try {
    await sanityWriteClient.delete(params.id);
    return jsonResponse({ success: true });
  } catch {
    return errorResponse('Failed to delete pricing plan', 500);
  }
}
