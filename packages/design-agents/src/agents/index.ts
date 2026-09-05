import type { AgentId } from "../domain.js";
import { BudgetManager } from "./budget-manager.js";
import { DesignCritic } from "./design-critic.js";
import { FurnitureCurator } from "./furniture-curator.js";
import { LightingDesigner } from "./lighting-designer.js";
import { MaterialSpecialist } from "./material-specialist.js";
import { SpacePlanner } from "./space-planner.js";
import { StyleDirector } from "./style-director.js";
import { Visualizer } from "./visualizer.js";
import type { BaseAgent } from "./base-agent.js";

export * from "./schemas.js";
export { BaseAgent } from "./base-agent.js";
export type { AgentRunContext } from "./base-agent.js";
export { DesignDirector } from "./design-director.js";
export { renderProjectContext } from "./context.js";

export { SpacePlanner } from "./space-planner.js";
export { StyleDirector } from "./style-director.js";
export { FurnitureCurator } from "./furniture-curator.js";
export { MaterialSpecialist } from "./material-specialist.js";
export { LightingDesigner } from "./lighting-designer.js";
export { BudgetManager } from "./budget-manager.js";
export { DesignCritic } from "./design-critic.js";
export { Visualizer } from "./visualizer.js";

/** All specialist agents (everything except the Design Director). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SpecialistAgent = BaseAgent<any>;

export function createSpecialistRegistry(): Map<AgentId, SpecialistAgent> {
  const agents: SpecialistAgent[] = [
    new SpacePlanner(),
    new StyleDirector(),
    new FurnitureCurator(),
    new MaterialSpecialist(),
    new LightingDesigner(),
    new BudgetManager(),
    new DesignCritic(),
    new Visualizer(),
  ];

  const map = new Map<AgentId, SpecialistAgent>();
  for (const agent of agents) map.set(agent.id, agent);
  return map;
}
