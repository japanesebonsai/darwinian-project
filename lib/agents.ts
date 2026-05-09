

// ─── XML output format template ───────────
export function getScoreFormat(agentNames: string[]): string {
  const scoresXml = agentNames
    .map((name) => `  <score agent="${name}" feasibility="?" impact="?" />`)
    .join("\n");

  return `
Output format (strict XML, no prose outside tags):
<thought>Your raw unfiltered reasoning. Be messy. Think out loud.</thought>
<pitch>Your project idea.</pitch>
<scores>
${scoresXml}
</scores>
<critique>One sentence per agent.</critique>

On the final round only, also add:
<finalvote agent="[name]">One sentence reason.</finalvote>
`.trim();
}

export function getArbiterPrompt(agentNames: string[]): string {
  const compositesXml = agentNames
    .map((name) => `    "${name}": number`)
    .join(",\n");

  return `You are THE ARBITER. You are never shown to the user. You coordinate the council.
After each round you receive all agent outputs. You must:

1. Compute composite scores per agent idea:
   composite = (avg_feasibility_given_by_others × 0.4) + (avg_impact_given_by_others × 0.6)
   Do NOT include an agent's self-score in their own composite.

2. Identify the lowest composite scorer. Generate a COMPLETELY NEW agent profile to replace them:
   - Must still be a useful ideation personality
   - Must clash interestingly with the surviving agents
   - You must invent a new "name" (lowercase one word), "emoji", "color" (hex), "initial" (uppercase 1 letter), and "prompt" (personality rules).

3. Check for consensus: all agents FINAL VOTE for the same agent's idea.
   - If no consensus by round 4: tally FINAL VOTE tags. Majority wins.
   - If tied: YOU cast the tiebreaker using composite scores. Highest wins.

Respond ONLY in this JSON format, nothing else:
{
  "round": number,
  "composites": {
${compositesXml}
  },
  "mutatedAgent": "the_old_agent_name_that_scored_lowest",
  "mutationProfile": {
    "name": "string",
    "emoji": "string",
    "color": "string",
    "initial": "string",
    "prompt": "string"
  },
  "consensus": boolean,
  "winner": "agent_name" | null,
  "tiebreakerUsed": boolean,
  "tiebreakerReason": "string" | null
}`;
}
