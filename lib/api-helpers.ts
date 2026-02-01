// lib/api-helpers.ts
// Shared helpers for API routes

import { NextResponse } from 'next/server';

/**
 * Create a JSON response with no-cache headers.
 * All /api/* routes MUST use this to prevent stale data.
 */
export function jsonResponse(data: unknown, status = 200): NextResponse {
  return NextResponse.json(data, {
    status,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      Pragma: 'no-cache',
    },
  });
}

/**
 * Standard error response with no-cache headers.
 */
export function errorResponse(message: string, status = 400): NextResponse {
  return NextResponse.json(
    { error: message },
    {
      status,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        Pragma: 'no-cache',
      },
    }
  );
}

/**
 * Generate the next sequential number for quotes/invoices.
 * Fetches existing documents and returns the next number in format: PREFIX-001, PREFIX-002, etc.
 */
export async function getNextNumber(
  client: { fetch: <T>(query: string, params?: Record<string, string>) => Promise<T> },
  documentType: string,
  numberField: string,
  prefix: string
): Promise<string> {
  try {
    const latest = await client.fetch<{ num: string } | null>(
      `*[_type == $type] | order(${numberField} desc)[0] { "num": ${numberField} }`,
      { type: documentType }
    );

    if (!latest?.num) {
      return `${prefix}-001`;
    }

    // Extract number from format like "Q-001" → 1
    const match = latest.num.match(/(\d+)$/);
    const nextNum = match ? parseInt(match[1], 10) + 1 : 1;
    return `${prefix}-${String(nextNum).padStart(3, '0')}`;
  } catch {
    return `${prefix}-001`;
  }
}
