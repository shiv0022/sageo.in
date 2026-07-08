import { logger } from "@/lib/logging/logger";

interface RobotsRule {
  userAgent: string;
  allow: string[];
  disallow: string[];
}

export class RobotsParser {
  private rules: RobotsRule[] = [];
  private sitemaps: string[] = [];

  constructor(rawRobotsTxt?: string) {
    if (rawRobotsTxt) {
      this.parse(rawRobotsTxt);
    }
  }

  private parse(content: string): void {
    try {
      const lines = content.split(/\r?\n/);
      let currentRule: RobotsRule | null = null;

      for (let line of lines) {
        // Strip comments
        const hashIdx = line.indexOf("#");
        if (hashIdx !== -1) {
          line = line.substring(0, hashIdx);
        }

        line = line.trim();
        if (!line) continue;

        const colonIdx = line.indexOf(":");
        if (colonIdx === -1) continue;

        const key = line.substring(0, colonIdx).trim().toLowerCase();
        const value = line.substring(colonIdx + 1).trim();

        if (key === "user-agent") {
          const ua = value.toLowerCase();
          currentRule = { userAgent: ua, allow: [], disallow: [] };
          this.rules.push(currentRule);
        } else if (key === "disallow" && currentRule) {
          if (value) currentRule.disallow.push(value);
        } else if (key === "allow" && currentRule) {
          if (value) currentRule.allow.push(value);
        } else if (key === "sitemap") {
          if (value) this.sitemaps.push(value);
        }
      }
    } catch (err) {
      logger.error("Failed to parse robots.txt rules", err);
    }
  }

  public getSitemaps(): string[] {
    return this.sitemaps;
  }

  /**
   * Checks if a user agent is allowed to access a specific path.
   */
  public isAllowed(userAgent: string, path: string): boolean {
    const ua = userAgent.toLowerCase();
    
    // Find specific rules first, then fallback to wildcard '*'
    const uaRule = this.rules.find((r) => r.userAgent === ua);
    const wildcardRule = this.rules.find((r) => r.userAgent === "*");

    const rule = uaRule || wildcardRule;
    if (!rule) return true; // Default allowed if no rules match

    // Check allowances first
    for (const allowPath of rule.allow) {
      if (this.matchPath(allowPath, path)) {
        return true;
      }
    }

    // Check disallowances
    for (const disallowPath of rule.disallow) {
      if (this.matchPath(disallowPath, path)) {
        return false;
      }
    }

    return true;
  }

  private matchPath(pattern: string, path: string): boolean {
    // Escape regex special chars except * and $
    const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&");
    const regexStr = "^" + escaped.replace(/\*/g, ".*").replace(/\\\$$/, "$");
    const regex = new RegExp(regexStr);
    return regex.test(path);
  }
}
