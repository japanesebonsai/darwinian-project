import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import type { AgentOutput, ArbiterResult, AgentProfile } from "@/lib/types";

export function WinnerCard({
  winner,
  outputs,
  arbiterResult,
  agentProfiles,
}: {
  winner: string;
  outputs: AgentOutput[];
  arbiterResult: ArbiterResult;
  agentProfiles: Record<string, AgentProfile>;
}) {
  const profile = agentProfiles[winner];
  const color = profile?.color ?? "#6b7280";
  const label = profile?.name?.toUpperCase() ?? winner.toUpperCase();
  const emoji = profile?.emoji ?? "🤖";
  const winningOutput = outputs.find((o) => o.name === winner);

  if (!winningOutput) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
      className="w-full relative overflow-hidden rounded-2xl border bg-zinc-950 shadow-2xl"
      style={{ borderColor: `${color}40` }}
    >
      {/* Background glow */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 blur-[100px] opacity-20 pointer-events-none"
        style={{ backgroundColor: color }}
      />

      <div className="relative p-8 flex flex-col items-center text-center gap-6">
        <div className="flex flex-col items-center gap-3">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg border-2 border-zinc-900"
            style={{ backgroundColor: color }}
          >
            <Trophy className="w-8 h-8 text-white drop-shadow-md" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Consensus Reached
          </h2>
          <div className="flex items-center gap-2 text-zinc-400">
            Winner: <span className="font-semibold text-white">{label}</span> {emoji}
          </div>
        </div>

        <div className="max-w-2xl text-lg text-zinc-300 leading-relaxed font-medium bg-zinc-900/50 p-6 rounded-xl border border-zinc-800/50">
          {winningOutput.pitch}
        </div>

        {arbiterResult.tiebreakerUsed && (
          <div className="text-xs text-amber-500/80 bg-amber-500/10 px-4 py-2 rounded-full border border-amber-500/20 max-w-xl">
            <strong>Arbiter Tiebreaker:</strong> {arbiterResult.tiebreakerReason}
          </div>
        )}
      </div>
    </motion.div>
  );
}
