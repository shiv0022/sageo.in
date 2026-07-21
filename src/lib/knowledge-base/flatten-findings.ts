/**
 * Converts all engine results into a flat findings map.
 * Input:  { seo: { score: 72, findings: { robotsTxt: { exists: false } } } }
 * Output: { "seo.robotsTxt.exists": false, "seo.title.exists": true, ... }
 */
export function flattenEngineFindings(
  engineResults: Record<string, { score: number; findings: Record<string, any> }>
): Record<string, any> {
  const flat: Record<string, any> = {};

  for (const [engineName, result] of Object.entries(engineResults)) {
    if (result && result.findings) {
      flattenObject(result.findings, engineName, flat);
    }
  }

  return flat;
}

function flattenObject(
  obj: Record<string, any>,
  prefix: string,
  target: Record<string, any>
): void {
  if (obj === null || obj === undefined) return;
  
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = `${prefix}.${key}`;
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      flattenObject(value, fullKey, target);
    } else {
      target[fullKey] = value;
    }
  }
}
