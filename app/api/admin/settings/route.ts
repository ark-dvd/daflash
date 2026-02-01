// app/api/admin/settings/route.ts
import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth/middleware';
import { sanityClient, sanityWriteClient } from '@/lib/sanity';
import { validate, siteSettingsSchema } from '@/lib/validations';
import { jsonResponse, errorResponse } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  const rejected = await requireAdmin(request);
  if (rejected) return rejected;

  try {
    const settings = await sanityClient.fetch(
      `*[_type == "siteSettings"][0] {
        _id, _type,
        heroHeadline, heroSubtitle, heroCtaText, heroCtaLink,
        "heroImage": heroImage { asset->{ _id, url } },
        aboutHeadline, aboutText, aboutStats,
        contactPhone, contactEmail, contactAddress, serviceArea, officeHours,
        companyName, companySpecialty,
        "logo": logo { asset->{ _id, url } },
        "favicon": favicon { asset->{ _id, url } },
        socialInstagram, socialFacebook, socialLinkedin, socialYoutube,
        defaultContractTerms
      }`
    );
    return jsonResponse(settings);
  } catch {
    return errorResponse('Failed to fetch site settings', 500);
  }
}

export async function PUT(request: NextRequest) {
  const rejected = await requireAdmin(request);
  if (rejected) return rejected;

  try {
    const body = await request.json();
    const data = validate(siteSettingsSchema, body);

    // Build fields — handle image references separately
    const fields: Record<string, unknown> = { ...data };

    // Convert image asset IDs to Sanity reference format
    if (data.logo) {
      fields.logo = {
        _type: 'image',
        asset: { _type: 'reference', _ref: data.logo },
      };
    } else {
      delete fields.logo;
    }

    if (data.favicon) {
      fields.favicon = {
        _type: 'image',
        asset: { _type: 'reference', _ref: data.favicon },
      };
    } else {
      delete fields.favicon;
    }

    if (data.heroImage) {
      fields.heroImage = {
        _type: 'image',
        asset: { _type: 'reference', _ref: data.heroImage },
      };
    } else {
      delete fields.heroImage;
    }

    // Check if settings document exists
    const existing = await sanityClient.fetch(
      `*[_type == "siteSettings"][0]{ _id }`
    );

    let result;
    if (existing?._id) {
      result = await sanityWriteClient
        .patch(existing._id)
        .set(fields)
        .commit();
    } else {
      result = await sanityWriteClient.create({
        _type: 'siteSettings' as const,
        ...fields,
      });
    }

    return jsonResponse(result);
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return errorResponse('Validation failed: ' + error.message, 400);
    }
    return errorResponse('Failed to update site settings', 500);
  }
}
