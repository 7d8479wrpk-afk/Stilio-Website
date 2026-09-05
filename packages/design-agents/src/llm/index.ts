import type { LLMClient } from "./types.js";
import { AnthropicLLMClient } from "./anthropic-client.js";
import { MockLLMClient } from "./mock-client.js";
import { defaultFixtures } from "../mock/fixtures.js";

export * from "./types.js";
export { AnthropicLLMClient } from "./anthropic-client.js";
export { MockLLMClient } from "./mock-client.js";
export type { MockFixture, MockContext } from "./mock-client.js";

export type LLMSelection = "auto" | "anthropic" | "mock";

export interface CreateLLMOptions {
  backend?: LLMSelection;
  model?: string;
  apiKey?: string;
}

/**
 * Factory used by the CLI and tests.
 *
 * - "auto" (default): use Claude if ANTHROPIC_API_KEY is set, else the mock.
 * - "anthropic": force Claude (errors later if no credentials).
 * - "mock": force the deterministic offline backend (seeded with example fixtures).
 */
export function createLLMClient(opts: CreateLLMOptions = {}): LLMClient {
  const selection: LLMSelection =
    opts.backend ?? (process.env.STILIO_LLM as LLMSelection | undefined) ?? "auto";

  const hasKey = Boolean(opts.apiKey ?? process.env.ANTHROPIC_API_KEY);
  const useAnthropic =
    selection === "anthropic" || (selection === "auto" && hasKey);

  if (useAnthropic) {
    return new AnthropicLLMClient({ model: opts.model, apiKey: opts.apiKey });
  }
  return new MockLLMClient({ fixtures: { ...defaultFixtures } });
}
