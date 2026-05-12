/** Curated sample problems for quick testing of the council flow. */
export interface FrequentProblem {
  id: string;
  title: string;
  /** Shown in preview; combined into the `problem` field sent to the council. */
  description: string;
  audience: string;
  constraint: string;
  vibe?: string;
}

/** Full problem text passed to `setUserInput` — built from title + description. */
export function problemTextFromFrequent(p: FrequentProblem): string {
  const body = p.description.trim();
  if (!body) return p.title.trim();
  return `${p.title.trim()}\n\n${body}`;
}

export const FREQUENT_PROBLEMS: FrequentProblem[] = [
  {
    id: "habit-app",
    title: "Sticky habit app for busy parents",
    description:
      "Design a mobile product that helps working parents build one small daily habit (sleep, movement, or calm) without guilt trips, streak anxiety, or heavy onboarding.",
    audience: "Working parents, 28–45, iOS and Android, limited daily attention",
    constraint: "Ship an MVP in 6 weeks; no medical claims; freemium with ethical upsell only",
    vibe: "Warm, human, slightly playful",
  },
  {
    id: "local-events",
    title: "Discover hyper-local weekend events",
    description:
      "People miss small concerts, markets, and workshops because information is scattered across Instagram, posters, and newsletters. Propose a discovery experience that feels trustworthy and low-noise.",
    audience: "Urban renters 22–35 who already use maps and calendar apps",
    constraint: "Minimal moderation budget; must work without a large editorial team at launch",
  },
  {
    id: "async-standup",
    title: "Replace daily standups for remote teams",
    description:
      "Async standups are either ignored or become walls of text. Define a lightweight ritual that keeps alignment without meetings, suitable for a 12-person product team across time zones.",
    audience: "Remote-first software teams using Slack or Discord",
    constraint: "No new mandatory meetings; integrate with existing chat; respect deep-work blocks",
    vibe: "Calm, professional, zero hustle-culture",
  },
  {
    id: "climate-home",
    title: "Home energy coach for renters",
    description:
      "Renters cannot install solar or major HVAC upgrades but still want lower bills and lower carbon. Outline a digital coach that suggests realistic actions and tracks impact honestly.",
    audience: "Renters in temperate climates with smart meters or monthly utility PDFs",
    constraint: "No hardware sales in v1; privacy-first; estimates must disclose uncertainty",
  },
];
