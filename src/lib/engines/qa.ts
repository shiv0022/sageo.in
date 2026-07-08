import { IAuditDocument } from "@/types/domain";
import { logger } from "@/lib/logging/logger";

export class QualityAssuranceEngine {
  public verify(auditDoc: IAuditDocument): boolean {
    logger.info(`[QA] Starting final audit document verification...`);

    // 1. Verify URL structure
    if (!auditDoc.targetUrl || !auditDoc.targetUrl.startsWith("http")) {
      logger.error("[QA] Target URL is invalid.", { url: auditDoc.targetUrl });
      return false;
    }

    // 2. Verify score bounds (0-100)
    const checkScore = (name: string, val: number): boolean => {
      if (val < 0 || val > 100 || typeof val !== "number" || isNaN(val)) {
        logger.error(`[QA] Score "${name}" is out of bounds (0-100).`, { val });
        return false;
      }
      return true;
    };

    const s = auditDoc.scores;
    if (
      !checkScore("overall", s.overall) ||
      !checkScore("seo", s.seo) ||
      !checkScore("aeo", s.aeo) ||
      !checkScore("security", s.security) ||
      !checkScore("performance", s.performance) ||
      !checkScore("accessibility", s.accessibility) ||
      !checkScore("geo", s.geo) ||
      !checkScore("access", s.access)
    ) {
      return false;
    }

    // 3. Check for recommendation uniqueness and 16-field compliance
    const seenProblems = new Set<string>();
    const recs = auditDoc.recommendations || [];
    for (const r of recs) {
      const probLower = r.problem.trim().toLowerCase();
      if (seenProblems.has(probLower)) {
        logger.error("[QA] Duplicate recommendation problem found.", { problem: r.problem });
        return false;
      }
      seenProblems.add(probLower);

      // Verify fields
      if (!r.id || !r.problem || !r.reason || !r.evidence || !r.impacts || !r.difficulty || !r.priority) {
        logger.error("[QA] Recommendation missing critical 16-field standard properties.", r);
        return false;
      }
    }

    // 4. Verify context structures
    if (!auditDoc.context || !auditDoc.context.category || !auditDoc.context.industry) {
      logger.error("[QA] Context is missing category or industry.");
      return false;
    }

    // 5. Verify intent
    if (!auditDoc.intent || !auditDoc.intent.primaryType) {
      logger.error("[QA] Intent classification is missing.");
      return false;
    }

    logger.info(`[QA] Audit document verification succeeded! Recommendations audited: ${recs.length}`);
    return true;
  }
}

export const qualityAssuranceEngine = new QualityAssuranceEngine();
