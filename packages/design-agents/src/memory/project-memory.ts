import { z } from "zod/v4";
import type { AgentId } from "../domain.js";
import { now, shortId } from "../util/ids.js";
import {
  type AgentExchange,
  CORE_KEYS,
  type Decision,
  type DecisionStatus,
  type DesignVersion,
  ProjectCore,
  ProjectMemory as ProjectMemorySchema,
  type ProjectMemory as ProjectMemoryData,
} from "./schema.js";

export interface NewDecisionInput {
  topic: string;
  description: string;
  madeBy: AgentId;
  rationale: string;
  basis?: Decision["basis"];
  status?: DecisionStatus;
  tags?: string[];
  /** Topic of an existing decision this one replaces. */
  supersedesTopic?: string;
}

/**
 * The shared project memory (brief sections 10 & 16).
 *
 * All agents read the same instance. Approved decisions are never lost:
 * superseding a decision keeps the old record and links the two.
 */
export class ProjectMemory {
  private constructor(private data: ProjectMemoryData) {}

  static create(input: { projectId?: string; title?: string }): ProjectMemory {
    const ts = now();
    return new ProjectMemory(
      ProjectMemorySchema.parse({
        projectId: input.projectId ?? shortId("proj"),
        title: input.title ?? "Untitled project",
        status: "intake",
        createdAt: ts,
        updatedAt: ts,
      }),
    );
  }

  static fromJSON(raw: unknown): ProjectMemory {
    return new ProjectMemory(ProjectMemorySchema.parse(raw));
  }

  toJSON(): ProjectMemoryData {
    return structuredClone(this.data);
  }

  get id(): string {
    return this.data.projectId;
  }

  get snapshotData(): ProjectMemoryData {
    return this.data;
  }

  private touch(): void {
    this.data.updatedAt = now();
  }

  /* ----- generic core setters -------------------------------------------- */

  /** Replace a top-level core section (layout, styleDirection, budget, ...). */
  setCore<K extends (typeof CORE_KEYS)[number]>(
    key: K,
    value: ProjectCore[K],
  ): void {
    // Validate the single field via the ProjectCore schema shape.
    const fieldSchema = (ProjectCore.shape as Record<string, z.ZodTypeAny>)[key];
    const validated = fieldSchema ? (fieldSchema.parse(value) as ProjectCore[K]) : value;
    (this.data as Record<string, unknown>)[key] = validated;
    this.touch();
  }

  get<K extends keyof ProjectMemoryData>(key: K): ProjectMemoryData[K] {
    return this.data[key];
  }

  setStatus(status: ProjectMemoryData["status"]): void {
    this.data.status = status;
    this.touch();
  }

  setTitle(title: string): void {
    this.data.title = title;
    this.touch();
  }

  addOpenQuestions(questions: string[]): void {
    for (const q of questions) {
      if (!this.data.openQuestions.includes(q)) this.data.openQuestions.push(q);
    }
    this.touch();
  }

  resolveOpenQuestion(question: string): void {
    this.data.openQuestions = this.data.openQuestions.filter((q) => q !== question);
    this.touch();
  }

  /* ----- decisions ------------------------------------------------------- */

  recordDecision(input: NewDecisionInput): Decision {
    const ts = now();
    let supersedes: string | null = null;
    if (input.supersedesTopic) {
      const prior = this.latestDecisionForTopic(input.supersedesTopic);
      if (prior) {
        supersedes = prior.id;
        // The prior record is kept for history but no longer the active choice.
        prior.status = "rejected";
        prior.updatedAt = now();
      }
    }
    const decision: Decision = {
      id: shortId("dec"),
      topic: input.topic,
      description: input.description,
      madeBy: input.madeBy,
      basis: input.basis ?? "inferred",
      status: input.status ?? "proposed",
      rationale: input.rationale,
      supersedes,
      tags: input.tags ?? [],
      createdAt: ts,
      updatedAt: ts,
    };
    this.data.decisions.push(decision);
    this.touch();
    return decision;
  }

  /** Approve a decision. Approved decisions become locked context for all agents. */
  approveDecision(id: string, note?: string): Decision {
    return this.setDecisionStatus(id, "approved", note);
  }

  rejectDecision(id: string, note?: string): Decision {
    return this.setDecisionStatus(id, "rejected", note);
  }

  private setDecisionStatus(id: string, status: DecisionStatus, note?: string): Decision {
    const decision = this.data.decisions.find((d) => d.id === id);
    if (!decision) throw new Error(`Decision ${id} not found`);
    decision.status = status;
    decision.updatedAt = now();
    if (note) decision.rationale += `\n[${status}] ${note}`;
    this.touch();
    return decision;
  }

  /** Approve the newest proposed/approved decision for a topic; reject older ones. */
  lockTopic(topic: string, note?: string): Decision | undefined {
    const relevant = this.data.decisions.filter((d) => d.topic === topic);
    if (relevant.length === 0) return undefined;
    const latest = relevant[relevant.length - 1]!;
    for (const d of relevant) {
      if (d.id !== latest.id && d.status !== "rejected") d.status = "rejected";
    }
    return this.approveDecision(latest.id, note);
  }

  get decisions(): readonly Decision[] {
    return this.data.decisions;
  }

  get approvedDecisions(): Decision[] {
    return this.data.decisions.filter((d) => d.status === "approved");
  }

  get rejectedDecisions(): Decision[] {
    return this.data.decisions.filter((d) => d.status === "rejected");
  }

  get proposedDecisions(): Decision[] {
    return this.data.decisions.filter((d) => d.status === "proposed");
  }

  latestDecisionForTopic(topic: string): Decision | undefined {
    for (let i = this.data.decisions.length - 1; i >= 0; i--) {
      if (this.data.decisions[i]!.topic === topic) return this.data.decisions[i];
    }
    return undefined;
  }

  /* ----- agent conversation log --------------------------------------------- */

  logExchange(entry: Omit<AgentExchange, "id" | "at">): AgentExchange {
    const record: AgentExchange = { id: shortId("msg"), at: now(), ...entry };
    this.data.agentConversations.push(record);
    this.touch();
    return record;
  }

  get conversations(): readonly AgentExchange[] {
    return this.data.agentConversations;
  }

  /* ----- versioning ------------------------------------------------------ */

  snapshotVersion(input: { label: string; styleSummary: string; reason: string }): DesignVersion {
    const core = pickCore(this.data);
    const version: DesignVersion = {
      id: shortId("ver"),
      number: this.data.designVersions.length + 1,
      label: input.label,
      styleSummary: input.styleSummary,
      reason: input.reason,
      createdAt: now(),
      snapshot: core,
    };
    this.data.designVersions.push(version);
    this.touch();
    return version;
  }

  get versions(): readonly DesignVersion[] {
    return this.data.designVersions;
  }

  /** Restore the core design state from a prior version. Decisions/log are kept. */
  restoreVersion(versionId: string): void {
    const version = this.data.designVersions.find((v) => v.id === versionId);
    if (!version) throw new Error(`Version ${versionId} not found`);
    const core = ProjectCore.parse(version.snapshot);
    for (const key of CORE_KEYS) {
      // @ts-expect-error index assignment across a validated union is safe here
      this.data[key] = core[key];
    }
    this.recordDecision({
      topic: "version-restore",
      description: `Restored design state to version ${version.number} (${version.label}).`,
      madeBy: "design_director",
      basis: "confirmed",
      status: "approved",
      rationale: version.reason,
    });
    this.touch();
  }
}

function pickCore(data: ProjectMemoryData): ProjectCore {
  const out = {} as Record<string, unknown>;
  for (const key of CORE_KEYS) out[key] = structuredClone(data[key]);
  return ProjectCore.parse(out);
}
