import { MetadataRoute } from "next";
import { BASE_URL } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/"], // Protect internal API streams
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
