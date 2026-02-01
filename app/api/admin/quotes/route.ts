// app/api/admin/quotes/route.ts
import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth/middleware';
import { sanityClient, sanityWriteClient } from '@/lib/sanity';
import { validate, quoteSchema } from '@/lib/validations';
import { jsonResponse, errorResponse, getNextNumber } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  const rejected = await requireAdmin(request);
  if (rejected) return rejected;

  try {
    const quotes = await sanityClient.fetch(
      `*[_type == "quote"] | order(createdAt desc) {
        _id, _type, quoteNumber,
        "client": client->{ _id, _type, clientName, contactPerson, email, phone, billingAddress, notes },
        oneTimeItems, recurringItems,
        oneTimeSubtotal, monthlySubtotal,
        contractTerms, expiryDate, status, createdAt, sentAt
      }`
    );
    return jsonResponse(quotes);
  } catch {
    return errorResponse('Failed to fetch quotes', 500);
  }
}

export async function POST(request: NextRequest) {
  const rejected = await requireAdmin(request);
  if (rejected) return rejected;

  try {
    const body = await request.json();
    const data = validate(quoteSchema, body);

    // Generate next quote number
    const quoteNumber = await getNextNumber(sanityClient, 'quote', 'quoteNumber', 'Q');

    const result = await sanityWriteClient.create({
      _type: 'quote' as const,
      quoteNumber,
      client: { _type: 'reference', _ref: data.client },
      oneTimeItems: data.oneTimeItems,
      recurringItems: data.recurringItems,
      oneTimeSubtotal: data.oneTimeSubtotal,
      monthlySubtotal: data.monthlySubtotal,
      contractTerms: data.contractTerms,
      expiryDate: data.expiryDate,
      status: data.status,
      createdAt: new Date().toISOString(),
    });
    return jsonResponse(result, 201);
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return errorResponse('Validation failed: ' + error.message, 400);
    }
    return errorResponse('Failed to create quote', 500);
  }
}
