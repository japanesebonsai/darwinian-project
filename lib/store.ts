"use client";

import { create } from "zustand";
import { DEFAULT_PERSONALITIES } from "./agents";
import type { AgentName, RoundData, StoreState, UserInput } from "./types";

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
  agentPersonalities: { ...DEFAULT_PERSONALITIES },
  rounds: [],
  status: "idle",

  // ─── Actions ───────────────────────────────────────────────────────────────
  setUserInput: (input: UserInput) =>
    set({ userInput: input, status: "idle", currentRound: 1, rounds: [] }),

  setStatus: (s: StoreState["status"]) => set({ status: s }),

  incrementRound: () =>
    set((state) => ({ currentRound: state.currentRound + 1 })),

  addRound: (round: RoundData) =>
    set((state) => ({ rounds: [...state.rounds, round] })),

  mutateAgent: (agent: AgentName, prompt: string) =>
    set((state) => ({
      agentPersonalities: {
        ...state.agentPersonalities,
        [agent]: prompt,
      },
    })),

  reset: () =>
    set({
      userInput: BLANK_INPUT,
      currentRound: 1,
      agentPersonalities: { ...DEFAULT_PERSONALITIES },
      rounds: [],
      status: "idle",
    }),
}));
