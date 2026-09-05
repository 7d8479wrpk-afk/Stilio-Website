import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod/v4";
import type { LLMClient, StructuredRequest, StructuredResult, Effort } from "./types.js";

const MAX_TOKENS_BY_EFFORT: Record<Effort, number> = {
  low: 4000,
  medium: 8000,
  high: 16000,
  max: 24000,
};

export interface AnthropicClientOptions {
  model?: string;
  apiKey?: string;
  /** Retries when the model returns JSON that fails schema validation. */
  validationRetries?: number;
}

/**
 * Real Claude backend.
 *
 * Structured output is obtained with forced single-tool use: we expose the
 * agent's Zod schema as one tool, force `tool_choice` to it, and validate
 * `tool_use.input` with Zod. This is stable across SDK versions and does not
 * depend on the newer `messages.parse` / `output_config` surface.
 */
export class AnthropicLLMClient implements LLMClient {
  readonly backend = "anthropic" as const;
  readonly model: string;

  private readonly client: Anthropic;
  private readonly validationRetries: number;

  constructor(opts: AnthropicClientOptions = {}) {
    this.model = opts.model ?? process.env.STILIO_MODEL ?? "claude-opus-5";
    this.validationRetries = opts.validationRetries ?? 1;
    this.client = new Anthropic(
      opts.apiKey ? { apiKey: opts.apiKey } : {},
    );
  }

  async generateStructured<T>(req: StructuredRequest<T>): Promise<StructuredResult<T>> {
    const effort = req.effort ?? "high";
    const maxTokens = req.maxTokens ?? MAX_TOKENS_BY_EFFORT[effort];
    const jsonSchema = toToolSchema(req.schema);

    const messages: Anthropic.MessageParam[] = [
      { role: "user", content: req.prompt },
    ];

    let attempts = 0;
    let lastError: unknown;
    const usage = { inputTokens: 0, outputTokens: 0, cacheReadInputTokens: 0 };

    while (attempts <= this.validationRetries) {
      attempts++;
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: maxTokens,
        system: [
          {
            type: "text",
            text: req.system,
            cache_control: { type: "ephemeral" },
          },
        ],
        tools: [
          {
            name: req.schemaName,
            description:
              req.schemaDescription ??
              `Return the ${req.schemaName} result as a single structured object.`,
            input_schema: jsonSchema as Anthropic.Tool.InputSchema,
          },
        ],
        tool_choice: { type: "tool", name: req.schemaName, disable_parallel_tool_use: true },
        messages,
      });

      usage.inputTokens += response.usage.input_tokens ?? 0;
      usage.outputTokens += response.usage.output_tokens ?? 0;
      usage.cacheReadInputTokens += response.usage.cache_read_input_tokens ?? 0;

      const toolUse = response.content.find(
        (b): b is Anthropic.ToolUseBlock => b.type === "tool_use",
      );
      if (!toolUse) {
        lastError = new Error(
          `Model did not call the ${req.schemaName} tool (stop_reason=${response.stop_reason}).`,
        );
        messages.push(
          { role: "assistant", content: response.content },
          {
            role: "user",
            content: `You must call the ${req.schemaName} tool with a complete object. Try again.`,
          },
        );
        continue;
      }

      const parsed = req.schema.safeParse(toolUse.input);
      if (parsed.success) {
        return {
          data: parsed.data,
          usage,
          model: this.model,
          backend: this.backend,
          attempts,
        };
      }

      lastError = parsed.error;
      messages.push(
        { role: "assistant", content: response.content },
        {
          role: "user",
          content: [
            {
              type: "tool_result",
              tool_use_id: toolUse.id,
              is_error: true,
              content:
                "The object failed validation. Fix these issues and call the tool again:\n" +
                z.prettifyError(parsed.error),
            },
          ],
        },
      );
    }

    throw new LLMValidationError(
      `Structured generation for ${req.agent}/${req.schemaName} failed after ${attempts} attempt(s).`,
      lastError,
    );
  }
}

export class LLMValidationError extends Error {
  readonly detail: unknown;
  constructor(message: string, detail: unknown) {
    super(message);
    this.name = "LLMValidationError";
    this.detail = detail;
  }
}

/**
 * Convert a Zod schema to a JSON Schema suitable for a tool `input_schema`.
 * The API requires the root to be an object schema.
 */
export function toToolSchema(schema: z.ZodType): Record<string, unknown> {
  const json = z.toJSONSchema(schema, { target: "draft-2020-12", io: "output" }) as Record<
    string,
    unknown
  >;
  delete json["$schema"];
  if (json["type"] !== "object") {
    return {
      type: "object",
      properties: { value: json },
      required: ["value"],
      additionalProperties: false,
    };
  }
  return json;
}
