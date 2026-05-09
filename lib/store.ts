"use client";

import { create } from "zustand";
import type { RoundData, StoreState, UserInput, AgentProfile, AgentOutput } from "./types";

const BLANK_INPUT: UserInput = {
  problem: "",
  audience: "",
  constraint: "",
  vibe: "",
};

export const useCouncilStore = create<StoreState>((set) => ({
  // ─── Initial state ─────────────────────────────────────────────────────────
  userInput: BLANK_INPUT,
  currentRound: 1,
  agentProfiles: {},
  rounds: [],
  pendingAgents: [],
  status: "idle",

  // ─── Actions ───────────────────────────────────────────────────────────────
  setUserInput: (input: UserInput) =>
    set({ userInput: input, status: "idle", currentRound: 1, rounds: [], pendingAgents: [] }),

  setStatus: (s: StoreState["status"]) => set({ status: s }),

  incrementRound: () =>
    set((state) => ({ currentRound: state.currentRound + 1 })),

  addRound: (round: RoundData) =>
    set((state) => ({ rounds: [...state.rounds, round] })),

  addPendingAgent: (agent: AgentOutput) =>
    set((state) => ({ pendingAgents: [...state.pendingAgents, agent] })),

  clearPendingAgents: () => set({ pendingAgents: [] }),

  setAgentProfiles: (profiles) => set({ agentProfiles: profiles }),

  mutateAgent: (agent: string, newProfile: AgentProfile) =>
    set((state) => {
      const newProfiles = { ...state.agentProfiles };
      delete newProfiles[agent];
      newProfiles[newProfile.name] = newProfile;
      return { agentProfiles: newProfiles };
    }),

  reset: () =>
    set({
      userInput: BLANK_INPUT,
      currentRound: 1,
      agentProfiles: {},
      rounds: [],
      pendingAgents: [],
      status: "idle",
    }),
}));
