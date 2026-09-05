import { PRIORITY_ORDER, type PriorityCategory } from "../domain.js";

export interface ConflictSide {
  agent: string;
  position: string;
  category: PriorityCategory;
}

export interface ConflictRuling {
  winner: ConflictSide;
  loser: ConflictSide;
  tie: boolean;
  rationale: string;
}

/**
 * Deterministic conflict resolution by the priority hierarchy (section 15).
 * The Design Director uses this as a backstop / sanity check on its own reasoning.
 */
export function rulePriority(a: ConflictSide, b: ConflictSide): ConflictRuling {
  const ra = PRIORITY_ORDER[a.category];
  const rb = PRIORITY_ORDER[b.category];
  if (ra === rb) {
    return {
      winner: a,
      loser: b,
      tie: true,
      rationale: `Both sides argue from "${a.category}" (priority ${ra}). The Director must find a compromise that satisfies both.`,
    };
  }
  const [winner, loser] = ra < rb ? [a, b] : [b, a];
  return {
    winner,
    loser,
    tie: false,
    rationale: `"${winner.category}" (priority ${PRIORITY_ORDER[winner.category]}) outranks "${loser.category}" (priority ${PRIORITY_ORDER[loser.category]}), so ${winner.agent}'s position stands and ${loser.agent} must adapt.`,
  };
}

export function comparePriority(a: PriorityCategory, b: PriorityCategory): number {
  return PRIORITY_ORDER[a] - PRIORITY_ORDER[b];
}

/** Highest-priority (lowest number) category in a list. */
export function topPriority(categories: PriorityCategory[]): PriorityCategory | undefined {
  return [...categories].sort(comparePriority)[0];
}
