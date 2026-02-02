// app/api/admin/invoices/[id]/route.ts
import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth/middleware';
import { sanityClient, sanityWriteClient, isSanityConfigured } from '@/lib/sanity';
import { validate, invoiceSchema } from '@/lib/validations';
import { jsonResponse, errorResponse } from '@/lib/api-helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const rejected = await requireAdmin(request);
  if (rejected) return rejected;

  try {
    const invoice = await sanityClient.fetch(
      `*[_type == "invoice" && _id == $id][0] {
        _id, _type, invoiceNumber,
        "relatedQuote": relatedQuote->{ _id, quoteNumber },
        "client": client->{ _id, _type, clientName, contactPerson, email, phone, billingAddress, notes },
        lineItems, subtotal,
        taxEnabled, taxRate, texasExemptionEnabled, taxAmount, total,
        issueDate, dueDate, status, notes
      }`,
      { id: params.id }
    );

    if (!invoice) {
      return errorResponse('Invoice not found', 404);
    }
    return jsonResponse(invoice);
  } catch {
    return errorResponse('Failed to fetch invoice', 500);
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
    const data = validate(invoiceSchema, body);

    const fields: Record<string, unknown> = {
      client: { _type: 'reference', _ref: data.client },
      lineItems: data.lineItems,
      subtotal: data.subtotal,
      taxEnabled: data.taxEnabled,
      taxRate: data.taxRate,
      texasExemptionEnabled: data.texasExemptionEnabled,
      taxAmount: data.taxAmount,
      total: data.total,
      issueDate: data.issueDate,
      dueDate: data.dueDate,
      status: data.status,
      notes: data.notes,
    };

    if (data.relatedQuote) {
      fields.relatedQuote = { _type: 'reference', _ref: data.relatedQuote };
    }

    // Check if this is a demo item (not in Sanity)
    if (params.id.startsWith('demo-')) {
      const result = await sanityWriteClient.create({
        _type: 'invoice' as const,
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
    return errorResponse('Failed to update invoice', 500);
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
    return errorResponse('Failed to delete invoice', 500);
  }
}
