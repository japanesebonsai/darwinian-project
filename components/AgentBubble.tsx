import { motion } from "framer-motion";
import { ChevronDown, BrainCircuit } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { AgentOutput, AgentProfile } from "@/lib/types";

export function AgentBubble({
  output,
  profile,
  delay = 0,
  align = "start",
}: {
  output: AgentOutput;
  profile?: AgentProfile;
  delay?: number;
  align?: "start" | "end";
}) {
  // Fallback if profile not provided
  const color = profile?.color ?? "#6b7280";
  const initial = profile?.initial ?? output.name[0]?.toUpperCase() ?? "?";
  const label = profile?.name?.toUpperCase() ?? output.name.toUpperCase();
  const emoji = profile?.emoji ?? "🤖";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={`flex flex-col gap-3 p-5 rounded-xl bg-zinc-900/50 border border-zinc-800/50 shadow-sm relative overflow-hidden group w-full max-w-3xl ${
        align === "end" ? "self-end" : "self-start"
      }`}
    >
      {/* Colored left/right accent line */}
      <div
        className={`absolute top-0 bottom-0 w-1 opacity-80 ${align === "end" ? "right-0" : "left-0"}`}
        style={{ backgroundColor: color }}
      />

      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold text-white shadow-inner"
          style={{ backgroundColor: color }}
        >
          {initial}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
            {label}
            <span className="text-base">{emoji}</span>
          </h3>
        </div>
      </div>

      {/* Pitch */}
      <div className="text-sm text-zinc-300 leading-relaxed pl-11">
        {output.pitch || (
          <span className="text-zinc-500 italic">No pitch provided.</span>
        )}
      </div>

      {/* Thought Panel */}
      <div className="pl-11 mt-2">
        <Collapsible>
          <CollapsibleTrigger className="flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors py-1 group/trigger">
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>Brain Waves</span>
            <ChevronDown className="w-3.5 h-3.5 group-data-[state=open]/trigger:rotate-180 transition-transform" />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <div className="p-3 rounded-md bg-black/40 border border-zinc-800/50 text-xs text-zinc-400 font-mono leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto overflow-x-hidden">
              {output.thought || "No thoughts recorded."}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Critique (Optional, shown if it exists and is interesting) */}
      {output.critique && (
        <div className="pl-11 mt-2 text-xs text-zinc-500 italic border-l-2 border-zinc-800 pl-3">
          &quot;{output.critique}&quot;
        </div>
      )}
    </motion.div>
  );
}
