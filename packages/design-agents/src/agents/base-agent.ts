import type { z } from "zod/v4";
import { AGENT_LABELS, type AgentId } from "../domain.js";
import type { Effort, LLMClient } from "../llm/types.js";
import type { ProjectMemory } from "../memory/project-memory.js";
import type { AgentResult, AgentResultStatus, AgentTask } from "../messaging/types.js";

export interface AgentRunContext {
  task: AgentTask;
  memory: ProjectMemory;
  llm: LLMClient;
}

const SHARED_RULES = `
GLOBAL RULES (every agent on this team follows these):
1. You have ONE clearly defined responsibility. Stay inside it.
2. Work from the shared project context you are given. Do not invent facts.
3. Respect decisions made by other agents. Never overwrite an APPROVED decision.
   If you believe an approved decision is wrong, raise it as a conflict — do not just change it.
4. When your recommendation would clash with another agent's, emit a "conflict" entry:
   state your position and cite which priority category justifies it.
   Priority order (highest first): safety/building code > physical feasibility >
   user requirement > functionality > budget > style > aesthetic preference.
5. If a requested recommendation is physically impossible, say so and provide the
   closest feasible alternative.
6. Always stay within the stated budget; if you cannot, flag it explicitly.
7. Always respect physical dimensions and clearances.
8. Separate ASSUMPTIONS from CONFIRMED information. Every assumption goes in the
   "assumptions" array with its basis and the impact if it is wrong.
9. If information that is critical to your job is missing, make your best assumption,
   record it, and note what you would want confirmed.
`.trim();

/**
 * Base class for every specialist. Subclasses declare their id, output schema,
 * system role, and how to compose the per-task prompt. `run()` handles the LLM
 * call, validation (delegated to the LLM client), result wrapping, and logging
 * the exchange into shared memory.
 */
export abstract class BaseAgent<TOutput> {
  abstract readonly id: AgentId;
  abstract readonly schemaName: string;
  abstract readonly outputSchema: z.ZodType<TOutput>;
  protected effort: Effort = "high";

  /** The agent's stable role text (cacheable). */
  protected abstract role(): string;

  /** Compose the task-specific portion of the prompt. */
  protected abstract composePrompt(ctx: AgentRunContext): string;

  get label(): string {
    return AGENT_LABELS[this.id];
  }

  protected systemPrompt(): string {
    return `${this.role()}\n\n${SHARED_RULES}`;
  }

  async run(ctx: AgentRunContext): Promise<AgentResult<TOutput>> {
    const { task, memory, llm } = ctx;

    memory.logExchange({
      from: task.fromAgent,
      to: this.id,
      kind: "task",
      task: task.task,
      summary: task.instruction,
      payload: task,
    });

    const result = await llm.generateStructured<TOutput>({
      agent: this.id,
      system: this.systemPrompt(),
      prompt: this.composePrompt(ctx),
      schema: this.outputSchema,
      schemaName: this.schemaName,
      schemaDescription: `${this.label} structured output`,
      effort: this.effort,
    });

    const conflicts = extractArray(result.data, "conflicts");
    const assumptions = extractArray(result.data, "assumptions");
    const questions = this.extractQuestions(result.data);
    const status = this.deriveStatus(result.data, conflicts, questions);
    const summary = this.summarize(result.data, status);

    const wrapped: AgentResult<TOutput> = {
      projectId: task.projectId,
      agent: this.id,
      task: task.task,
      status,
      summary,
      data: result.data,
      conflicts,
      assumptions,
      questions,
      usage: { inputTokens: result.usage.inputTokens, outputTokens: result.usage.outputTokens },
      backend: result.backend,
      attempts: result.attempts,
    };

    memory.logExchange({
      from: this.id,
      to: task.fromAgent,
      kind: conflicts.length > 0 ? "conflict" : "result",
      task: task.task,
      summary,
      payload: wrapped.data,
    });

    return wrapped;
  }

  /** Subclasses may override to surface open questions from their payload. */
  protected extractQuestions(_data: TOutput): string[] {
    return [];
  }

  protected deriveStatus(
    data: TOutput,
    conflicts: unknown[],
    questions: string[],
  ): AgentResultStatus {
    if (this.isImpossible(data)) return "impossible";
    if (questions.length > 0) return "needs_info";
    if (conflicts.length > 0) return "ok_with_conflicts";
    return "ok";
  }

  protected isImpossible(_data: TOutput): boolean {
    return false;
  }

  /** Short human summary for the conversation log. */
  protected summarize(_data: TOutput, status: AgentResultStatus): string {
    return `${this.label} returned (${status}).`;
  }
}

function extractArray(data: unknown, key: string): unknown[] {
  if (data && typeof data === "object" && Array.isArray((data as Record<string, unknown>)[key])) {
    return (data as Record<string, unknown[]>)[key]!;
  }
  return [];
}
