import { AgentBubble } from "./AgentBubble";
import type { AgentOutput, AgentName } from "@/lib/types";

// Fixed render order to match prompt
const RENDER_ORDER: AgentName[] = ["axiom", "vera", "moros", "pascal", "lyra"];

export function CouncilGrid({
  outputs,
  isLoading,
}: {
  outputs: AgentOutput[];
  isLoading: boolean;
}) {
  // Skeleton state
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 w-full">
        {RENDER_ORDER.map((name, i) => (
          <div
            key={`skel-${name}`}
            className="h-64 rounded-xl bg-zinc-900/50 border border-zinc-800/50 animate-pulse relative overflow-hidden"
          >
             <div className="absolute left-0 top-0 bottom-0 w-1 bg-zinc-800" />
             <div className="p-5 flex gap-3">
               <div className="w-8 h-8 rounded-full bg-zinc-800" />
               <div className="h-6 w-16 bg-zinc-800 rounded mt-1" />
             </div>
             <div className="px-5 space-y-2 mt-4">
               <div className="h-4 w-full bg-zinc-800 rounded" />
               <div className="h-4 w-5/6 bg-zinc-800 rounded" />
               <div className="h-4 w-4/6 bg-zinc-800 rounded" />
             </div>
          </div>
        ))}
      </div>
    );
  }

  // Ensure we sort outputs by our fixed order
  const sortedOutputs = RENDER_ORDER.map((name) =>
    outputs.find((o) => o.name === name)
  ).filter((Boolean) as unknown as (x: any) => x is AgentOutput);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 w-full items-start">
      {sortedOutputs.map((output, i) => (
        <AgentBubble key={output.name} output={output} delay={i * 0.15} />
      ))}
    </div>
  );
}
