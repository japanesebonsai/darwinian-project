import { useEffect } from "react";
import { toast } from "sonner";
import { AGENT_META } from "@/lib/models";
import type { AgentName } from "@/lib/types";
import { Zap } from "lucide-react";

export function MutationToast({
  agent,
  prompt,
}: {
  agent: AgentName | null;
  prompt: string | null;
}) {
  useEffect(() => {
    if (agent && prompt) {
      const meta = AGENT_META[agent];
      
      // We use sonner for toasts as configured via shadcn
      toast.custom((t) => (
        <div className="flex flex-col gap-2 p-4 w-full sm:w-[350px] bg-red-950/90 border border-red-900/50 rounded-xl shadow-2xl backdrop-blur-sm text-red-50">
          <div className="flex items-center gap-2 font-bold text-sm tracking-wide">
            <Zap className="w-4 h-4 text-red-400 fill-red-400" />
            ARBITER MUTATION: {meta.label}
          </div>
          <p className="text-xs text-red-200/80 leading-relaxed italic border-l-2 border-red-500/30 pl-2">
            "{prompt}"
          </p>
        </div>
      ), {
        duration: 8000,
        position: "bottom-right",
      });
    }
  }, [agent, prompt]);

  return null; // This component just manages side-effects
}
