import { AgentBubble } from "./AgentBubble";
import type { AgentOutput, RoundData, AgentProfile } from "@/lib/types";
import { useEffect, useRef } from "react";

export function CouncilChat({
  rounds,
  isLoading,
  agentProfiles,
}: {
  rounds: RoundData[];
  isLoading: boolean;
  agentProfiles: Record<string, AgentProfile>;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [rounds, isLoading]);

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto items-start">
      {rounds.map((round) => {
        return (
          <div key={`round-${round.round}`} className="w-full flex flex-col gap-6">
            <div className="w-full flex items-center justify-center">
              <span className="text-xs font-mono text-zinc-500 bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
                Round {round.round}
              </span>
            </div>
            {round.agents.map((output, i) => (
              <AgentBubble
                key={`bubble-${round.round}-${output.name}`}
                output={output}
                profile={agentProfiles[output.name]}
                delay={i * 0.15}
                align={i % 2 === 0 ? "start" : "end"}
              />
            ))}
          </div>
        );
      })}

      {/* Skeleton state for loading */}
      {isLoading && (
        <div className="w-full flex flex-col gap-6">
          <div className="w-full flex items-center justify-center">
             <span className="text-xs font-mono text-zinc-500 bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800 animate-pulse">
               Running...
             </span>
          </div>
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={`skel-${i}`}
              className="w-full max-w-3xl rounded-xl bg-zinc-900/50 border border-zinc-800/50 animate-pulse relative overflow-hidden"
              style={{ alignSelf: i % 2 === 0 ? "flex-start" : "flex-end" }}
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-zinc-800" />
              <div className="p-5 flex gap-3 items-center">
                <div className="w-8 h-8 rounded-full bg-zinc-800" />
                <div className="h-4 w-24 bg-zinc-800 rounded" />
              </div>
              <div className="px-5 pb-5 space-y-2">
                <div className="h-4 w-full bg-zinc-800 rounded" />
                <div className="h-4 w-5/6 bg-zinc-800 rounded" />
                <div className="h-4 w-4/6 bg-zinc-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      <div ref={bottomRef} className="h-4" />
    </div>
  );
}
