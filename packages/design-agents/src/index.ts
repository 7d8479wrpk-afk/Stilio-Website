/**
 * Stilio — AI interior design agent system.
 *
 * Public entry point. The user talks to the Design Director; the workflow
 * coordinates the specialists behind the scenes over shared project memory.
 */

export * from "./domain.js";
export * from "./llm/index.js";
export { ProjectMemory } from "./memory/project-memory.js";
export { ProjectStore } from "./memory/store.js";
export * as memorySchema from "./memory/schema.js";
export * from "./messaging/types.js";
export * from "./agents/index.js";
export { DesignWorkflow } from "./workflow/orchestrator.js";
export type {
  WorkflowOptions,
  WorkflowRunResult,
  WorkflowOutcome,
} from "./workflow/orchestrator.js";
export * from "./workflow/events.js";
export * from "./workflow/priority.js";
export { assembleFinalSpec } from "./spec/final-spec.js";
export { FinalDesignSpecification } from "./spec/schema.js";
export * as render from "./render/text.js";
export { setClock } from "./util/ids.js";
