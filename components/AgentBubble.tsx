import { motion } from "framer-motion";
import { ChevronDown, BrainCircuit } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { AGENT_META } from "@/lib/models";
import type { AgentOutput } from "@/lib/types";

export function AgentBubble({
  output,
  delay = 0,
}: {
  output: AgentOutput;
  delay?: number;
}) {
  const meta = AGENT_META[output.name];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="flex flex-col gap-3 p-5 rounded-xl bg-zinc-900/50 border border-zinc-800/50 shadow-sm relative overflow-hidden group"
    >
      {/* Colored left accent line */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 opacity-80"
        style={{ backgroundColor: meta.color }}
      />

      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold text-white shadow-inner"
          style={{ backgroundColor: meta.color }}
        >
          {meta.initial}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
            {meta.label}
            <span className="text-base">{meta.emoji}</span>
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
          "{output.critique}"
        </div>
      )}
    </motion.div>
  );
}
