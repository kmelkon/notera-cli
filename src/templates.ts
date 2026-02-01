import { Template, TemplateMap } from "./config.js";

/**
 * Find matching template for a category.
 * Priority: exact match → wildcard match → parent match → null
 */
export function findTemplate(
  category: string,
  templates: TemplateMap | undefined
): Template | null {
  if (!templates) return null;

  // Exact match
  if (templates[category]) {
    return templates[category];
  }

  // Wildcard and parent matches - collect all candidates with specificity
  const candidates: { pattern: string; specificity: number }[] = [];

  for (const pattern of Object.keys(templates)) {
    if (pattern.endsWith("/*")) {
      const prefix = pattern.slice(0, -2);
      if (category.startsWith(prefix + "/") || category === prefix) {
        // Specificity = number of path segments in prefix
        candidates.push({ pattern, specificity: prefix.split("/").length });
      }
    }
  }

  // Most specific wins (longest prefix)
  if (candidates.length > 0) {
    candidates.sort((a, b) => b.specificity - a.specificity);
    return templates[candidates[0].pattern];
  }

  return null;
}

/**
 * Merge template frontmatter with defaults, handling tag deduplication.
 */
export function mergeFrontmatter(
  base: Record<string, unknown>,
  template: Record<string, unknown> | undefined
): Record<string, unknown> {
  if (!template) return base;

  const merged = { ...template, ...base };

  // Special handling for tags: merge and dedupe
  const baseTags = Array.isArray(base.tags) ? base.tags : [];
  const templateTags = Array.isArray(template.tags) ? template.tags : [];
  merged.tags = [...new Set([...templateTags, ...baseTags])];

  return merged;
}
