import type { AgentName, AgentOutput } from "./types";

// ─── Low-level tag extractor ──────────────────────────────────────────────────
export function extractTag(xml: string, tag: string): string {
  // Handle self-closing and content tags, strip CDATA and leading/trailing space
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const m = xml.match(re);
  return m ? m[1].trim() : "";
}

// ─── Extract all <score> attributes ──────────────────────────────────────────
function parseScores(
  xml: string
): Partial<Record<AgentName, { feasibility: number; impact: number }>> {
  const scores: Partial<Record<AgentName, { feasibility: number; impact: number }>> = {};
  const scoresBlock = extractTag(xml, "scores");
  const scoreRe =
    /agent="(\w+)"\s+feasibility="(\d+(?:\.\d+)?)"\s+impact="(\d+(?:\.\d+)?)"/gi;
  let m: RegExpExecArray | null;
  while ((m = scoreRe.exec(scoresBlock)) !== null) {
    const agent = m[1].toLowerCase() as AgentName;
    scores[agent] = {
      feasibility: parseFloat(m[2]),
      impact: parseFloat(m[3]),
    };
  }
  return scores;
}

// ─── Extract <finalvote> ──────────────────────────────────────────────────────
function parseFinalVote(
  xml: string
): { agent: AgentName; reason: string } | undefined {
  // <finalvote agent="lyra">reason text</finalvote>
  const re = /<finalvote\s+agent="(\w+)">([\s\S]*?)<\/finalvote>/i;
  const m = xml.match(re);
  if (!m) return undefined;
  return { agent: m[1].toLowerCase() as AgentName, reason: m[2].trim() };
}

// ─── Main parse entry point ───────────────────────────────────────────────────
export function parseAgentOutput(
  name: AgentName,
  raw: string
): Omit<AgentOutput, "name"> {
  return {
    thought: extractTag(raw, "thought"),
    pitch: extractTag(raw, "pitch"),
    scores: parseScores(raw),
    critique: extractTag(raw, "critique"),
    finalVote: parseFinalVote(raw),
    raw,
  };
}
