import { motion } from "framer-motion";
import { AGENT_META } from "@/lib/models";
import type { AgentName } from "@/lib/types";

export function VoteBar({ composites }: { composites: Record<AgentName, number> }) {
  // Find the max score to calculate percentage widths
  const maxScore = Math.max(...Object.values(composites), 10); // Minimum denominator of 10

  return (
    <div className="w-full space-y-3 p-4 rounded-xl bg-zinc-900 border border-zinc-800">
      <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">
        Current Standings (Arbiter Composite)
      </h3>
      
      {(Object.entries(composites) as [AgentName, number][])
        .sort((a, b) => b[1] - a[1])
        .map(([name, score], i) => {
          const meta = AGENT_META[name];
          const widthPct = (score / maxScore) * 100;
          
          return (
            <div key={name} className="flex items-center gap-3 text-sm">
              <div className="w-20 text-zinc-400 text-xs font-medium truncate flex items-center gap-1">
                <span>{meta.emoji}</span>
                {meta.label}
              </div>
              
              <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${widthPct}%` }}
                  transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: meta.color }}
                />
              </div>
              
              <div className="w-8 text-right font-mono text-xs text-zinc-300">
                {score.toFixed(1)}
              </div>
            </div>
          );
        })}
    </div>
  );
}
