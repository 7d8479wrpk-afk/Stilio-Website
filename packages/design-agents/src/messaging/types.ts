import { z } from "zod/v4";
import { AgentId } from "../domain.js";

/**
 * Agents communicate through structured messages, not free-form chat (section 11).
 * A task goes out; a typed result comes back.
 */

export const AgentTask = z.object({
  projectId: z.string(),
  fromAgent: AgentId,
  toAgent: AgentId,
  task: z.string().describe("Machine key, e.g. 'recommend_furniture'"),
  instruction: z.string().describe("Human-readable instruction for this run"),
  constraints: z.record(z.string(), z.unknown()).default(() => ({})),
  /** Keys of the shared memory the agent should treat as authoritative. */
  contextRefs: z.array(z.string()).default(() => []),
});
export type AgentTask = z.infer<typeof AgentTask>;

export const AgentResultStatus = z.enum([
  "ok",
  "ok_with_conflicts",
  "needs_info",
  "impossible",
]);
export type AgentResultStatus = z.infer<typeof AgentResultStatus>;

/** Wrapper around each agent's schema-validated payload. */
export interface AgentResult<T> {
  projectId: string;
  agent: AgentId;
  task: string;
  status: AgentResultStatus;
  /** One-line human summary of this agent's output. */
  summary: string;
  data: T;
  /** Conflicts the agent surfaced (mirrors payload.conflicts when present). */
  conflicts: unknown[];
  /** Assumptions vs. confirmed info (mirrors payload.assumptions when present). */
  assumptions: unknown[];
  /** Open questions the agent needs answered. */
  questions: string[];
  usage: { inputTokens: number; outputTokens: number };
  backend: "anthropic" | "mock";
  attempts: number;
}
