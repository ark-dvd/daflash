// app/api/admin/landing-pages/[pageId]/route.ts
import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth/middleware';
import { sanityClient, sanityWriteClient } from '@/lib/sanity';
import { validate, landingPageSchema } from '@/lib/validations';
import { jsonResponse, errorResponse } from '@/lib/api-helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: { pageId: string } }
) {
  const rejected = await requireAdmin(request);
  if (rejected) return rejected;

  const { pageId } = params;
  if (pageId !== 'realtors' && pageId !== 'contractors') {
    return errorResponse('Invalid pageId. Must be "realtors" or "contractors"', 400);
  }

  try {
    const page = await sanityClient.fetch(
      `*[_type == "landingPage" && pageId == $pageId][0] {
        _id, _type, pageId, heroHeadline, heroSubtitle,
        "heroImage": heroImage { asset->{ _id, url } },
        features[] { icon, title, description, "screenshot": screenshot { asset->{ _id, url } } },
        whiteLabelText, ctaText, ctaLink
      }`,
      { pageId }
    );
    return jsonResponse(page);
  } catch {
    return errorResponse('Failed to fetch landing page', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { pageId: string } }
) {
  const rejected = await requireAdmin(request);
  if (rejected) return rejected;

  const { pageId } = params;
  if (pageId !== 'realtors' && pageId !== 'contractors') {
    return errorResponse('Invalid pageId. Must be "realtors" or "contractors"', 400);
  }

  try {
    const body = await request.json();
    const data = validate(landingPageSchema, { ...body, pageId });

    // Build the document fields
    const fields: Record<string, unknown> = {
      pageId: data.pageId,
      heroHeadline: data.heroHeadline,
      heroSubtitle: data.heroSubtitle,
      whiteLabelText: data.whiteLabelText,
      ctaText: data.ctaText,
      ctaLink: data.ctaLink,
      features: data.features.map((f) => ({
        _type: 'object',
        icon: f.icon,
        title: f.title,
        description: f.description,
        ...(f.screenshot
          ? { screenshot: { _type: 'image', asset: { _type: 'reference', _ref: f.screenshot } } }
          : {}),
      })),
    };

    if (data.heroImage) {
      fields.heroImage = {
        _type: 'image',
        asset: { _type: 'reference', _ref: data.heroImage },
      };
    }

    // Check if document exists
    const existing = await sanityClient.fetch(
      `*[_type == "landingPage" && pageId == $pageId][0]{ _id }`,
      { pageId }
    );

    let result;
    if (existing?._id) {
      // Update existing
      result = await sanityWriteClient
        .patch(existing._id)
        .set(fields)
        .commit();
    } else {
      // Create new
      result = await sanityWriteClient.create({
        _type: 'landingPage' as const,
        ...fields,
      });
    }

    return jsonResponse(result);
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return errorResponse('Validation failed: ' + error.message, 400);
    }
    return errorResponse('Failed to update landing page', 500);
  }
}
