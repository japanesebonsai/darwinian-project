import { AgentBubble } from "./AgentBubble";
import { motion } from "framer-motion";
import { Zap, BarChart3, Loader2 } from "lucide-react";
import type { RoundData, AgentProfile, AgentOutput } from "@/lib/types";
import { useEffect, useRef } from "react";

export function CouncilChat({
  rounds,
  pendingAgents,
  currentRound,
  isLoading,
  isGenerating,
  agentProfiles,
}: {
  rounds: RoundData[];
  pendingAgents: AgentOutput[];
  currentRound: number;
  isLoading: boolean;
  isGenerating: boolean;
  agentProfiles: Record<string, AgentProfile>;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [rounds, pendingAgents, isLoading, isGenerating]);

  return (
    <div className="flex flex-col gap-4 w-full max-w-4xl mx-auto">
      {/* Generating agents indicator */}
      {isGenerating && rounds.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-5 rounded-xl bg-indigo-950/30 border border-indigo-800/40"
        >
          <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
          <div>
            <p className="text-sm font-medium text-indigo-300">Assembling the Council...</p>
            <p className="text-xs text-indigo-400/70 mt-0.5">Generating unique debater personalities for your problem</p>
          </div>
        </motion.div>
      )}

      {/* Completed rounds */}
      {rounds.map((round) => {
        const arbiter = round.arbiterResult;
        return (
          <div key={`round-${round.round}`} className="w-full flex flex-col gap-4">
            {/* Round header */}
            <div className="w-full flex items-center justify-center py-2">
              <span className="text-xs font-mono text-zinc-500 bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
                Round {round.round}
              </span>
            </div>

            {/* Agent responses */}
            {round.agents.map((output, i) => (
              <AgentBubble
                key={`bubble-${round.round}-${output.name}`}
                output={output}
                profile={agentProfiles[output.name]}
                delay={0}
              />
            ))}

            {/* ── Inline Scores ── */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full rounded-xl bg-zinc-900/60 border border-zinc-800/50 p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-4 h-4 text-zinc-400" />
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Round {round.round} Standings
                </span>
              </div>
              <div className="space-y-2">
                {Object.entries(arbiter.composites)
                  .sort((a, b) => b[1] - a[1])
                  .map(([name, score]) => {
                    const p = agentProfiles[name];
                    const maxScore = Math.max(...Object.values(arbiter.composites), 10);
                    const pct = (score / maxScore) * 100;
                    return (
                      <div key={name} className="flex items-center gap-3 text-sm">
                        <div className="w-24 text-zinc-400 text-xs font-medium truncate flex items-center gap-1">
                          <span>{p?.emoji ?? "🤖"}</span>
                          {(p?.name ?? name).toUpperCase()}
                        </div>
                        <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: p?.color ?? "#6b7280" }}
                          />
                        </div>
                        <div className="w-8 text-right font-mono text-xs text-zinc-300">
                          {score.toFixed(1)}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </motion.div>

            {/* ── Inline Mutation Dialogue ── */}
            {arbiter.mutatedAgent && arbiter.mutationProfile && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full rounded-xl bg-red-950/20 border border-red-900/30 p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-red-400 fill-red-400" />
                  <span className="text-xs font-bold text-red-300 uppercase tracking-wider">
                    Arbiter Mutation
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-950/40 border border-red-900/30">
                    <span>{agentProfiles[arbiter.mutatedAgent]?.emoji ?? "❌"}</span>
                    <span className="text-red-300 font-medium line-through">
                      {(agentProfiles[arbiter.mutatedAgent]?.name ?? arbiter.mutatedAgent).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-zinc-600">→</span>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-900/30">
                    <span>{arbiter.mutationProfile.emoji}</span>
                    <span className="text-emerald-300 font-medium">
                      {arbiter.mutationProfile.name.toUpperCase()}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-zinc-500 mt-2 italic pl-1">
                  Lowest scorer replaced with a new challenger.
                </p>
              </motion.div>
            )}
          </div>
        );
      })}

      {/* ── In-Progress Round (streaming agents) ── */}
      {pendingAgents.length > 0 && (
        <div className="w-full flex flex-col gap-4">
          <div className="w-full flex items-center justify-center py-2">
            <span className="text-xs font-mono text-zinc-500 bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
              Round {currentRound}
            </span>
          </div>
          {pendingAgents.map((output, i) => (
            <AgentBubble
              key={`pending-${currentRound}-${output.name}`}
              output={output}
              profile={agentProfiles[output.name]}
              delay={0.1}
            />
          ))}
          {/* Typing indicator for next agent */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3 p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/30"
            >
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <span className="text-xs text-zinc-500">
                {pendingAgents.length < 5
                  ? `Agent ${pendingAgents.length + 1} of 5 is thinking...`
                  : "Arbiter is evaluating..."}
              </span>
            </motion.div>
          )}
        </div>
      )}

      {/* Loading state when no pending agents yet */}
      {isLoading && pendingAgents.length === 0 && (
        <div className="w-full flex flex-col gap-4">
          <div className="w-full flex items-center justify-center py-2">
            <span className="text-xs font-mono text-zinc-500 bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800 animate-pulse">
              Round {currentRound} — Preparing...
            </span>
          </div>
        </div>
      )}

      <div ref={bottomRef} className="h-4" />
    </div>
  );
}
