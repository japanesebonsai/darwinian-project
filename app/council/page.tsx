"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCouncilStore } from "@/lib/store";
import { CouncilChat } from "@/components/CouncilChat";
import { VoteBar } from "@/components/VoteBar";
import { WinnerCard } from "@/components/WinnerCard";
import { MutationToast } from "@/components/MutationToast";
import { Button } from "@/components/ui/button";
import type { AgentOutput, ArbiterResult, RoundData } from "@/lib/types";

export default function CouncilPage() {
  const router = useRouter();
  const store = useCouncilStore();

  // Prevent double-fires in React Strict Mode
  const runningRound = useRef<number | null>(null);

  // Kick off the round if idle or auto-progress if done
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
    const isGameOver = store.rounds.some((r) => r.arbiterResult.winner !== null) || store.currentRound >= 4;
    if (store.status === "done" && !isGameOver) {
      store.incrementRound();
      store.setStatus("idle");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.status, store.currentRound, store.userInput, store.rounds]);

  const generateAndRun = async () => {
    runningRound.current = store.currentRound;
    store.setStatus("running");
    
    try {
      const genRes = await fetch("/api/council/generate-agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userInput: store.userInput }),
      });
      
      if (!genRes.ok) throw new Error("Failed to generate agents");
      const { profiles } = await genRes.json();
      store.setAgentProfiles(profiles);
      
      // Now run the round
      await runCouncilRound(profiles);
    } catch (err) {
      console.error(err);
      store.setStatus("done");
    }
  };

  const runCouncilRound = async (customProfiles?: Record<string, any>) => {
    runningRound.current = store.currentRound;
    store.setStatus("running");
    const profilesToUse = customProfiles || store.agentProfiles;

    try {
      // 1. Get round history
      const roundHistory = store.rounds.map((r) => {
        const pitches = r.agents.reduce((acc, a) => {
          acc[a.name] = a.pitch;
          return acc;
        }, {} as Record<string, string>);
        return { round: r.round, pitches };
      });

      // 2. Call the 5 agents
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
      
      if (!roundRes.ok) throw new Error("Agent round failed");
      const { agents } = (await roundRes.json()) as { agents: AgentOutput[] };

      // 3. Call the Arbiter
      const arbRes = await fetch("/api/council/arbiter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentOutputs: agents,
          currentRound: store.currentRound,
          agentNames: Object.keys(profilesToUse),
        }),
      });

      if (!arbRes.ok) throw new Error("Arbiter call failed");
      const arbiterResult = (await arbRes.json()) as ArbiterResult;

      // 4. Update state
      const newRound: RoundData = {
        round: store.currentRound,
        agents,
        arbiterResult,
      };

      store.addRound(newRound);

      // 5. Handle mutation — replace the worst agent with a new profile
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
      store.setStatus("done"); // Recover UI state
    }
  };

  if (!store.userInput.problem) return null;

  // Render logic
  const isRunning = store.status === "running";
  const currentRoundData = store.rounds[store.rounds.length - 1];
  
  const showSkeletons = isRunning && !currentRoundData;
  const isGameOver = store.rounds.some((r) => r.arbiterResult.winner !== null) || store.currentRound > 4;
  
  // Find the winning round (usually the last one)
  const winningRound = store.rounds.find((r) => r.arbiterResult.winner !== null);

  return (
    <main className="flex-1 flex flex-col p-4 sm:p-8 w-full max-w-[1600px] mx-auto gap-8 overflow-hidden relative">
      {/* Background blobs */}
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
          isLoading={showSkeletons}
          agentProfiles={store.agentProfiles}
        />
        
        {/* Post-round feedback (VoteBar + Mutations + Winner) */}
        {currentRoundData && !showSkeletons && (
          <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-8 mt-8">
            <div className="w-full">
               <VoteBar
                 composites={currentRoundData.arbiterResult.composites}
                 agentProfiles={store.agentProfiles}
               />
            </div>

            <MutationToast 
              agent={currentRoundData.arbiterResult.mutatedAgent} 
              mutationProfile={currentRoundData.arbiterResult.mutationProfile} 
            />

            {winningRound && winningRound.arbiterResult.winner && (
              <div className="w-full mt-8 mb-16">
                <WinnerCard 
                  winner={winningRound.arbiterResult.winner}
                  outputs={winningRound.agents}
                  arbiterResult={winningRound.arbiterResult}
                  agentProfiles={store.agentProfiles}
                />
                <div className="mt-8 flex justify-center">
                   <Button variant="outline" onClick={() => {
                     store.reset();
                     router.push("/");
                   }}>
                     Start New Session
                   </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

    </main>
  );
}
