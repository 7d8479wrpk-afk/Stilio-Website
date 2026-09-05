import type { AgentId } from "../domain.js";
import {
  createSpecialistRegistry,
  DesignDirector,
  type SpecialistAgent,
} from "../agents/index.js";
import type { AgentTask, AgentResult } from "../messaging/types.js";
import type { LLMClient } from "../llm/types.js";
import { ProjectMemory } from "../memory/project-memory.js";
import type { ProjectStore } from "../memory/store.js";
import { assembleFinalSpec } from "../spec/final-spec.js";
import type { FinalDesignSpecification } from "../spec/schema.js";
import type {
  BriefCompilation,
  DirectorIntake,
  DirectorPresentation,
  DirectorResolution,
  DirectorSynthesis,
} from "../agents/schemas.js";
import type { WorkflowEventHandler } from "./events.js";

export interface WorkflowOptions {
  /** Answers to the Director's intake questions, keyed by question text (or index). */
  answers?: Record<string, string>;
  /** If the Director still needs answers and none were given, stop and ask. Default true. */
  pauseForQuestions?: boolean;
  /** Max revision rounds after synthesis and after the critic. Default 1. */
  maxRevisionRounds?: number;
  onEvent?: WorkflowEventHandler;
  store?: ProjectStore;
}

export type WorkflowOutcome = "finalized" | "awaiting_user";

interface SpecialistTaskInput {
  task: string;
  instruction: string;
  constraints?: Record<string, unknown>;
  contextRefs?: string[];
}

export interface WorkflowRunResult {
  outcome: WorkflowOutcome;
  memory: ProjectMemory;
  intake: DirectorIntake;
  brief?: BriefCompilation;
  synthesis?: DirectorSynthesis;
  resolution?: DirectorResolution;
  presentation?: DirectorPresentation;
  finalSpec?: FinalDesignSpecification;
  /** Questions/blocking items when outcome is "awaiting_user". */
  pending: string[];
  usage: { inputTokens: number; outputTokens: number; calls: number };
  backend: "anthropic" | "mock";
}

const PHASE_B: AgentId[] = ["furniture_curator", "material_specialist", "lighting_designer"];

const CORE_KEY_BY_AGENT: Partial<Record<AgentId, Parameters<ProjectMemory["setCore"]>[0]>> = {
  space_planner: "layout",
  style_director: "styleDirection",
  furniture_curator: "furniture",
  material_specialist: "materials",
  lighting_designer: "lighting",
  budget_manager: "budget",
  design_critic: "review",
  visualizer: "visualization",
};

/**
 * Runs the full agent workflow (brief section 12):
 *
 *   user -> Design Director -> brief
 *        -> Space Planner + Style Director
 *        -> Furniture Curator + Material Specialist + Lighting Designer
 *        -> Budget Manager
 *        -> Design Director (synthesis, conflict resolution, revisions)
 *        -> Design Critic
 *        -> Design Director (resolve review)
 *        -> version snapshot
 *        -> Visualizer
 *        -> final design specification + presentation
 */
export class DesignWorkflow {
  private readonly director: DesignDirector;
  private readonly specialists: Map<AgentId, SpecialistAgent>;
  private readonly usage = { inputTokens: 0, outputTokens: 0, calls: 0 };

  constructor(
    private readonly llm: LLMClient,
    private readonly opts: WorkflowOptions = {},
  ) {
    this.director = new DesignDirector(llm);
    this.specialists = createSpecialistRegistry();
  }

  private emit: WorkflowEventHandler = (e) => this.opts.onEvent?.(e);

  private account(meta: { usage: { inputTokens: number; outputTokens: number } }): void {
    this.usage.inputTokens += meta.usage.inputTokens;
    this.usage.outputTokens += meta.usage.outputTokens;
    this.usage.calls += 1;
  }

  private async persist(memory: ProjectMemory): Promise<void> {
    if (this.opts.store) await this.opts.store.save(memory);
  }

  private async runSpecialist<T = unknown>(
    memory: ProjectMemory,
    agentId: AgentId,
    task: SpecialistTaskInput,
  ): Promise<AgentResult<T>> {
    const agent = this.specialists.get(agentId);
    if (!agent) throw new Error(`Unknown specialist: ${agentId}`);
    this.emit({ type: "agent_start", agent: agentId, task: task.task });
    const fullTask: AgentTask = {
      projectId: memory.id,
      fromAgent: "design_director",
      toAgent: agentId,
      task: task.task,
      instruction: task.instruction,
      constraints: task.constraints ?? {},
      contextRefs: task.contextRefs ?? [],
    };
    const result = (await agent.run({ llm: this.llm, memory, task: fullTask })) as AgentResult<T>;
    this.account(result);

    const coreKey = CORE_KEY_BY_AGENT[agentId];
    if (coreKey) {
      memory.setCore(coreKey, result.data as never);
      memory.recordDecision({
        topic: coreKey,
        description: result.status === "ok" ? `${agent.label} output accepted` : `${agent.label} output (${result.status})`,
        madeBy: agentId,
        basis: "inferred",
        status: "proposed",
        rationale: task.instruction,
        supersedesTopic: coreKey,
      });
    }

    this.emit({
      type: "agent_done",
      agent: agentId,
      task: task.task,
      status: result.status,
      summary: result.summary,
      attempts: result.attempts,
    });
    for (const c of result.conflicts as Array<Record<string, unknown>>) {
      this.emit({
        type: "conflict",
        between: [agentId, (c.withAgent as AgentId) ?? "design_director"],
        topic: String(c.topic ?? "unknown"),
        resolution: String(c.proposedResolution ?? ""),
      });
    }
    await this.persist(memory);
    return result;
  }

  async run(userMessage: string, existing?: ProjectMemory): Promise<WorkflowRunResult> {
    const memory = existing ?? ProjectMemory.create({ title: "New design project" });
    const maxRounds = this.opts.maxRevisionRounds ?? 1;
    const pauseForQuestions = this.opts.pauseForQuestions ?? true;
    const answers = this.opts.answers ?? {};

    /* ---- 1. Intake ---------------------------------------------------- */
    this.emit({ type: "phase_start", phase: "intake" });
    const { data: intake, meta: intakeMeta } = await this.director.intake(memory, userMessage);
    this.account(intakeMeta);
    memory.addOpenQuestions(intake.missingCritical.map((m) => m.question));
    await this.persist(memory);
    this.emit({ type: "phase_done", phase: "intake" });

    const unanswered = intake.missingCritical
      .map((m) => m.question)
      .filter((q) => !(q in answers));
    if (!intake.readyToProceed && unanswered.length > 0 && pauseForQuestions) {
      this.emit({ type: "awaiting_user", questions: unanswered });
      return this.result("awaiting_user", memory, { intake, pending: unanswered });
    }

    /* ---- 2. Brief --------------------------------------------------- */
    this.emit({ type: "phase_start", phase: "brief" });
    const { data: brief, meta: briefMeta } = await this.director.compileBrief(
      memory,
      userMessage,
      answers,
    );
    this.account(briefMeta);
    applyBriefToMemory(memory, brief);
    memory.setStatus("designing");
    memory.recordDecision({
      topic: "brief",
      description: `Brief compiled: ${brief.title}`,
      madeBy: "design_director",
      basis: "confirmed",
      status: "approved",
      rationale: brief.assumptions.map((a) => a.statement).join("; ") || "Compiled from user brief.",
    });
    for (const q of intake.missingCritical.map((m) => m.question)) {
      if (q in answers) memory.resolveOpenQuestion(q);
    }
    await this.persist(memory);
    this.emit({ type: "phase_done", phase: "brief" });

    /* ---- 3. Space Planner + Style Director ------------------------- */
    this.emit({ type: "phase_start", phase: "space_and_style" });
    await Promise.all([
      this.runSpecialist(memory, "space_planner", {
        task: "create_layouts",
        instruction: "Create the primary layout plus 2-3 alternatives for this room.",
      }),
      this.runSpecialist(memory, "style_director", {
        task: "define_style",
        instruction: "Define the visual direction, palette, materials, and rules for the team.",
      }),
    ]);
    this.emit({ type: "phase_done", phase: "space_and_style" });

    /* ---- 4. Furniture + Materials + Lighting ---------------------- */
    this.emit({ type: "phase_start", phase: "furniture_material_lighting" });
    await Promise.all([
      this.runSpecialist(memory, "furniture_curator", {
        task: "recommend_furniture",
        instruction: "Select furniture that fits the approved layout and the style rules.",
      }),
      this.runSpecialist(memory, "material_specialist", {
        task: "define_materials",
        instruction: "Produce the full material palette for every surface.",
      }),
      this.runSpecialist(memory, "lighting_designer", {
        task: "design_lighting",
        instruction: "Create the four-layer lighting plan and five lighting scenes.",
      }),
    ]);
    this.emit({ type: "phase_done", phase: "furniture_material_lighting" });

    /* ---- 5. Budget ---------------------------------------------------- */
    await this.runBudget(memory, "Estimate the complete project cost from the current plan.");

    /* ---- 6. Director synthesis + revisions -------------------------- */
    this.emit({ type: "phase_start", phase: "director_synthesis" });
    const { data: synthesis, meta: synMeta } = await this.director.synthesize(memory);
    this.account(synMeta);
    for (const c of synthesis.detectedConflicts) {
      memory.logExchange({
        from: "design_director",
        to: "design_director",
        kind: "conflict",
        task: "resolve_conflict",
        summary: `${c.topic}: ${c.resolution}`,
        payload: c,
      });
      this.emit({ type: "conflict", between: c.between, topic: c.topic, resolution: c.resolution });
    }
    await this.persist(memory);
    this.emit({ type: "phase_done", phase: "director_synthesis" });

    await this.applyRevisions(
      memory,
      synthesis.revisionRequests.map((r) => ({ agent: r.agent, instruction: r.instruction, reason: r.reason })),
      maxRounds,
    );
    for (const q of synthesis.openDecisionsForUser) memory.addOpenQuestions([q]);

    /* ---- 7. Critic + resolution loop ------------------------------ */
    let resolution: DirectorResolution | undefined;
    let round = 0;
    while (round <= maxRounds) {
      this.emit({ type: "phase_start", phase: "critic", note: `round ${round + 1}` });
      const critic = await this.runSpecialist<import("../agents/schemas.js").DesignReview>(
        memory,
        "design_critic",
        {
          task: "review_proposal",
          instruction: "Review the entire proposal. Score it and list every issue with a revision.",
        },
      );
      this.emit({ type: "phase_done", phase: "critic" });

      this.emit({ type: "phase_start", phase: "director_resolution" });
      const res = await this.director.resolveReview(memory);
      this.account(res.meta);
      resolution = res.data;
      await this.persist(memory);
      this.emit({ type: "phase_done", phase: "director_resolution" });

      const blockingForUser = resolution.unresolvedIssues.filter((i) => i.needsUser);
      if (blockingForUser.length > 0) {
        const pending = blockingForUser.map(
          (i) => `${i.issueId}: ${i.why}`,
        );
        for (const p of pending) memory.addOpenQuestions([p]);
        await this.persist(memory);
        if (pauseForQuestions) {
          this.emit({ type: "awaiting_user", questions: pending });
          return this.result("awaiting_user", memory, {
            intake,
            brief,
            synthesis,
            resolution,
            pending,
          });
        }
      }

      const rerun = dedupeAgents(resolution.addressedIssues.flatMap((i) => i.agentsToRerun));
      if (resolution.readyToFinalize || rerun.length === 0 || round === maxRounds) {
        void critic;
        break;
      }
      await this.applyRevisions(
        memory,
        rerun.map((agent) => ({
          agent,
          instruction:
            "Revise your output to address the Design Critic's issues listed in the DESIGN REVIEW context.",
          reason: "Critic revision round",
        })),
        1,
      );
      round++;
    }

    /* ---- 8. Lock decisions + version snapshot -------------------- */
    this.emit({ type: "phase_start", phase: "versioning" });
    for (const topic of ["layout", "styleDirection", "furniture", "materials", "lighting", "budget"]) {
      memory.lockTopic(topic, "Approved by Design Director after critic resolution.");
    }
    const style = memory.get("styleDirection");
    memory.snapshotVersion({
      label: style ? `${style.primaryStyle}${style.secondaryStyle ? ` + ${style.secondaryStyle}` : ""}` : "Design v1",
      styleSummary: resolution?.finalNarrative ?? synthesis.narrative,
      reason: "Design approved after Design Critic review.",
    });
    memory.setStatus("reviewing");
    await this.persist(memory);
    this.emit({ type: "phase_done", phase: "versioning" });

    /* ---- 9. Visualizer -------------------------------------------- */
    this.emit({ type: "phase_start", phase: "visualization" });
    await this.runSpecialist(memory, "visualizer", {
      task: "prepare_visualization",
      instruction: "Produce the visualization specification from the approved design only.",
    });
    memory.lockTopic("visualization", "Visualization spec accepted.");
    this.emit({ type: "phase_done", phase: "visualization" });

    /* ---- 10. Final spec + presentation -------------------------- */
    this.emit({ type: "phase_start", phase: "final_spec" });
    const finalSpec = assembleFinalSpec(memory, {
      designRationale: resolution?.finalNarrative ?? synthesis.narrative,
    });
    this.emit({ type: "phase_done", phase: "final_spec" });

    this.emit({ type: "phase_start", phase: "presentation" });
    const { data: presentation, meta: presMeta } = await this.director.present(memory);
    this.account(presMeta);
    memory.setStatus("finalized");
    await this.persist(memory);
    this.emit({ type: "phase_done", phase: "presentation" });

    return this.result("finalized", memory, {
      intake,
      brief,
      synthesis,
      resolution,
      presentation,
      finalSpec,
      pending: memory.get("openQuestions"),
    });
  }

  private async runBudget(memory: ProjectMemory, instruction: string): Promise<void> {
    this.emit({ type: "phase_start", phase: "budget" });
    await this.runSpecialist(memory, "budget_manager", { task: "estimate_budget", instruction });
    this.emit({ type: "phase_done", phase: "budget" });
  }

  private async applyRevisions(
    memory: ProjectMemory,
    requests: Array<{ agent: AgentId; instruction: string; reason: string }>,
    rounds: number,
  ): Promise<void> {
    if (requests.length === 0 || rounds <= 0) return;
    const touched = new Set<AgentId>();
    for (const req of requests) {
      if (!this.specialists.has(req.agent) || req.agent === "design_critic") continue;
      this.emit({ type: "revision", agent: req.agent, reason: req.reason });
      memory.logExchange({
        from: "design_director",
        to: req.agent,
        kind: "revision",
        task: "revise",
        summary: req.reason,
        payload: req,
      });
      await this.runSpecialist(memory, req.agent, {
        task: "revise_output",
        instruction: `${req.instruction}\n\nReason: ${req.reason}`,
      });
      touched.add(req.agent);
    }
    if ([...touched].some((a) => PHASE_B.includes(a) || a === "space_planner" || a === "style_director")) {
      await this.runBudget(memory, "Re-estimate the budget after the latest revisions.");
    }
  }

  private result(
    outcome: WorkflowOutcome,
    memory: ProjectMemory,
    parts: Partial<Omit<WorkflowRunResult, "outcome" | "memory" | "usage" | "backend">> & {
      intake: DirectorIntake;
    },
  ): WorkflowRunResult {
    return {
      outcome,
      memory,
      intake: parts.intake,
      brief: parts.brief,
      synthesis: parts.synthesis,
      resolution: parts.resolution,
      presentation: parts.presentation,
      finalSpec: parts.finalSpec,
      pending: parts.pending ?? [],
      usage: { ...this.usage },
      backend: this.llm.backend,
    };
  }
}

function dedupeAgents(ids: AgentId[]): AgentId[] {
  return [...new Set(ids)];
}

function applyBriefToMemory(memory: ProjectMemory, brief: BriefCompilation): void {
  memory.setTitle(brief.title);
  memory.setCore("clientPreferences", {
    stylePreferences: brief.clientPreferences.stylePreferences,
    colorPreferences: brief.clientPreferences.colorPreferences,
    materialPreferences: brief.clientPreferences.materialPreferences,
    dislikes: brief.clientPreferences.dislikes,
    functionalRequirements: brief.clientPreferences.functionalRequirements,
    accessibilityNeeds: brief.clientPreferences.accessibilityNeeds,
    householdSize: brief.clientPreferences.householdSize,
    hasChildren: brief.clientPreferences.hasChildren,
    hasPets: brief.clientPreferences.hasPets,
    inspirationNotes: brief.clientPreferences.inspirationNotes,
  });
  memory.setCore("roomInformation", {
    roomType: brief.roomType,
    existingFurnitureToKeep: brief.existingFurnitureToKeep,
  });
  if (brief.dimensions) memory.setCore("dimensions", brief.dimensions);
  memory.setCore("architecturalConstraints", {
    openings: brief.openings,
    features: [],
    notes: brief.architecturalNotes,
  });
  memory.setCore("budgetContext", {
    currency: brief.currency,
    total: brief.budgetTotal,
    notes: [],
  });
  memory.setCore("brief", brief);
  memory.addOpenQuestions(brief.openQuestions);
}
