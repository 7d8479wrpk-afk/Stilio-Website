# Stilio — AI Interior Design Agent System

A team of specialized AI agents that collaborate on interior design projects. The
user talks to **one** agent — the **Design Director** — which coordinates the
specialists behind the scenes over a shared project memory, using structured
(schema-validated) messages.

> This phase is the **agent architecture only**. No website UI, no 3D engine. The
> workflow runs and is tested entirely with text/JSON outputs. The final output is
> a single structured `FinalDesignSpecification` object designed to be handed to a
> 3D system later.

---

## The agents

| Agent | Responsibility | Output schema |
|---|---|---|
| **Design Director** | Owns the vision. Runs intake, compiles the brief, delegates, combines results, detects & resolves conflicts, presents the design. | `director_intake`, `brief_compilation`, `director_synthesis`, `director_resolution`, `director_presentation` |
| **Space Planner** | Functional layouts, circulation, clearances, furniture dimensions, 2–3 alternatives. Function before appearance. | `layout_proposal` |
| **Style Director** | Visual identity: style, palette, materials, textures, shapes, and the **rules other agents must follow**. | `style_direction` |
| **Furniture Curator** | Furniture selection: types, size ranges, materials, quantities, budget, alternatives. Respects the layout's dimensions. | `furniture_plan` |
| **Material Specialist** | Materials & finishes for every surface, weighing durability / maintenance / cost / compatibility. | `material_palette` |
| **Lighting Designer** | Four lighting layers + five scenes (day / evening / night / entertaining / relaxing), colour temperature, fixtures. | `lighting_plan` |
| **Budget Manager** | Cost estimate, categories, tiers, and — when over budget — the highest-impact, concept-preserving reductions. | `budget_estimate` |
| **Design Critic** | Reviews the whole proposal, scores it, lists issues with severities and revisions, gives a verdict. | `design_review` |
| **Visualizer** | Turns the **approved** design into scene specs, camera angles, material callouts and render prompts. Invents nothing. | `visualization_spec` |

## Workflow (section 12 of the brief)

```
USER → DESIGN DIRECTOR → brief
     → SPACE PLANNER + STYLE DIRECTOR
     → FURNITURE CURATOR + MATERIAL SPECIALIST + LIGHTING DESIGNER
     → BUDGET MANAGER
     → DESIGN DIRECTOR  (synthesis, conflict resolution, revision requests)
     → DESIGN CRITIC
     → DESIGN DIRECTOR  (resolve review — may loop back for revisions)
     → version snapshot
     → VISUALIZER
     → FINAL DESIGN SPECIFICATION + presentation to the user
```

The Design Director can repeat parts of the workflow when revisions are required
(`maxRevisionRounds`, default 1).

## Conflict priority (section 15)

When agents disagree the Director resolves by this hierarchy (highest first):

1. Safety / building constraints
2. Physical feasibility
3. User requirements
4. Functionality
5. Budget
6. Style
7. Aesthetic preference

`src/workflow/priority.ts` implements this as a deterministic backstop.

## Shared project memory (sections 10 & 16)

`ProjectMemory` holds client preferences, room info, dimensions, architectural
constraints, style, layout, furniture, materials, lighting, budget, the **decision
ledger** (proposed / approved / rejected — approved decisions are never lost or
silently overwritten; superseding keeps the old record and links it), **design
versions** (snapshot + restore), and the **structured agent conversation log**.

Persisted as one JSON file per project under `./projects/`.

---

## Running it

```bash
npm install
npm run typecheck
npm test           # 14 tests, mock LLM, no network

npm run example    # full walk-through of the section-13 brief
npm run chat       # talk to the Design Director interactively
```

### LLM backend

`src/llm/` defines an `LLMClient` interface with two implementations:

- **`AnthropicLLMClient`** — real Claude (`claude-opus-5` by default). Structured
  output via forced single-tool use + Zod validation, with an automatic
  validation-repair retry.
- **`MockLLMClient`** — deterministic, offline. Seeded with internally consistent
  fixtures for the canonical example (a real budget overrun, a Director conflict
  resolution, and a Critic "revise" verdict), plus a schema-driven synthesizer so
  arbitrary briefs still run end to end.

Selection (`STILIO_LLM`): `auto` (default — Claude if `ANTHROPIC_API_KEY` is set,
else mock), `anthropic`, or `mock`. See `.env.example`.

```ts
import { createLLMClient, DesignWorkflow } from "./src/index.js";

const llm = createLLMClient();               // auto
const workflow = new DesignWorkflow(llm, { answers: { /* … */ } });
const result = await workflow.run(
  "I have a 5m x 4m living room. Modern and warm. Large north window. Budget $10,000.",
);

if (result.outcome === "awaiting_user") {
  console.log(result.pending);                // Director's questions
} else {
  console.log(result.presentation.headline);
  console.log(result.finalSpec);              // → ready for the 3D engine
}
```

## Layout

```
src/
  domain.ts              shared vocabulary (rooms, walls, priority categories, agent ids)
  llm/                   LLMClient interface, Anthropic + mock backends, schema→JSON-schema
  memory/                ProjectMemory (schema, class, file store)
  messaging/             structured AgentTask / AgentResult envelopes
  agents/
    schemas.ts           every agent's Zod output schema
    base-agent.ts        shared run loop, validation, conflict/assumption extraction, logging
    design-director.ts   the 5 Director steps
    <specialist>.ts      one file per specialist
  workflow/
    orchestrator.ts      the DesignWorkflow engine
    priority.ts          deterministic conflict resolution
    events.ts            progress events
  spec/                  FinalDesignSpecification schema + deterministic assembler
  render/text.ts         human-readable views generated from the JSON
  mock/fixtures.ts       deterministic example fixtures
scripts/                 run-example.ts, chat.ts
test/                    workflow + memory/priority tests
```

## Design rules every agent follows

1. One clearly defined responsibility.
2. Receives structured project context.
3. Respects other agents' decisions; never overwrites an approved one.
4. Explains conflicts and cites the priority category.
5. Provides alternatives when a recommendation is impossible.
6. Always considers budget and physical dimensions.
7. Separates assumptions from confirmed information.
8. Asks for clarification when critical information is missing.
