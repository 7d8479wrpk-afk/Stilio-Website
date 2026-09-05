import type { AgentId } from "../domain.js";
import type { AgentResultStatus } from "../messaging/types.js";

export type WorkflowPhase =
  | "intake"
  | "brief"
  | "space_and_style"
  | "furniture_material_lighting"
  | "budget"
  | "director_synthesis"
  | "critic"
  | "director_resolution"
  | "revision"
  | "versioning"
  | "visualization"
  | "final_spec"
  | "presentation";

export type WorkflowEvent =
  | { type: "phase_start"; phase: WorkflowPhase; note?: string }
  | { type: "phase_done"; phase: WorkflowPhase; note?: string }
  | { type: "agent_start"; agent: AgentId; task: string }
  | {
      type: "agent_done";
      agent: AgentId;
      task: string;
      status: AgentResultStatus;
      summary: string;
      attempts: number;
    }
  | { type: "conflict"; between: AgentId[]; topic: string; resolution: string }
  | { type: "revision"; agent: AgentId; reason: string }
  | { type: "awaiting_user"; questions: string[] }
  | { type: "info"; message: string };

export type WorkflowEventHandler = (event: WorkflowEvent) => void;
