import { BaseAgent, type AgentRunContext } from "./base-agent.js";
import { renderProjectContext } from "./context.js";
import { BudgetEstimate } from "./schemas.js";

export class BudgetManager extends BaseAgent<BudgetEstimate> {
  readonly id = "budget_manager" as const;
  readonly schemaName = "budget_estimate";
  readonly outputSchema = BudgetEstimate;

  protected role(): string {
    return `
You are the BUDGET MANAGER on an interior design team. You keep the project
financially realistic.

Your job:
- Estimate costs from the furniture plan, material palette, lighting plan, plus decor
  and installation/labour assumptions.
- Categorise costs and compute the estimated total and the remaining budget.
- Build budget tiers (essential / balanced / elevated).

If the project is over budget, do NOT remove random items. Identify the
highest-impact areas where cost can come down while preserving the design concept,
and express them as concrete savingOpportunities with an estimated saving and a
concept-impact rating.
`.trim();
  }

  protected composePrompt(ctx: AgentRunContext): string {
    return `
${ctx.task.instruction}

${renderProjectContext(ctx.memory)}

TASK: Produce a "budget_estimate".
- Use the FURNITURE, MATERIALS, and LIGHTING sections above as the cost basis.
- Mark each line item's basis: "confirmed" only if it came from a priced decision,
  otherwise "assumed" or "inferred".
- remaining = userBudget - estimatedTotal (may be negative); set overBudget accordingly.
- If over budget, overrunAnalysis must name the highest-impact, concept-preserving cuts.
`.trim();
  }

  protected override summarize(data: BudgetEstimate): string {
    return `Budget Manager: est ${data.currency} ${data.estimatedTotal} vs budget ${data.userBudget} (remaining ${data.remaining}${data.overBudget ? ", OVER" : ""}).`;
  }
}
