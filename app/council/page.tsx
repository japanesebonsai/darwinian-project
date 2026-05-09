"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCouncilStore } from "@/lib/store";
import { CouncilChat } from "@/components/CouncilChat";
import { WinnerCard } from "@/components/WinnerCard";
import { Button } from "@/components/ui/button";
import type { AgentOutput, ArbiterResult, RoundData } from "@/lib/types";

export default function CouncilPage() {
  const router = useRouter();
  const store = useCouncilStore();
  const runningRound = useRef<number | null>(null);

  useEffect(() => {
    if (!store.userInput.problem) {
      router.replace("/");
      return;
    }

    if (store.status === "idle" && runningRound.current !== store.currentRound) {
      if (Object.keys(store.agentProfiles).length === 0) {
        generateAndRun();
      } else {
        runCouncilRound();
      }
    }

    // Auto-progress to next round
    const isGameOver =
      store.rounds.some((r) => r.arbiterResult.winner !== null) ||
      store.currentRound > 4;
    if (store.status === "done" && !isGameOver) {
      store.incrementRound();
      store.setStatus("idle");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.status, store.currentRound, store.userInput, store.rounds]);

  const generateAndRun = async () => {
    runningRound.current = store.currentRound;
    store.setStatus("generating");

    try {
      const genRes = await fetch("/api/council/generate-agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userInput: store.userInput }),
      });

      if (!genRes.ok) throw new Error("Failed to generate agents");
      const { profiles } = await genRes.json();
      store.setAgentProfiles(profiles);

      await runCouncilRound(profiles);
    } catch (err) {
      console.error(err);
      store.setStatus("done");
    }
  };

  const runCouncilRound = async (customProfiles?: Record<string, any>) => {
    runningRound.current = store.currentRound;
    store.setStatus("running");
    store.clearPendingAgents();
    const profilesToUse = customProfiles || store.agentProfiles;

    try {
      const roundHistory = store.rounds.map((r) => {
        const pitches = r.agents.reduce((acc, a) => {
          acc[a.name] = a.pitch;
          return acc;
        }, {} as Record<string, string>);
        return { round: r.round, pitches };
      });

      // ─── Stream agents one-at-a-time ───
      const roundRes = await fetch("/api/council/round", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userInput: store.userInput,
          agentProfiles: profilesToUse,
          roundHistory,
          currentRound: store.currentRound,
        }),
      });

      if (!roundRes.ok || !roundRes.body) throw new Error("Agent round failed");

      const reader = roundRes.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      const agents: AgentOutput[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? ""; // keep incomplete last line in buffer

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const agent = JSON.parse(line) as AgentOutput;
            agents.push(agent);
            store.addPendingAgent(agent);
          } catch {
            console.warn("[round] Failed to parse streamed line:", line);
          }
        }
      }

      // Process any remaining buffer
      if (buffer.trim()) {
        try {
          const agent = JSON.parse(buffer) as AgentOutput;
          agents.push(agent);
          store.addPendingAgent(agent);
        } catch {
          console.warn("[round] Failed to parse final buffer:", buffer);
        }
      }

      // ─── Call the Arbiter ───
      const arbRes = await fetch("/api/council/arbiter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentOutputs: agents,
          currentRound: store.currentRound,
          agentNames: Object.keys(profilesToUse),
        }),
      });

      if (!arbRes.ok) {
        const errBody = await arbRes.json().catch(() => ({}));
        console.error("[arbiter] Error response:", errBody);
        throw new Error("Arbiter call failed");
      }
      const arbiterResult = (await arbRes.json()) as ArbiterResult;

      // Commit the full round
      const newRound: RoundData = {
        round: store.currentRound,
        agents,
        arbiterResult,
      };

      store.addRound(newRound);
      store.clearPendingAgents();

      if (arbiterResult.mutatedAgent && arbiterResult.mutationProfile) {
        store.mutateAgent(arbiterResult.mutatedAgent, arbiterResult.mutationProfile);
      }

      if (arbiterResult.winner || store.currentRound >= 4) {
        store.setStatus("done");
      } else {
        store.setStatus("done");
      }
    } catch (err) {
      console.error(err);
      store.clearPendingAgents();
      store.setStatus("done");
    }
  };

  if (!store.userInput.problem) return null;

  const isRunning = store.status === "running";
  const isGenerating = store.status === "generating";
  const isGameOver =
    store.rounds.some((r) => r.arbiterResult.winner !== null) ||
    store.currentRound > 4;
  const winningRound = store.rounds.find((r) => r.arbiterResult.winner !== null);

  return (
    <main className="flex-1 flex flex-col p-4 sm:p-8 w-full max-w-[1600px] mx-auto gap-6 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-blue-900/10 blur-[150px] pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">The Debate Arena</h1>
          <p className="text-zinc-400 text-sm mt-1 max-w-xl">
            <strong>Problem:</strong> {store.userInput.problem}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm font-mono bg-zinc-950 px-4 py-2 rounded-lg border border-zinc-800 shadow-inner">
            ROUND {Math.min(store.currentRound, 4)} / 4
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="w-full flex-1 overflow-y-auto pr-2 pb-16">
        <CouncilChat
          rounds={store.rounds}
          pendingAgents={store.pendingAgents}
          currentRound={store.currentRound}
          isLoading={isRunning}
          isGenerating={isGenerating}
          agentProfiles={store.agentProfiles}
        />

        {/* Winner Card */}
        {winningRound && winningRound.arbiterResult.winner && (
          <div className="w-full max-w-4xl mx-auto mt-8 mb-16">
            <WinnerCard
              winner={winningRound.arbiterResult.winner}
              outputs={winningRound.agents}
              arbiterResult={winningRound.arbiterResult}
              agentProfiles={store.agentProfiles}
            />
            <div className="mt-8 flex justify-center">
              <Button
                variant="outline"
                onClick={() => {
                  store.reset();
                  router.push("/");
                }}
              >
                Start New Session
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
