import { useEffect } from "react";
import { toast } from "sonner";
import type { AgentProfile } from "@/lib/types";
import { Zap } from "lucide-react";

export function MutationToast({
  agent,
  mutationProfile,
}: {
  agent: string | null;
  mutationProfile: AgentProfile | null;
}) {
  useEffect(() => {
    if (agent && mutationProfile) {
      toast.custom(() => (
        <div className="flex flex-col gap-2 p-4 w-full sm:w-[350px] bg-red-950/90 border border-red-900/50 rounded-xl shadow-2xl backdrop-blur-sm text-red-50">
          <div className="flex items-center gap-2 font-bold text-sm tracking-wide">
            <Zap className="w-4 h-4 text-red-400 fill-red-400" />
            MUTATION: {agent.toUpperCase()} → {mutationProfile.name.toUpperCase()} {mutationProfile.emoji}
          </div>
          <p className="text-xs text-red-200/80 leading-relaxed italic border-l-2 border-red-500/30 pl-2">
            A new challenger has entered the arena.
          </p>
        </div>
      ), {
        duration: 8000,
        position: "bottom-right",
      });
    }
  }, [agent, mutationProfile]);

  return null; // This component just manages side-effects
}
