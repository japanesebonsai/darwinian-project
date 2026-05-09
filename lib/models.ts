import type { AgentName } from "./types";

// Swap slugs here ONLY. Do not change any other logic files.
// Check https://openrouter.ai/models?q=free to verify free-tier availability.

const model = "openai/gpt-oss-120b:free"

export const MODELS: Record<AgentName | "arbiter", string> = {
  axiom: model,
  vera: model,
  moros: model,
  pascal: model,
  lyra: model,
  arbiter: model,
};

// Agent display metadata 
export const AGENT_META: Record<
  AgentName,
  { label: string; emoji: string; color: string; initial: string }
> = {
  axiom: { label: "AXIOM", emoji: "🔭", color: "#7c3aed", initial: "A" },
  vera: { label: "VERA", emoji: "⚙️", color: "#059669", initial: "V" },
  moros: { label: "MOROS", emoji: "🔪", color: "#d97706", initial: "M" },
  pascal: { label: "PASCAL", emoji: "🔧", color: "#0284c7", initial: "P" },
  lyra: { label: "LYRA", emoji: "💜", color: "#e11d48", initial: "L" },
};
