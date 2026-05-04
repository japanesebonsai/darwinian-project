"use client";

import { useState } from "react";
import { useCouncilStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export function InputForm() {
  const router = useRouter();
  const setUserInput = useCouncilStore((s) => s.setUserInput);
  const [problem, setProblem] = useState("");
  const [audience, setAudience] = useState("");
  const [constraint, setConstraint] = useState("");
  const [vibe, setVibe] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUserInput({ problem, audience, constraint, vibe });
    router.push("/council");
  };

  return (
    <Card className="w-full max-w-xl p-6 bg-zinc-950 border-zinc-800 shadow-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">Problem *</label>
          <textarea
            required
            className="w-full min-h-[80px] p-3 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none transition-all"
            placeholder="What needs to be solved? e.g. People hate doing their taxes."
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">Audience *</label>
          <input
            required
            type="text"
            className="w-full p-3 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
            placeholder="Who is this for? e.g. Freelance designers"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">Constraints *</label>
          <input
            required
            type="text"
            className="w-full p-3 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
            placeholder="e.g. No code, mobile only, $0 budget"
            value={constraint}
            onChange={(e) => setConstraint(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-400">Vibe (Optional)</label>
          <input
            type="text"
            className="w-full p-3 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
            placeholder="e.g. Cyberpunk, brutalist, friendly"
            value={vibe}
            onChange={(e) => setVibe(e.target.value)}
          />
        </div>

        <Button
          type="submit"
          className="w-full mt-4 bg-zinc-100 text-zinc-900 hover:bg-white transition-colors"
        >
          Convene the Council
        </Button>
      </form>
    </Card>
  );
}
