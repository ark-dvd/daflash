// app/api/admin/catalog/route.ts
import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth/middleware';
import { sanityClient, sanityWriteClient } from '@/lib/sanity';
import { validate, catalogItemSchema } from '@/lib/validations';
import { jsonResponse, errorResponse } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  const rejected = await requireAdmin(request);
  if (rejected) return rejected;

  try {
    const items = await sanityClient.fetch(
      `*[_type == "catalogItem"] | order(category asc, name asc) {
        _id, _type, name, description, unitPrice, billingType, category
      }`
    );
    return jsonResponse(items);
  } catch {
    return errorResponse('Failed to fetch catalog items', 500);
  }
}

export async function POST(request: NextRequest) {
  const rejected = await requireAdmin(request);
  if (rejected) return rejected;

  try {
    const body = await request.json();
    const data = validate(catalogItemSchema, body);
    const result = await sanityWriteClient.create({
      _type: 'catalogItem' as const,
      ...data,
    });
    return jsonResponse(result, 201);
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return errorResponse('Validation failed: ' + error.message, 400);
    }
    return errorResponse('Failed to create catalog item', 500);
  }
}
