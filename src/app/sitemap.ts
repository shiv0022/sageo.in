import { MetadataRoute } from "next";
import { BASE_URL } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = BASE_URL;

  const routes = [
    "",
    "/analyze",
    "/dashboard",
    "/reports",
    "/features/seo-intelligence",
    "/features/aeo-optimization",
    "/features/geo-ai-visibility",
    "/features/technical-performance-security",
    "/learning",
    "/learning/what-is-aeo",
    "/learning/what-is-geo",
    "/learning/structured-data-for-ai",
    "/compare",
    "/compare/seo-vs-aeo-vs-geo",
    "/compare/our-platform-vs-competitors"
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split("T")[0],
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : route.startsWith("/features") ? 0.8 : 0.6,
  }));
}
