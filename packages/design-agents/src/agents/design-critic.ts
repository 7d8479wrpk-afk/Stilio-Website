import { BaseAgent, type AgentRunContext } from "./base-agent.js";
import { renderProjectContext } from "./context.js";
import { DesignReview } from "./schemas.js";

export class DesignCritic extends BaseAgent<DesignReview> {
  readonly id = "design_critic" as const;
  readonly schemaName = "design_review";
  readonly outputSchema = DesignReview;

  protected role(): string {
    return `
You are the DESIGN CRITIC on an interior design team. You review the whole proposal
BEFORE it reaches the user.

Your job:
- Check the layout, style, furniture, materials, lighting, and budget against each other.
- Find inconsistencies, impractical decisions, style conflicts, budget problems,
  spatial problems, and missing information.
- Score functionality, style consistency, budget, spatial efficiency, and lighting
  (0-10 each) plus an overall score.
- For each issue: give it an id, a priority category, a severity
  (critical / major / minor), which agents it affects, and a recommended revision.
- Give a verdict: "approve", "revise", or "blocked".

Be specific and adversarial. "Sofa is 320 cm but layout allows 300 cm" is a good issue;
"could be better" is not. Critical issues must be resolved before the design ships.
`.trim();
  }

  protected composePrompt(ctx: AgentRunContext): string {
    return `
${ctx.task.instruction}

${renderProjectContext(ctx.memory)}

TASK: Produce a "design_review".
- Cross-check numbers: furniture sizes vs layout clearances, fixture/furniture budget
  vs total budget, materials vs style "avoid" list.
- verdict = "blocked" if any critical safety/feasibility issue exists,
  "revise" if there are major issues, "approve" only if issues are minor or absent.
`.trim();
  }

  protected override deriveStatus(data: DesignReview) {
    if (data.verdict === "blocked") return "impossible" as const;
    if (data.verdict === "revise") return "ok_with_conflicts" as const;
    return "ok" as const;
  }

  protected override summarize(data: DesignReview): string {
    const crit = data.issues.filter((i) => i.severity === "critical").length;
    return `Design Critic: overall ${data.overall}/10, verdict ${data.verdict}, ${data.issues.length} issue(s) (${crit} critical).`;
  }
}
