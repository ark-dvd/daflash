// app/api/admin/portfolio/[id]/route.ts
import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth/middleware';
import { sanityWriteClient } from '@/lib/sanity';
import { validate, portfolioSiteSchema } from '@/lib/validations';
import { jsonResponse, errorResponse } from '@/lib/api-helpers';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const rejected = await requireAdmin(request);
  if (rejected) return rejected;

  try {
    const body = await request.json();
    const data = validate(portfolioSiteSchema, body);

    const fields: Record<string, unknown> = {
      clientName: data.clientName,
      websiteUrl: data.websiteUrl,
      order: data.order,
      isActive: data.isActive,
    };

    if (data.logo) {
      fields.logo = {
        _type: 'image',
        asset: { _type: 'reference', _ref: data.logo },
      };
    }

    const result = await sanityWriteClient
      .patch(params.id)
      .set(fields)
      .commit();
    return jsonResponse(result);
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return errorResponse('Validation failed: ' + error.message, 400);
    }
    return errorResponse('Failed to update portfolio site', 500);
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
    return errorResponse('Failed to delete portfolio site', 500);
  }
}
