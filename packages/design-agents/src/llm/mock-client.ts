import { z } from "zod/v4";
import type { AgentId } from "../domain.js";
import type { LLMClient, StructuredRequest, StructuredResult } from "./types.js";
import { synthesizeFromSchema } from "./synthesize.js";

export interface MockContext {
  agent: AgentId;
  system: string;
  prompt: string;
  schemaName: string;
}

/** A fixture generator returns an object that will be schema-validated. */
export type MockFixture = (ctx: MockContext) => unknown;

export interface MockClientOptions {
  fixtures?: Partial<Record<AgentId, MockFixture>>;
  /** If true, throw when an agent has no registered fixture instead of synthesizing. */
  strict?: boolean;
}

/**
 * Deterministic offline backend. Routes each request to a per-agent fixture;
 * if none is registered, synthesizes a minimal valid object from the schema.
 * The whole workflow can therefore run without network or API keys.
 */
export class MockLLMClient implements LLMClient {
  readonly backend = "mock" as const;
  readonly model = "mock-deterministic";

  private readonly fixtures: Partial<Record<AgentId, MockFixture>>;
  private readonly strict: boolean;

  constructor(opts: MockClientOptions = {}) {
    this.fixtures = opts.fixtures ?? {};
    this.strict = opts.strict ?? false;
  }

  register(agent: AgentId, fixture: MockFixture): this {
    this.fixtures[agent] = fixture;
    return this;
  }

  async generateStructured<T>(req: StructuredRequest<T>): Promise<StructuredResult<T>> {
    const fixture = this.fixtures[req.agent];
    let candidate: unknown;

    if (fixture) {
      candidate = fixture({
        agent: req.agent,
        system: req.system,
        prompt: req.prompt,
        schemaName: req.schemaName,
      });
    } else if (this.strict) {
      throw new Error(`MockLLMClient: no fixture registered for agent "${req.agent}".`);
    } else {
      candidate = synthesizeFromSchema(req.schema, `mock:${req.agent}`);
    }

    const parsed = req.schema.safeParse(candidate);
    if (!parsed.success) {
      throw new Error(
        `MockLLMClient: fixture for "${req.agent}" failed schema "${req.schemaName}":\n` +
          z.prettifyError(parsed.error),
      );
    }

    return {
      data: parsed.data,
      usage: { inputTokens: 0, outputTokens: 0, cacheReadInputTokens: 0 },
      model: this.model,
      backend: this.backend,
      attempts: 1,
    };
  }
}
