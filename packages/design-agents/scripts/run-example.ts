/**
 * End-to-end walk-through of the agent workflow using the canonical brief from
 * section 13 of the spec. Runs on the mock LLM by default (no API key needed);
 * set STILIO_LLM=anthropic (with ANTHROPIC_API_KEY) to run it against Claude.
 *
 *   npm run example
 */
import { createLLMClient } from "../src/llm/index.js";
import { DesignWorkflow } from "../src/workflow/orchestrator.js";
import { ProjectStore } from "../src/memory/store.js";
import {
  renderBudget,
  renderConversationLog,
  renderFinalSpec,
  renderFurniture,
  renderLayout,
  renderLighting,
  renderMaterials,
  renderReview,
  renderStyle,
  renderVisualization,
} from "../src/render/text.js";

const USER_BRIEF =
  "I have a 5m x 4m living room. I want something modern and warm. I have a large window on the north wall. My budget is $10,000.";

const ANSWERS: Record<string, string> = {
  "How many people normally use the room?": "Usually 3, sometimes 5 when friends come over.",
  "Do you need a TV, and wall-mounted or on a unit?": "Yes, wall-mounted.",
  "Do you already own furniture that must stay?": "No, starting fresh.",
  "Are there children or pets?": "No.",
  "Sofa, sectional, or both?": "A sofa is fine; I'd like an extra armchair for reading.",
};

function hr(title: string): void {
  console.log(`\n${"=".repeat(72)}\n${title}\n${"=".repeat(72)}`);
}

async function main(): Promise<void> {
  const llm = createLLMClient();
  console.log(`LLM backend: ${llm.backend} (${llm.model})`);

  const store = new ProjectStore();
  const workflow = new DesignWorkflow(llm, {
    answers: ANSWERS,
    maxRevisionRounds: 1,
    store,
    onEvent: (e) => {
      if (e.type === "phase_start") console.log(`\n▶ ${e.phase}${e.note ? ` (${e.note})` : ""}`);
      else if (e.type === "agent_done") console.log(`  ✓ ${e.agent} [${e.status}] — ${e.summary}`);
      else if (e.type === "conflict") console.log(`  ⚠ conflict ${e.between.join(" ↔ ")}: ${e.topic}`);
      else if (e.type === "revision") console.log(`  ↻ revision → ${e.agent}: ${e.reason}`);
      else if (e.type === "awaiting_user") console.log(`  ⏸ awaiting user: ${e.questions.length} question(s)`);
    },
  });

  const result = await workflow.run(USER_BRIEF);

  hr(`OUTCOME: ${result.outcome}`);
  if (result.outcome === "awaiting_user") {
    console.log("The Design Director needs answers before proceeding:");
    for (const q of result.pending) console.log(`  • ${q}`);
    return;
  }

  const m = result.memory;
  hr("DIRECTOR — INTAKE");
  console.log(result.intake.understoodBrief);

  hr("SPACE PLANNER");
  console.log(renderLayout(m.get("layout")!));
  hr("STYLE DIRECTOR");
  console.log(renderStyle(m.get("styleDirection")!));
  hr("FURNITURE CURATOR");
  console.log(renderFurniture(m.get("furniture")!));
  hr("MATERIAL SPECIALIST");
  console.log(renderMaterials(m.get("materials")!));
  hr("LIGHTING DESIGNER");
  console.log(renderLighting(m.get("lighting")!));
  hr("BUDGET MANAGER");
  console.log(renderBudget(m.get("budget")!));

  hr("DIRECTOR — SYNTHESIS & CONFLICT RESOLUTION");
  console.log(result.synthesis?.narrative);
  for (const c of result.synthesis?.detectedConflicts ?? []) {
    console.log(`\n• [${c.topic}] ${c.description}\n  → ${c.resolution} (in favour of: ${c.resolvedInFavorOf})`);
  }

  hr("DESIGN CRITIC");
  console.log(renderReview(m.get("review")!));

  hr("DIRECTOR — RESOLUTION");
  console.log(result.resolution?.finalNarrative);

  hr("VISUALIZER");
  console.log(renderVisualization(m.get("visualization")!));

  hr("FINAL DESIGN SPECIFICATION (for the 3D engine)");
  console.log(renderFinalSpec(result.finalSpec!));

  hr("DIRECTOR — PRESENTATION TO USER");
  const p = result.presentation!;
  console.log(`${p.headline}\n\n${p.summary}\n`);
  console.log("Highlights:");
  for (const h of p.highlights) console.log(`  • ${h}`);
  console.log("\nTrade-offs made:");
  for (const t of p.tradeoffsMade) console.log(`  • ${t}`);
  console.log("\nNext steps:");
  for (const n of p.nextSteps) console.log(`  • ${n}`);

  hr("PROJECT VERSIONS");
  for (const v of m.versions) console.log(`  v${v.number}: ${v.label} — ${v.reason}`);

  hr("AGENT CONVERSATION LOG");
  console.log(renderConversationLog(m));

  hr("SUMMARY");
  console.log(
    `backend=${result.backend}  llm_calls=${result.usage.calls}  ` +
      `tokens_in=${result.usage.inputTokens}  tokens_out=${result.usage.outputTokens}`,
  );
  console.log(`decisions: ${m.decisions.length} (${m.approvedDecisions.length} approved, ${m.rejectedDecisions.length} rejected)`);
  console.log(`project saved to: ./projects/${m.id}.json`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
