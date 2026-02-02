// app/api/admin/clients/[id]/route.ts
import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth/middleware';
import { sanityWriteClient, isSanityConfigured } from '@/lib/sanity';
import { validate, clientSchema } from '@/lib/validations';
import { jsonResponse, errorResponse } from '@/lib/api-helpers';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const rejected = await requireAdmin(request);
  if (rejected) return rejected;

  if (!isSanityConfigured()) {
    return errorResponse('Sanity is not configured. Cannot save changes.', 400);
  }

  try {
    const body = await request.json();
    const data = validate(clientSchema, body);

    // Check if this is a demo item (not in Sanity)
    if (params.id.startsWith('demo-')) {
      const result = await sanityWriteClient.create({
        _type: 'client' as const,
        ...data,
      });
      return jsonResponse(result);
    }

    const result = await sanityWriteClient
      .patch(params.id)
      .set(data)
      .commit();
    return jsonResponse(result);
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return errorResponse('Validation failed: ' + error.message, 400);
    }
    return errorResponse('Failed to update client', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const rejected = await requireAdmin(request);
  if (rejected) return rejected;

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
    return errorResponse('Failed to delete client', 500);
  }
}
