/**
 * Talk to the Design Director. It runs intake, asks you the important missing
 * questions, then runs the full specialist workflow and presents the result.
 *
 *   npm run chat
 *
 * Mock backend by default; set STILIO_LLM=anthropic + ANTHROPIC_API_KEY for Claude.
 */
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { createLLMClient } from "../src/llm/index.js";
import { DesignWorkflow } from "../src/workflow/orchestrator.js";
import { ProjectStore } from "../src/memory/store.js";
import { renderFinalSpec } from "../src/render/text.js";

async function main(): Promise<void> {
  const rl = createInterface({ input: stdin, output: stdout });
  const llm = createLLMClient();
  console.log(`\nDesign Director ready (LLM: ${llm.backend}/${llm.model}).`);
  console.log("Describe your room and what you want. Ctrl+C to quit.\n");

  const brief = await rl.question("You: ");

  const workflow = new DesignWorkflow(llm, {
    store: new ProjectStore(),
    onEvent: (e) => {
      if (e.type === "phase_start") stdout.write(`  … ${e.phase}\n`);
      else if (e.type === "conflict") stdout.write(`  ⚠ ${e.between.join(" ↔ ")}: ${e.topic}\n`);
    },
  });

  // First pass — the Director may pause to ask questions.
  let result = await workflow.run(brief);

  if (result.outcome === "awaiting_user") {
    console.log("\nDirector: I need a few things before I bring in the team.\n");
    const answers: Record<string, string> = {};
    for (const q of result.pending) {
      answers[q] = await rl.question(`  ${q}\n  You: `);
    }
    const workflow2 = new DesignWorkflow(llm, { answers, store: new ProjectStore() });
    result = await workflow2.run(brief, result.memory);
  }

  rl.close();

  if (result.outcome !== "finalized") {
    console.log("\nStill blocked:", result.pending);
    return;
  }

  const p = result.presentation!;
  console.log(`\n\nDirector: ${p.headline}\n\n${p.summary}\n`);
  console.log("Highlights:");
  for (const h of p.highlights) console.log(`  • ${h}`);
  console.log("\nTrade-offs:");
  for (const t of p.tradeoffsMade) console.log(`  • ${t}`);
  if (p.openWithUser.length) {
    console.log("\nStill to confirm with you:");
    for (const o of p.openWithUser) console.log(`  • ${o}`);
  }
  console.log(`\n${"-".repeat(60)}`);
  console.log(renderFinalSpec(result.finalSpec!));
  console.log(`\nSaved: ./projects/${result.memory.id}.json`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
