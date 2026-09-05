import { AGENT_LABELS } from "../domain.js";
import type {
  BudgetEstimate,
  DesignReview,
  FurniturePlan,
  LayoutProposal,
  LightingPlan,
  MaterialPalette,
  StyleDirection,
  VisualizationSpec,
} from "../agents/schemas.js";
import type { ProjectMemory } from "../memory/project-memory.js";
import type { FinalDesignSpecification } from "../spec/schema.js";

/** Human-readable views generated from the structured JSON (brief's text-block style). */

export function renderLayout(l: LayoutProposal): string {
  return [
    "Layout Proposal",
    "",
    `Room:\n${l.room}`,
    "",
    `Layout:\n${l.chosenConcept}`,
    "",
    `Furniture:\n${l.furniturePlacements.map((f) => `- ${f.item} (${f.approxSizeCm.widthCm}${f.approxSizeCm.depthCm ? `x${f.approxSizeCm.depthCm}` : ""} cm) — ${f.position}`).join("\n")}`,
    "",
    `Clearances:\n${l.clearances.map((c) => `- ${c.between}: ${c.recommendedCm} cm — ${c.notes}`).join("\n")}`,
    `Circulation:\n${l.circulation.map((c) => `- ${c.path}: min ${c.minWidthCm} cm`).join("\n")}`,
    "",
    `Reasoning:\n${l.reasoning}`,
    "",
    l.spatialProblems.length
      ? `Spatial problems:\n${l.spatialProblems.map((p) => `- [${p.severity}] ${p.issue} -> ${p.suggestedFix}`).join("\n")}`
      : "Spatial problems: none identified",
    "",
    `Alternative layouts:\n${l.alternativeLayouts.map((a, i) => `${i + 1}. ${a.name} (${a.focus}) — ${a.description} | trade-offs: ${a.tradeoffs}`).join("\n")}`,
    l.assumptions.length ? `\nAssumptions:\n${l.assumptions.map((a) => `- (${a.basis}) ${a.statement}`).join("\n")}` : "",
  ].join("\n");
}

export function renderStyle(s: StyleDirection): string {
  return [
    "Style Direction:",
    "",
    `Primary:\n${s.primaryStyle}`,
    s.secondaryStyle ? `\nSecondary:\n${s.secondaryStyle}` : "",
    "",
    `Palette:\n${s.palette.map((p) => `- ${p.name} (${p.role})${p.hex ? ` ${p.hex}` : ""}`).join("\n")}`,
    "",
    `Materials:\n${s.materials.map((m) => `- ${m}`).join("\n")}`,
    "",
    `Textures:\n${s.textures.join(", ")}`,
    `Shapes:\n${s.shapes.join(", ")}`,
    "",
    `Visual balance:\n${s.visualBalance}`,
    "",
    `Avoid:\n${s.avoid.map((a) => `- ${a}`).join("\n")}`,
    "",
    `Rules for the team:\n${s.rulesForOtherAgents.map((r) => `- ${r}`).join("\n")}`,
  ].join("\n");
}

export function renderFurniture(f: FurniturePlan): string {
  const items = f.items
    .map((it) =>
      [
        `Item:\n${it.item}`,
        `Recommended size:\n${it.recommendedSizeCm.widthMinCm}-${it.recommendedSizeCm.widthMaxCm} cm`,
        `Material:\n${it.material}`,
        `Color:\n${it.color}`,
        `Style:\n${it.style}`,
        `Budget:\n${it.budget.currency} ${it.budget.min}-${it.budget.max}`,
        `Reason:\n${it.reason}`,
        it.alternative ? `Alternative:\n${it.alternative.item} (${it.alternative.budget.currency} ${it.alternative.budget.min}-${it.alternative.budget.max}) — ${it.alternative.whyDifferent}` : "Alternative:\n(none)",
      ].join("\n"),
    )
    .join("\n\n---\n\n");
  return `${items}\n\nTotal estimate: ${f.totalEstimate.currency} ${f.totalEstimate.min}-${f.totalEstimate.max}`;
}

export function renderMaterials(m: MaterialPalette): string {
  return [
    "Material Palette",
    "",
    m.surfaces
      .map(
        (s) =>
          `- ${s.surface}: ${s.material} (${s.finish}, ${s.color}) | durability ${s.durability} | ${s.maintenance} | ${s.estCost.currency} ${s.estCost.min}-${s.estCost.max}`,
      )
      .join("\n"),
    "",
    `Summary: ${m.paletteSummary}`,
  ].join("\n");
}

export function renderLighting(l: LightingPlan): string {
  return [
    "Lighting Plan",
    "",
    `Ambient:\n${l.ambient}`,
    `Task:\n${l.task}`,
    `Accent:\n${l.accent}`,
    `Decorative:\n${l.decorative}`,
    "",
    `Color temperature:\n${l.colorTemperature.min}K-${l.colorTemperature.max}K (${l.colorTemperature.notes})`,
    "",
    `Recommended fixtures:\n${l.fixtures.map((f) => `- ${f.name} x${f.quantity} [${f.layer}] @ ${f.placement} (${f.colorTempK.min}-${f.colorTempK.max}K${f.dimmable ? ", dimmable" : ""})`).join("\n")}`,
    "",
    `Scenes:\n${l.scenes.map((s) => `- ${s.name}: ${s.description} [${s.activeLayers.join(", ")}]`).join("\n")}`,
  ].join("\n");
}

export function renderBudget(b: BudgetEstimate): string {
  return [
    "Budget",
    "",
    b.categoryTotals.map((c) => `${c.category}: ${b.currency} ${c.amount}`).join("\n"),
    "",
    `Estimated total:\n${b.currency} ${b.estimatedTotal}`,
    `Budget:\n${b.currency} ${b.userBudget}`,
    `Remaining:\n${b.currency} ${b.remaining}${b.overBudget ? "  (OVER BUDGET)" : ""}`,
    "",
    `Analysis:\n${b.overrunAnalysis}`,
    b.savingOpportunities.length
      ? `\nSaving opportunities:\n${b.savingOpportunities.map((s) => `- ${s.area}: ${s.action} (~${b.currency} ${s.estSaving}, concept impact ${s.conceptImpact})`).join("\n")}`
      : "",
    `\nTiers:\n${b.tiers.map((t) => `- ${t.name}: ${b.currency} ${t.total} — ${t.description}`).join("\n")}`,
  ].join("\n");
}

export function renderReview(r: DesignReview): string {
  return [
    "Design Review",
    "",
    `Functionality: ${r.scores.functionality}/10`,
    `Style consistency: ${r.scores.styleConsistency}/10`,
    `Budget: ${r.scores.budget}/10`,
    `Spatial efficiency: ${r.scores.spatialEfficiency}/10`,
    `Lighting: ${r.scores.lighting}/10`,
    `Overall: ${r.overall}/10`,
    "",
    `Verdict: ${r.verdict.toUpperCase()}`,
    "",
    r.issues.length
      ? `Issues:\n${r.issues.map((i, n) => `${n + 1}. [${i.severity}/${i.category}] ${i.description}\n   -> ${i.recommendedRevision} (affects: ${i.affects.join(", ")})`).join("\n")}`
      : "Issues: none",
    r.missingInformation.length ? `\nMissing information:\n${r.missingInformation.map((m) => `- ${m}`).join("\n")}` : "",
    `\nSummary:\n${r.summary}`,
  ].join("\n");
}

export function renderVisualization(v: VisualizationSpec): string {
  return [
    "Visualization Specification",
    "",
    `Scene:\n${v.sceneSummary}`,
    "",
    `Camera angles:\n${v.cameraAngles.map((c) => `- ${c.name}: ${c.description} (h ${c.heightCm} cm${c.lensMm ? `, ${c.lensMm}mm` : ""})`).join("\n")}`,
    "",
    `Lighting conditions:\n${v.lightingConditions.map((l) => `- ${l.scene}: ${l.description}`).join("\n")}`,
    "",
    `Material callouts:\n${v.materialCallouts.map((m) => `- ${m.surface}: ${m.material} (${m.finish})`).join("\n")}`,
    "",
    `Before:\n${v.beforeAfter.before}`,
    `After:\n${v.beforeAfter.after}`,
    "",
    `Render prompts:\n${v.renderPrompts.map((p) => `- [${p.view}] ${p.prompt}`).join("\n\n")}`,
    "",
    `Notes for engine:\n${v.notesForEngine}`,
  ].join("\n");
}

export function renderFinalSpec(spec: FinalDesignSpecification): string {
  return [
    `FINAL DESIGN SPECIFICATION  (v${spec.specVersion})`,
    `Project: ${spec.project.title} [${spec.project.id}] — design version ${spec.project.designVersion}`,
    `Room: ${spec.room.type}`,
    `Dimensions: ${spec.dimensions ? `${spec.dimensions.lengthM}m x ${spec.dimensions.widthM}m${spec.dimensions.heightM ? ` x ${spec.dimensions.heightM}m` : ""}` : "undecided"}`,
    `Style: ${spec.designStyle.primary}${spec.designStyle.secondary ? ` + ${spec.designStyle.secondary}` : ""}`,
    `Palette: ${spec.colorPalette.map((c) => c.name).join(", ") || "undecided"}`,
    "",
    `Design rationale:\n${spec.designRationale}`,
    "",
    `Approved decisions: ${spec.approvedDecisions.length}`,
    ...spec.approvedDecisions.map((d) => `  • [${d.topic}] ${d.description} (${AGENT_LABELS[d.madeBy as keyof typeof AGENT_LABELS] ?? d.madeBy})`),
    spec.openItems.length ? `\nOpen items:\n${spec.openItems.map((o) => `  • ${o}`).join("\n")}` : "\nOpen items: none",
    "",
    "-> This object is ready to hand to the 3D engine.",
  ].join("\n");
}

export function renderConversationLog(memory: ProjectMemory): string {
  return memory.conversations
    .map(
      (e) =>
        `[${e.at.slice(11, 19)}] ${AGENT_LABELS[e.from]} -> ${AGENT_LABELS[e.to]}  (${e.kind}/${e.task})\n    ${e.summary}`,
    )
    .join("\n");
}
