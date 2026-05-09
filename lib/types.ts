export type AgentName = string;

export interface AgentProfile {
  name: string;
  emoji: string;
  color: string;
  initial: string;
  prompt: string;
}

// ─── Raw parsed output from one agent per round ───────────────────────────────
export interface AgentOutput {
  name: AgentName;
  thought: string;
  pitch: string;
  scores: Partial<Record<AgentName, { feasibility: number; impact: number }>>;
  critique: string;
  finalVote?: { agent: AgentName; reason: string };
  raw: string; // preserved for debugging
}

// ─── What the Arbiter returns (sanitised, never raw) ─────────────────────────
export interface ArbiterResult {
  round: number;
  composites: Record<AgentName, number>;
  mutatedAgent: string | null;
  mutationProfile: AgentProfile | null;
  consensus: boolean;
  winner: string | null;
  tiebreakerUsed: boolean;
  tiebreakerReason: string | null;
}

// ─── One full round stored in state ──────────────────────────────────────────
export interface RoundData {
  round: number;
  agents: AgentOutput[];
  arbiterResult: ArbiterResult;
}

// ─── User input fields ────────────────────────────────────────────────────────
export interface UserInput {
  problem: string;
  audience: string;
  constraint: string;
  vibe?: string;
}

// ─── Zustand store shape ──────────────────────────────────────────────────────
export interface StoreState {
  userInput: UserInput;
  currentRound: number; // 1–4
  agentProfiles: Record<string, AgentProfile>;
  rounds: RoundData[];
  pendingAgents: AgentOutput[];
  status: "idle" | "generating" | "running" | "done";
  // actions
  setUserInput: (input: UserInput) => void;
  setStatus: (s: StoreState["status"]) => void;
  incrementRound: () => void;
  addRound: (round: RoundData) => void;
  addPendingAgent: (agent: AgentOutput) => void;
  clearPendingAgents: () => void;
  setAgentProfiles: (profiles: Record<string, AgentProfile>) => void;
  mutateAgent: (agent: string, newProfile: AgentProfile) => void;
  reset: () => void;
}
