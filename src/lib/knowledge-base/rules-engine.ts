import { IKBRule, IKBRuleMatch } from "@/types/knowledge-base";
import { IRecommendation, DifficultyLevel, PriorityLevel } from "@/types/domain";

export class RulesEngine {
  private rules: IKBRule[] = [];

  /** Register a batch of rules */
  registerRules(rules: IKBRule[]): void {
    this.rules.push(...rules);
  }

  /** Get all registered rules */
  getAllRules(): IKBRule[] {
    return [...this.rules];
  }

  /** Get rules by category */
  getRulesByCategory(category: string): IKBRule[] {
    return this.rules.filter(r => r.category === category);
  }

  /** Get a single rule by ID */
  getRule(ruleId: string): IKBRule | undefined {
    return this.rules.find(r => r.ruleId === ruleId);
  }

  /**
   * Match engine findings against all registered rules.
   * Returns an array of matched rules with detected evidence.
   */
  matchFindings(engineFindings: Record<string, any>): IKBRuleMatch[] {
    const matches: IKBRuleMatch[] = [];

    for (const rule of this.rules) {
      // Look up in flat map first, then fall back to nested lookup
      let actualValue = engineFindings[rule.detectionKey];
      if (actualValue === undefined) {
        actualValue = this.resolveNestedValue(engineFindings, rule.detectionKey);
      }

      // Check if value is missing and we expect it to be missing
      if (actualValue === undefined && rule.detectionCondition.operator !== "missing") {
        continue; // Finding not present in engine outputs — skip
      }

      const triggered = this.evaluateCondition(
        actualValue,
        rule.detectionCondition.operator,
        rule.detectionCondition.value
      );

      if (triggered) {
        matches.push({
          rule,
          detectedEvidence: this.buildEvidenceString(rule, actualValue),
          matchedAt: new Date().toISOString()
        });
      }
    }

    return matches;
  }

  /**
   * Convert matched rules into IRecommendation format
   * for backward compatibility with existing IAuditDocument
   */
  toRecommendations(matches: IKBRuleMatch[]): IRecommendation[] {
    return matches.map(m => {
      // Map category to a string expected in frameworkContext or categories
      return {
        id: m.rule.ruleId,
        problem: m.rule.ruleName,
        reason: m.rule.whyItMatters,
        evidence: m.detectedEvidence,
        impacts: {
          business: m.rule.businessImpact,
          seo: m.rule.seoImpact,
          aiVisibility: m.rule.aiVisibilityImpact,
          googleVisibility: m.rule.googleVisibilityImpact,
          security: m.rule.securityImpact
        },
        difficulty: m.rule.difficulty.toLowerCase() as DifficultyLevel,
        estimatedTime: m.rule.estimatedFixTime,
        priority: m.rule.priority as PriorityLevel,
        confidenceScore: m.rule.confidenceLevel,
        frameworkContext: m.rule.referenceType, // Storing reference source authority here
        implementationGuide: {
          steps: m.rule.implementationSteps,
          codeSnippet: m.rule.codeSnippet
        },
        aiPrompt: m.rule.aiPromptTemplate,
        expectedResult: m.rule.expectedResult
      };
    });
  }

  // --- Private helpers ---

  private resolveNestedValue(obj: Record<string, any>, dotPath: string): any {
    const parts = dotPath.split(".");
    let current = obj;
    for (const part of parts) {
      if (current == null) return undefined;
      current = current[part];
    }
    return current;
  }

  private evaluateCondition(actual: any, operator: string, expected: any): boolean {
    switch (operator) {
      case "equals":       return actual === expected;
      case "not_equals":   return actual !== expected;
      case "greater_than": return typeof actual === "number" && actual > expected;
      case "less_than":    return typeof actual === "number" && actual < expected;
      case "contains":     return Array.isArray(actual) && actual.includes(expected);
      case "not_contains": return Array.isArray(actual) && !actual.includes(expected);
      case "missing":      return actual === undefined || actual === null || actual === "";
      default: return false;
    }
  }

  private buildEvidenceString(rule: IKBRule, actualValue: any): string {
    const detail = actualValue !== undefined && actualValue !== null
      ? (typeof actualValue === "object" ? JSON.stringify(actualValue) : String(actualValue))
      : "Not present";
    return `Violation: ${rule.description} (Value: ${detail})`;
  }
}
