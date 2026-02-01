// app/api/admin/quotes/[id]/route.ts
import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth/middleware';
import { sanityClient, sanityWriteClient } from '@/lib/sanity';
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
        taxRate, applyExemption, oneTimeTax, monthlyTax, oneTimeTotal, monthlyTotal,
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

  try {
    const body = await request.json();
    const data = validate(quoteSchema, body);

    const fields: Record<string, unknown> = {
      client: { _type: 'reference', _ref: data.client },
      oneTimeItems: data.oneTimeItems,
      recurringItems: data.recurringItems,
      oneTimeSubtotal: data.oneTimeSubtotal,
      monthlySubtotal: data.monthlySubtotal,
      taxRate: data.taxRate,
      applyExemption: data.applyExemption,
      oneTimeTax: data.oneTimeTax,
      monthlyTax: data.monthlyTax,
      oneTimeTotal: data.oneTimeTotal,
      monthlyTotal: data.monthlyTotal,
      contractTerms: data.contractTerms,
      expiryDate: data.expiryDate,
      status: data.status,
    };

    // If status changed to "Sent", set sentAt
    if (data.status === 'Sent') {
      fields.sentAt = new Date().toISOString();
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

  try {
    await sanityWriteClient.delete(params.id);
    return jsonResponse({ success: true });
  } catch {
    return errorResponse('Failed to delete quote', 500);
  }
}
