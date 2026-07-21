/**
 * Base URL for the platform.
 * Used in metadata, sitemaps, robots.txt, JSON-LD schemas, and canonical URLs.
 *
 * Set NEXT_PUBLIC_BASE_URL in your environment to override.
 * Falls back to "https://sageo.in" for production.
 */
export const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://sageo.in";
