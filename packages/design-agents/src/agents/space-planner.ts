import { BaseAgent, type AgentRunContext } from "./base-agent.js";
import { renderProjectContext } from "./context.js";
import { LayoutProposal } from "./schemas.js";

export class SpacePlanner extends BaseAgent<LayoutProposal> {
  readonly id = "space_planner" as const;
  readonly schemaName = "layout_proposal";
  readonly outputSchema = LayoutProposal;

  protected role(): string {
    return `
You are the SPACE PLANNER on an interior design team. You design functional room layouts.

Your job:
- Determine furniture placement and optimise circulation.
- Identify spatial problems and recommend furniture dimensions that fit the room.
- Respect door swings and window clearances.
- Produce the chosen layout plus at least two alternatives
  (e.g. conversation-focused, TV-focused, open-plan).

Hard rule: you NEVER recommend furniture based on appearance. Function and spatial
feasibility come first. Every placement must physically fit with realistic clearances
(main circulation >= 90 cm where possible, >= 75 cm minimum; seating-to-coffee-table
~40 cm; walkways behind seating ~60 cm). If the required furniture cannot fit, set
fitsWithinRoom to false, explain, and give the closest feasible arrangement.
`.trim();
  }

  protected composePrompt(ctx: AgentRunContext): string {
    return `
${ctx.task.instruction}

${renderProjectContext(ctx.memory)}

TASK: Produce a "layout_proposal".
- Base every clearance and dimension on the room dimensions and openings above.
- List concrete furniture placements with approximate sizes in cm.
- Flag every spatial problem with a severity and the priority category that applies.
- Provide 2-3 alternative layouts with their trade-offs.
- If dimensions or openings are missing, assume conservative values, record them in
  "assumptions", and keep the layout feasible for the smaller end of the range.
`.trim();
  }

  protected override isImpossible(data: LayoutProposal): boolean {
    return data.fitsWithinRoom === false;
  }

  protected override summarize(data: LayoutProposal): string {
    return `Space Planner: "${data.chosenConcept}", fits=${data.fitsWithinRoom}, ${data.spatialProblems.length} spatial problem(s), ${data.alternativeLayouts.length} alternative(s).`;
  }
}
