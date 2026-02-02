// app/api/admin/quotes/[id]/route.ts
import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth/middleware';
import { sanityClient, sanityWriteClient, isSanityConfigured } from '@/lib/sanity';
import { validate, quoteSchema } from '@/lib/validations';
import { jsonResponse, errorResponse } from '@/lib/api-helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const rejected = await requireAdmin(request);
  if (rejected) return rejected;

  try {
    const quote = await sanityClient.fetch(
      `*[_type == "quote" && _id == $id][0] {
        _id, _type, quoteNumber,
        "client": client->{ _id, _type, clientName, contactPerson, email, phone, billingAddress, notes },
        oneTimeItems, recurringItems,
        oneTimeSubtotal, monthlySubtotal,
        taxEnabled, taxRate, texasExemptionEnabled, taxAmount, grandTotal,
        contractTerms, expiryDate, status, createdAt, sentAt
      }`,
      { id: params.id }
    );

    if (!quote) {
      return errorResponse('Quote not found', 404);
    }
    return jsonResponse(quote);
  } catch {
    return errorResponse('Failed to fetch quote', 500);
  }
}

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
    const data = validate(quoteSchema, body);

    const fields: Record<string, unknown> = {
      client: { _type: 'reference', _ref: data.client },
      oneTimeItems: data.oneTimeItems,
      recurringItems: data.recurringItems,
      oneTimeSubtotal: data.oneTimeSubtotal,
      monthlySubtotal: data.monthlySubtotal,
      taxEnabled: data.taxEnabled,
      taxRate: data.taxRate,
      texasExemptionEnabled: data.texasExemptionEnabled,
      taxAmount: data.taxAmount,
      grandTotal: data.grandTotal,
      contractTerms: data.contractTerms,
      expiryDate: data.expiryDate,
      status: data.status,
    };

    // If status changed to "Sent", set sentAt
    if (data.status === 'Sent') {
      fields.sentAt = new Date().toISOString();
    }

    // Check if this is a demo item (not in Sanity)
    if (params.id.startsWith('demo-')) {
      const result = await sanityWriteClient.create({
        _type: 'quote' as const,
        ...fields,
      });
      return jsonResponse(result);
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
    return errorResponse('Failed to update quote', 500);
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
    return errorResponse('Failed to delete quote', 500);
  }
}
