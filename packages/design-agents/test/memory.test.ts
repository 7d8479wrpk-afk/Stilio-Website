import { describe, expect, it } from "vitest";
import { ProjectMemory } from "../src/memory/project-memory.js";
import { rulePriority, topPriority } from "../src/workflow/priority.js";

describe("ProjectMemory", () => {
  it("never loses a superseded decision and links the two", () => {
    const m = ProjectMemory.create({ title: "Test" });
    const first = m.recordDecision({
      topic: "flooring",
      description: "Grey laminate",
      madeBy: "material_specialist",
      rationale: "cheap",
      status: "approved",
    });
    const second = m.recordDecision({
      topic: "flooring",
      description: "Warm walnut engineered timber",
      madeBy: "material_specialist",
      rationale: "user asked to keep walnut",
      status: "approved",
      supersedesTopic: "flooring",
    });

    expect(m.decisions.length).toBe(2);
    expect(second.supersedes).toBe(first.id);
    expect(m.latestDecisionForTopic("flooring")?.id).toBe(second.id);
    // The old record is still there, now rejected.
    expect(m.decisions.find((d) => d.id === first.id)?.status).toBe("rejected");
  });

  it("lockTopic approves the latest and rejects the rest", () => {
    const m = ProjectMemory.create({});
    m.recordDecision({ topic: "palette", description: "A", madeBy: "style_director", rationale: "x" });
    m.recordDecision({ topic: "palette", description: "B", madeBy: "style_director", rationale: "y" });
    const locked = m.lockTopic("palette");
    expect(locked?.description).toBe("B");
    expect(m.approvedDecisions.filter((d) => d.topic === "palette").length).toBe(1);
    expect(m.rejectedDecisions.filter((d) => d.topic === "palette").length).toBe(1);
  });

  it("snapshots and restores a design version", () => {
    const m = ProjectMemory.create({});
    m.setCore("dimensions", { lengthM: 5, widthM: 4 });
    m.setCore("clientPreferences", {
      stylePreferences: ["modern"],
      colorPreferences: [],
      materialPreferences: [],
      dislikes: [],
      functionalRequirements: [],
      accessibilityNeeds: [],
      inspirationNotes: [],
    });
    const v1 = m.snapshotVersion({ label: "Modern", styleSummary: "clean", reason: "first pass" });

    m.setCore("dimensions", { lengthM: 6, widthM: 4 });
    expect(m.get("dimensions")?.lengthM).toBe(6);

    m.restoreVersion(v1.id);
    expect(m.get("dimensions")?.lengthM).toBe(5);
    expect(m.approvedDecisions.some((d) => d.topic === "version-restore")).toBe(true);
  });

  it("round-trips through JSON", () => {
    const m = ProjectMemory.create({ title: "Round trip" });
    m.recordDecision({ topic: "x", description: "y", madeBy: "design_director", rationale: "z" });
    const clone = ProjectMemory.fromJSON(m.toJSON());
    expect(clone.id).toBe(m.id);
    expect(clone.decisions.length).toBe(1);
  });
});

describe("priority system", () => {
  it("ranks safety above budget", () => {
    const ruling = rulePriority(
      { agent: "space_planner", position: "keep 90cm egress", category: "safety_building_code" },
      { agent: "furniture_curator", position: "bigger sofa", category: "budget" },
    );
    expect(ruling.winner.agent).toBe("space_planner");
    expect(ruling.tie).toBe(false);
  });

  it("flags a tie when both sides argue the same category", () => {
    const ruling = rulePriority(
      { agent: "a", position: "p", category: "functionality" },
      { agent: "b", position: "q", category: "functionality" },
    );
    expect(ruling.tie).toBe(true);
  });

  it("topPriority returns the highest-priority category", () => {
    expect(topPriority(["style", "budget", "physical_feasibility"])).toBe("physical_feasibility");
  });
});
