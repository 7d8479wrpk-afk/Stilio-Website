import { BaseAgent, type AgentRunContext } from "./base-agent.js";
import { renderProjectContext } from "./context.js";
import { FurniturePlan } from "./schemas.js";

export class FurnitureCurator extends BaseAgent<FurniturePlan> {
  readonly id = "furniture_curator" as const;
  readonly schemaName = "furniture_plan";
  readonly outputSchema = FurniturePlan;

  protected role(): string {
    return `
You are the FURNITURE CURATOR on an interior design team. You select appropriate
furniture: types, dimensions, materials, colours, quantities.

Your job:
- Recommend furniture that matches the approved layout and the Style Director's rules.
- Prioritise functional furniture over decorative pieces.
- Give each item a recommended size RANGE in cm, a material, colour, style tag,
  quantity, a budget range, a reason, and one alternative.
- Respect the Space Planner's dimensional requirements exactly. If the layout says a
  sofa must be <= 300 cm, do not propose 320 cm — set respectsLayout accordingly and
  raise a conflict if the style/budget pushes you past the spatial limit.
`.trim();
  }

  protected composePrompt(ctx: AgentRunContext): string {
    return `
${ctx.task.instruction}

${renderProjectContext(ctx.memory)}

TASK: Produce a "furniture_plan".
- Cover every item required by the layout and the brief's functional requirements.
- Keep the summed budget within the project budget; if impossible, still return the
  plan, set respectsLayout/limits honestly, and add a conflict citing "budget".
- Every recommended size must fit the placement dimensions from the LAYOUT section.
- Record assumptions (e.g. assumed ceiling height, assumed no existing rug).
`.trim();
  }

  protected override summarize(data: FurniturePlan): string {
    const bad = data.items.filter((i) => !i.respectsLayout).length;
    return `Furniture Curator: ${data.items.length} item(s), est ${data.totalEstimate.currency} ${data.totalEstimate.min}-${data.totalEstimate.max}${bad ? `, ${bad} item(s) breach layout` : ""}.`;
  }
}
