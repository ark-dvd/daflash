// app/api/admin/invoices/route.ts
import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth/middleware';
import { sanityClient, sanityWriteClient } from '@/lib/sanity';
import { validate, invoiceSchema } from '@/lib/validations';
import { jsonResponse, errorResponse, getNextNumber } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  const rejected = await requireAdmin(request);
  if (rejected) return rejected;

  try {
    const invoices = await sanityClient.fetch(
      `*[_type == "invoice"] | order(issueDate desc) {
        _id, _type, invoiceNumber,
        "relatedQuote": relatedQuote->{ _id, quoteNumber },
        "client": client->{ _id, _type, clientName, contactPerson, email, phone, billingAddress, notes },
        lineItems, subtotal,
        taxEnabled, taxRate, texasExemptionEnabled, taxAmount, total,
        issueDate, dueDate, status, notes
      }`
    );
    return jsonResponse(invoices);
  } catch {
    return errorResponse('Failed to fetch invoices', 500);
  }
}

export async function POST(request: NextRequest) {
  const rejected = await requireAdmin(request);
  if (rejected) return rejected;

  try {
    const body = await request.json();
    const data = validate(invoiceSchema, body);

    // Generate next invoice number
    const invoiceNumber = await getNextNumber(sanityClient, 'invoice', 'invoiceNumber', 'INV');

    const result = await sanityWriteClient.create({
      _type: 'invoice' as const,
      invoiceNumber,
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
      ...(data.relatedQuote
        ? { relatedQuote: { _type: 'reference', _ref: data.relatedQuote } }
        : {}),
    });
    return jsonResponse(result, 201);
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return errorResponse('Validation failed: ' + error.message, 400);
    }
    return errorResponse('Failed to create invoice', 500);
  }
}
