import { RulesEngine } from "./rules-engine";
import { seoRules } from "./rules/seo-rules";
import { aeoRules } from "./rules/aeo-rules";
import { geoRules } from "./rules/geo-rules";
import { securityRules } from "./rules/security-rules";
import { performanceRules } from "./rules/performance-rules";
import { accessibilityRules } from "./rules/accessibility-rules";
import { googleVisibilityRules } from "./rules/google-visibility-rules";
import { schemaRules } from "./rules/schema-rules";

// Instantiate the global rules engine
export const rulesEngine = new RulesEngine();

// Register all rule sets
rulesEngine.registerRules(seoRules);
rulesEngine.registerRules(aeoRules);
rulesEngine.registerRules(geoRules);
rulesEngine.registerRules(securityRules);
rulesEngine.registerRules(performanceRules);
rulesEngine.registerRules(accessibilityRules);
rulesEngine.registerRules(googleVisibilityRules);
rulesEngine.registerRules(schemaRules);

export { RulesEngine };
export * from "@/types/knowledge-base";
