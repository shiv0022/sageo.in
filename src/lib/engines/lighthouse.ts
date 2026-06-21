// ============================================================
// Lighthouse Engine - Real Audits
// ============================================================

import type { LighthouseScores, CoreWebVitals } from "@/types";

/**
 * Run a real Lighthouse audit using chrome-launcher + lighthouse
 * Falls back to API-based PageSpeed Insights if local Chrome unavailable
 */
export async function runLighthouse(url: string): Promise<LighthouseScores> {
  // Try local Lighthouse first
  try {
    return await runLocalLighthouse(url);
  } catch (err) {
    console.warn("[Lighthouse] Local audit failed, trying PageSpeed API:", err);
  }

  // Fallback to PageSpeed Insights API
  try {
    return await runPageSpeedInsights(url);
  } catch (err) {
    console.error("[Lighthouse] PageSpeed API also failed:", err);
    throw new Error("Lighthouse audit failed. Ensure Chrome is installed or provide a PAGESPEED_API_KEY.");
  }
}

// --- Local Lighthouse ---

async function runLocalLighthouse(url: string): Promise<LighthouseScores> {
  // Dynamic imports to avoid build errors if not installed
  const lighthouse = (await import("lighthouse")).default;
  const chromeLauncher = await import("chrome-launcher");

  const chrome = await chromeLauncher.launch({
    chromeFlags: ["--headless", "--no-sandbox", "--disable-gpu"],
  });

  try {
    const result = await lighthouse(url, {
      port: chrome.port,
      output: "json",
      logLevel: "error",
      onlyCategories: ["seo", "performance", "accessibility", "best-practices"],
    });

    if (!result || !result.lhr) {
      throw new Error("Lighthouse returned no results");
    }

    const { lhr } = result;
    const categories = lhr.categories;

    const scores: LighthouseScores = {
      seo: Math.round((categories.seo?.score || 0) * 100),
      performance: Math.round((categories.performance?.score || 0) * 100),
      accessibility: Math.round((categories.accessibility?.score || 0) * 100),
      bestPractices: Math.round((categories["best-practices"]?.score || 0) * 100),
    };

    // Extract Core Web Vitals
    const audits = lhr.audits;
    if (audits) {
      scores.coreWebVitals = {
        lcp: audits["largest-contentful-paint"]?.numericValue || 0,
        fid: audits["max-potential-fid"]?.numericValue || 0,
        cls: audits["cumulative-layout-shift"]?.numericValue || 0,
        fcp: audits["first-contentful-paint"]?.numericValue || 0,
        ttfb: audits["server-response-time"]?.numericValue || 0,
      };
    }

    return scores;
  } finally {
    try {
      await chrome.kill();
    } catch (killErr) {
      console.warn("[Lighthouse] Warning cleaning up Chrome launcher:", killErr);
    }
  }
}

// --- PageSpeed Insights API Fallback ---

async function runPageSpeedInsights(url: string): Promise<LighthouseScores> {
  const apiKey = process.env.PAGESPEED_API_KEY;
  const categories = ["seo", "performance", "accessibility", "best-practices"];
  const categoryParams = categories.map((c) => `category=${c}`).join("&");

  const apiUrl = apiKey
    ? `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&${categoryParams}&key=${apiKey}`
    : `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&${categoryParams}`;

  const response = await fetch(apiUrl, { signal: AbortSignal.timeout(120000) });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`PageSpeed API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const lighthouseResult = data.lighthouseResult;

  if (!lighthouseResult) {
    throw new Error("No lighthouse result in PageSpeed response");
  }

  const cats = lighthouseResult.categories;
  const audits = lighthouseResult.audits;

  const scores: LighthouseScores = {
    seo: Math.round((cats?.seo?.score || 0) * 100),
    performance: Math.round((cats?.performance?.score || 0) * 100),
    accessibility: Math.round((cats?.accessibility?.score || 0) * 100),
    bestPractices: Math.round((cats?.["best-practices"]?.score || 0) * 100),
  };

  if (audits) {
    scores.coreWebVitals = {
      lcp: audits["largest-contentful-paint"]?.numericValue || 0,
      fid: audits["max-potential-fid"]?.numericValue || 0,
      cls: audits["cumulative-layout-shift"]?.numericValue || 0,
      fcp: audits["first-contentful-paint"]?.numericValue || 0,
      ttfb: audits["server-response-time"]?.numericValue || 0,
    };
  }

  return scores;
}
