// app/api/admin/upload/route.ts
import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth/middleware';
import { sanityWriteClient } from '@/lib/sanity';
import { jsonResponse, errorResponse } from '@/lib/api-helpers';

// Max file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const rejected = await requireAdmin(request);
  if (rejected) return rejected;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return errorResponse('No file provided', 400);
    }

    if (file.size > MAX_FILE_SIZE) {
      return errorResponse('File too large. Maximum size is 5MB.', 400);
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      return errorResponse('Invalid file type. Allowed: JPEG, PNG, GIF, WebP, SVG', 400);
    }

    // Convert File to Buffer for Sanity upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Sanity
    const asset = await sanityWriteClient.assets.upload('image', buffer, {
      filename: file.name,
      contentType: file.type,
    });

    return jsonResponse({
      assetId: asset._id,
      url: asset.url,
    }, 201);
  } catch {
    return errorResponse('Failed to upload file', 500);
  }
}
