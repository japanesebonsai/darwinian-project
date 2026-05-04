import type { AgentName } from "./types";

// ─── Model slug map ───────────────────────────────────────────────────────────
// Swap slugs here ONLY. Do not change any other logic files.
// Check https://openrouter.ai/models?q=free to verify free-tier availability.

export const MODELS: Record<AgentName | "arbiter", string> = {
  axiom:   "meta-llama/llama-4-maverick:free",
  vera:    "mistralai/mistral-small-3.2-24b-instruct:free",
  moros:   "google/gemini-2.0-flash-exp:free",
  pascal:  "qwen/qwen3-14b:free",
  lyra:    "deepseek/deepseek-r1-0528:free",
  arbiter: "deepseek/deepseek-r1-0528:free",
};

// ─── Agent display metadata ───────────────────────────────────────────────────
export const AGENT_META: Record<
  AgentName,
  { label: string; emoji: string; color: string; initial: string }
> = {
  axiom:  { label: "AXIOM",  emoji: "🔭", color: "#7c3aed", initial: "A" },
  vera:   { label: "VERA",   emoji: "⚙️", color: "#059669", initial: "V" },
  moros:  { label: "MOROS",  emoji: "🔪", color: "#d97706", initial: "M" },
  pascal: { label: "PASCAL", emoji: "🔧", color: "#0284c7", initial: "P" },
  lyra:   { label: "LYRA",   emoji: "💜", color: "#e11d48", initial: "L" },
};
