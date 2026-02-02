// app/api/admin/portfolio/[id]/route.ts
import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth/middleware';
import { sanityWriteClient, isSanityConfigured } from '@/lib/sanity';
import { validate, portfolioSiteSchema } from '@/lib/validations';
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

    // Check if this is a demo item (not in Sanity)
    if (params.id.startsWith('demo-')) {
      // Create a new real document in Sanity instead of patching
      const result = await sanityWriteClient.create({
        _type: 'portfolioSite' as const,
        ...fields,
      });
      return jsonResponse(result);
    }

    // Normal update for real Sanity documents
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

  // Demo items can't be deleted from Sanity (they don't exist there)
  if (params.id.startsWith('demo-')) {
    return jsonResponse({ deleted: true });
  }

  if (!isSanityConfigured()) {
    return errorResponse('Sanity is not configured. Cannot delete.', 400);
  }

  try {
    await sanityWriteClient.delete(params.id);
    return jsonResponse({ deleted: true });
  } catch {
    return errorResponse('Failed to delete portfolio site', 500);
  }
}
