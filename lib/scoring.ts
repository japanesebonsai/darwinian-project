import type { AgentOutput } from "./types";

/**
 * Composite score formula (excludes self-scores):
 *   composite = (avg_feasibility_from_others × 0.4) + (avg_impact_from_others × 0.6)
 */
export function computeComposites(
  agentOutputs: AgentOutput[]
): Record<string, number> {
  const composites: Record<string, number> = {};
  const agentNames = agentOutputs.map((o) => o.name);

  for (const target of agentNames) {
    let totalFeasibility = 0;
    let totalImpact = 0;
    let count = 0;

    for (const output of agentOutputs) {
      // Skip self-scores
      if (output.name === target) continue;

      const score = output.scores[target];
      if (!score) continue;

      totalFeasibility += score.feasibility;
      totalImpact += score.impact;
      count++;
    }

    if (count === 0) {
      composites[target] = 0;
    } else {
      const avgFeasibility = totalFeasibility / count;
      const avgImpact = totalImpact / count;
      composites[target] = parseFloat(
        ((avgFeasibility * 0.4) + (avgImpact * 0.6)).toFixed(2)
      );
    }
  }

  return composites;
}

/**
 * Returns the agent name with the lowest composite score.
 */
export function lowestComposite(
  composites: Record<string, number>
): string {
  return Object.entries(composites).reduce(
    (min, [name, score]) => (score < min[1] ? [name, score] : min),
    ["", Infinity] as [string, number]
  )[0];
}

/**
 * Tally final votes. Returns the majority winner agent name, or null if tied.
 * If tied, the caller should fall back to highest composite.
 */
export function tallyFinalVotes(
  agentOutputs: AgentOutput[]
): string | null {
  const tally: Record<string, number> = {};

  for (const output of agentOutputs) {
    if (!output.finalVote) continue;
    const voted = output.finalVote.agent;
    tally[voted] = (tally[voted] ?? 0) + 1;
  }

  const entries = Object.entries(tally);
  if (entries.length === 0) return null;

  const maxVotes = Math.max(...entries.map(([, v]) => v));
  const winners = entries.filter(([, v]) => v === maxVotes);

  if (winners.length === 1) return winners[0][0];
  return null; // tie — caller uses tiebreaker
}
