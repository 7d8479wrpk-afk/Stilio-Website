import type { z } from "zod/v4";
import type { AgentId } from "../domain.js";

export type LLMBackend = "anthropic" | "mock";

export type Effort = "low" | "medium" | "high" | "max";

export interface StructuredRequest<T> {
  /** Which agent is making the call — used for logging and mock routing. */
  agent: AgentId;
  /** Stable system prompt (agent role). Kept first so it can be cached. */
  system: string;
  /** Per-call user prompt (task + serialized project context). */
  prompt: string;
  /** Zod schema the response must satisfy. */
  schema: z.ZodType<T>;
  /** Name for the output tool / mock key (snake_case). */
  schemaName: string;
  schemaDescription?: string;
  effort?: Effort;
  maxTokens?: number;
}

export interface LLMUsage {
  inputTokens: number;
  outputTokens: number;
  cacheReadInputTokens: number;
}

export interface StructuredResult<T> {
  data: T;
  usage: LLMUsage;
  model: string;
  backend: LLMBackend;
  /** Number of model round-trips (>1 means a validation-repair retry happened). */
  attempts: number;
}

export interface LLMClient {
  readonly backend: LLMBackend;
  readonly model: string;
  generateStructured<T>(req: StructuredRequest<T>): Promise<StructuredResult<T>>;
}

export const EMPTY_USAGE: LLMUsage = {
  inputTokens: 0,
  outputTokens: 0,
  cacheReadInputTokens: 0,
};
