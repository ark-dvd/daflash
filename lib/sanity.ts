// lib/sanity.ts
import { createClient } from '@sanity/client';

// Use placeholder projectId during build when env var not set
// This prevents build failures — actual API calls will fail gracefully
// and isSanityConfigured() checks will direct to demo mode
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'placeholder';
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const apiVersion = '2024-01-01';

// Read client — used by public pages and admin reads
// CRITICAL: useCdn must be false — CDN caches for 60s, breaks admin updates (Lesson 3)
export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
});

// Write client — used by API routes for create/update/delete
// Uses server-side token, never exposed to client
export const sanityWriteClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
});

// CRITICAL: Only check NEXT_PUBLIC_SANITY_PROJECT_ID (Lesson 2)
// Do NOT check SANITY_API_TOKEN here — it's only available server-side
// and checking it would cause demo mode to activate in API routes
export function isSanityConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID);
}

// Helper to build image URLs from Sanity image references
export function sanityImageUrl(image: { asset: { url: string } } | undefined): string | null {
  if (!image?.asset?.url) return null;
  return image.asset.url;
}
