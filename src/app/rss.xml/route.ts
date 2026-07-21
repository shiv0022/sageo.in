import { NextResponse } from "next/server";
import { BASE_URL } from "@/lib/constants";

export async function GET() {
  const baseUrl = BASE_URL;
  
  const articles = [
    {
      title: "What is Answer Engine Optimization (AEO)?",
      description: "Learn what Answer Engine Optimization (AEO) is, why it matters for voice search and LLM answers, and how to structure your site to get cited.",
      link: `${baseUrl}/learning/what-is-aeo`,
      pubDate: new Date("2026-07-19").toUTCString(),
    },
    {
      title: "What is Generative Engine Optimization (GEO)?",
      description: "Discover what Generative Engine Optimization (GEO) is, how AI engines cite websites, and strategies to increase your visibility in ChatGPT and Gemini.",
      link: `${baseUrl}/learning/what-is-geo`,
      pubDate: new Date("2026-07-19").toUTCString(),
    },
    {
      title: "Schema Markup for AI Search: How to Use JSON-LD for LLMs",
      description: "Learn how to deploy schema markup and structured JSON-LD data to optimize your website for AI search engines like ChatGPT and Google AI Overviews.",
      link: `${baseUrl}/learning/structured-data-for-ai`,
      pubDate: new Date("2026-07-19").toUTCString(),
    }
  ];

  const rssItems = articles
    .map(
      (art) => `
    <item>
      <title>${art.title}</title>
      <description>${art.description}</description>
      <link>${art.link}</link>
      <guid>${art.link}</guid>
      <pubDate>${art.pubDate}</pubDate>
    </item>`
    )
    .join("");

  const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>AI Search Optimization Academy Feed</title>
    <description>Learn how to optimize your website for AI Search Engines (AEO, GEO) and Schema Markup</description>
    <link>${baseUrl}/learning</link>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${rssItems}
  </channel>
</rss>`;

  return new NextResponse(rssFeed, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
