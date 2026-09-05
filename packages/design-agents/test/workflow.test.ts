import { beforeEach, describe, expect, it } from "vitest";
import { MockLLMClient } from "../src/llm/mock-client.js";
import { defaultFixtures } from "../src/mock/fixtures.js";
import { DesignWorkflow } from "../src/workflow/orchestrator.js";
import type { WorkflowEvent } from "../src/workflow/events.js";

const BRIEF =
  "I have a 5m x 4m living room. I want something modern and warm. Large window on the north wall. Budget $10,000.";

const ANSWERS: Record<string, string> = {
  "How many people normally use the room?": "3 to 5",
  "Do you need a TV, and wall-mounted or on a unit?": "Wall-mounted",
  "Do you already own furniture that must stay?": "No",
  "Are there children or pets?": "No",
  "Sofa, sectional, or both?": "Sofa plus a reading chair",
};

function mockClient() {
  return new MockLLMClient({ fixtures: { ...defaultFixtures } });
}

describe("DesignWorkflow (mock backend)", () => {
  let events: WorkflowEvent[];

  beforeEach(() => {
    events = [];
  });

  it("pauses for the Director's questions when no answers are supplied", async () => {
    const wf = new DesignWorkflow(mockClient(), { onEvent: (e) => events.push(e) });
    const result = await wf.run(BRIEF);

    expect(result.outcome).toBe("awaiting_user");
    expect(result.pending.length).toBeGreaterThan(0);
    expect(result.brief).toBeUndefined();
    expect(events.some((e) => e.type === "awaiting_user")).toBe(true);
  });

  it("runs the full workflow to a final design specification", async () => {
    const wf = new DesignWorkflow(mockClient(), {
      answers: ANSWERS,
      onEvent: (e) => events.push(e),
    });
    const result = await wf.run(BRIEF);

    expect(result.outcome).toBe("finalized");
    expect(result.memory.get("status")).toBe("finalized");

    // Every specialist produced its section.
    const m = result.memory;
    for (const key of ["layout", "styleDirection", "furniture", "materials", "lighting", "budget", "review", "visualization"] as const) {
      expect(m.get(key), `missing ${key}`).not.toBeNull();
    }

    // Final spec is assembled and shaped for the 3D engine.
    expect(result.finalSpec?.specVersion).toBe("1.0");
    expect(result.finalSpec?.room.type).toBe("living_room");
    expect(result.finalSpec?.designStyle.primary).toBe("Warm Contemporary");
    expect(result.finalSpec?.layout).not.toBeNull();
    expect(result.finalSpec?.approvedDecisions.length).toBeGreaterThan(0);

    // Presentation for the user exists.
    expect(result.presentation?.headline).toBeTruthy();
  });

  it("detects the budget conflict and records the Director's resolution", async () => {
    const wf = new DesignWorkflow(mockClient(), { answers: ANSWERS, onEvent: (e) => events.push(e) });
    const result = await wf.run(BRIEF);

    expect(result.synthesis?.detectedConflicts.length).toBeGreaterThan(0);
    const conflict = result.synthesis!.detectedConflicts[0]!;
    expect(conflict.priorityCategory).toBe("budget");
    expect(events.some((e) => e.type === "conflict")).toBe(true);

    // Budget Manager actually reported an overrun.
    expect(result.memory.get("budget")?.overBudget).toBe(true);
  });

  it("triggers revision runs for the agents the Director asked to revise", async () => {
    const wf = new DesignWorkflow(mockClient(), { answers: ANSWERS, onEvent: (e) => events.push(e) });
    await wf.run(BRIEF);

    const revised = events.filter((e) => e.type === "revision").map((e) => (e as { agent: string }).agent);
    expect(revised).toEqual(expect.arrayContaining(["material_specialist", "furniture_curator", "lighting_designer"]));
  });

  it("locks decisions and snapshots a design version", async () => {
    const wf = new DesignWorkflow(mockClient(), { answers: ANSWERS });
    const result = await wf.run(BRIEF);

    expect(result.memory.versions.length).toBe(1);
    expect(result.memory.versions[0]!.label).toContain("Warm Contemporary");
    expect(result.memory.approvedDecisions.some((d) => d.topic === "layout")).toBe(true);
    expect(result.memory.approvedDecisions.some((d) => d.topic === "budget")).toBe(true);
  });

  it("keeps a structured agent-to-agent conversation log", async () => {
    const wf = new DesignWorkflow(mockClient(), { answers: ANSWERS });
    const result = await wf.run(BRIEF);

    const log = result.memory.conversations;
    expect(log.length).toBeGreaterThan(10);
    expect(log.some((e) => e.from === "design_director" && e.to === "space_planner" && e.kind === "task")).toBe(true);
    expect(log.some((e) => e.from === "space_planner" && e.kind === "result")).toBe(true);
  });

  it("resumes from an existing memory when answers arrive later", async () => {
    const first = await new DesignWorkflow(mockClient(), {}).run(BRIEF);
    expect(first.outcome).toBe("awaiting_user");

    const second = await new DesignWorkflow(mockClient(), { answers: ANSWERS }).run(
      BRIEF,
      first.memory,
    );
    expect(second.outcome).toBe("finalized");
    expect(second.memory.id).toBe(first.memory.id);
  });
});
