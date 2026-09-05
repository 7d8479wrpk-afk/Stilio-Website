import { z } from "zod/v4";

/**
 * Produce a minimal schema-valid object from a JSON Schema (draft 2020-12 subset
 * that `z.toJSONSchema` emits). Used by the mock LLM as a fallback when no
 * hand-written fixture is registered for an agent, so an arbitrary workflow can
 * still run end to end offline.
 */
export function synthesizeFromSchema(schema: z.ZodType, hint = "TBD"): unknown {
  const json = z.toJSONSchema(schema, { target: "draft-2020-12", io: "output" });
  return fromJson(json as JsonSchema, hint, "");
}

type JsonSchema = {
  type?: string | string[];
  properties?: Record<string, JsonSchema>;
  required?: string[];
  items?: JsonSchema | JsonSchema[];
  enum?: unknown[];
  const?: unknown;
  anyOf?: JsonSchema[];
  oneOf?: JsonSchema[];
  allOf?: JsonSchema[];
  default?: unknown;
  minimum?: number;
  minItems?: number;
  minLength?: number;
  format?: string;
};

function fromJson(node: JsonSchema, hint: string, path: string): unknown {
  if (node.default !== undefined) return node.default;
  if (node.const !== undefined) return node.const;
  if (node.enum && node.enum.length > 0) return node.enum[0];

  const combos = node.anyOf ?? node.oneOf;
  if (combos && combos.length > 0) return fromJson(combos[0]!, hint, path);
  if (node.allOf && node.allOf.length > 0) {
    return Object.assign(
      {},
      ...node.allOf.map((s) => fromJson(s, hint, path) as object),
    );
  }

  const type = Array.isArray(node.type) ? node.type[0] : node.type;
  switch (type) {
    case "object": {
      const out: Record<string, unknown> = {};
      const props = node.properties ?? {};
      const required = new Set(node.required ?? Object.keys(props));
      for (const [key, sub] of Object.entries(props)) {
        if (required.has(key)) out[key] = fromJson(sub, labelFor(key, hint), `${path}.${key}`);
      }
      return out;
    }
    case "array": {
      const count = Math.max(node.minItems ?? 0, 0);
      if (count === 0) return [];
      const itemSchema = Array.isArray(node.items) ? node.items[0] : node.items;
      if (!itemSchema) return [];
      return Array.from({ length: count }, () => fromJson(itemSchema, hint, `${path}[]`));
    }
    case "string":
      if (node.format === "date-time") return new Date(0).toISOString();
      return node.minLength && node.minLength > hint.length ? hint.padEnd(node.minLength, ".") : hint;
    case "number":
    case "integer":
      return node.minimum ?? 0;
    case "boolean":
      return false;
    case "null":
      return null;
    default:
      return hint;
  }
}

function labelFor(key: string, hint: string): string {
  const readable = key.replace(/_/g, " ");
  return `${hint} (${readable})`;
}
