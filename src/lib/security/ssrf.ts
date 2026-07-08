import dns from "dns";
import { promisify } from "util";
import { CrawlError } from "@/lib/errors/exceptions";
import { logger } from "@/lib/logging/logger";

const resolveDns = promisify(dns.resolve);

// SSRF IP Blocklist (IPv4 private, loopback, link-local, class E & IPv6 local/loopback/link-local)
const PRIVATE_IP_RANGES = [
  /^127\./,                 // Loopback
  /^10\./,                  // Private class A
  /^192\.168\./,            // Private class C
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // Private class B
  /^169\.254\./,            // Link-local
  /^224\./,                 // Multicast
  /^240\./,                 // Reserved / Class E
  /^0\./,                   // Local network
  /^::1$/,                  // IPv6 loopback
  /^fc00:/,                 // IPv6 unique local
  /^fe80:/,                 // IPv6 link-local
  /^ff00:/                  // IPv6 multicast
];

/**
 * Validates a hostname or IP against the SSRF blocklist.
 * Resolves hostnames to verify all target IPs.
 */
export async function validateUrlForSsrf(urlStr: string): Promise<string> {
  try {
    const url = new URL(urlStr);
    const hostname = url.hostname;

    // Reject localhost hostname
    if (hostname.toLowerCase() === "localhost") {
      throw new CrawlError(`Access to localhost is blocked for security: ${urlStr}`, urlStr);
    }

    // Resolve IPs for the hostname
    let ips: string[] = [];
    
    // Check if hostname is already an IP
    if (/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(hostname) || hostname.includes(":")) {
      ips = [hostname];
    } else {
      try {
        ips = await resolveDns(hostname);
      } catch (err) {
        logger.warn(`DNS resolution failed for ${hostname}, attempting lookup fallback`, err);
        // Fallback lookup
        const lookup = promisify(dns.lookup);
        const res = await lookup(hostname);
        ips = [res.address];
      }
    }

    if (ips.length === 0) {
      throw new CrawlError(`Failed to resolve host: ${hostname}`, urlStr);
    }

    for (const ip of ips) {
      for (const pattern of PRIVATE_IP_RANGES) {
        if (pattern.test(ip)) {
          throw new CrawlError(`Access to private IP space is blocked: ${ip} for ${urlStr}`, urlStr);
        }
      }
    }

    return urlStr;
  } catch (error) {
    if (error instanceof CrawlError) throw error;
    throw new CrawlError(`SSRF Validation failed: ${error instanceof Error ? error.message : String(error)}`, urlStr);
  }
}
