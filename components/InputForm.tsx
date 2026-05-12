"use client";

import { useMemo, useState } from "react";
import { useCouncilStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import {
  FREQUENT_PROBLEMS,
  problemTextFromFrequent,
  type FrequentProblem,
} from "@/lib/frequent-problems";
import { FlaskConical } from "lucide-react";

const SELECT_NONE = "";

export function InputForm() {
  const router = useRouter();
  const setUserInput = useCouncilStore((s) => s.setUserInput);
  const [problem, setProblem] = useState("");
  const [audience, setAudience] = useState("");
  const [constraint, setConstraint] = useState("");
  const [vibe, setVibe] = useState("");
  const [selectedSampleId, setSelectedSampleId] = useState<string>(SELECT_NONE);

  const selectedSample = useMemo(
    () => FREQUENT_PROBLEMS.find((p) => p.id === selectedSampleId) ?? null,
    [selectedSampleId]
  );

  const applySampleToForm = (p: FrequentProblem) => {
    setProblem(problemTextFromFrequent(p));
    setAudience(p.audience);
    setConstraint(p.constraint);
    setVibe(p.vibe ?? "");
    setSelectedSampleId(SELECT_NONE);
  };

  const goToCouncilWithSample = (p: FrequentProblem) => {
    setUserInput({
      problem: problemTextFromFrequent(p),
      audience: p.audience,
      constraint: p.constraint,
      vibe: p.vibe ?? "",
    });
    router.push("/council");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUserInput({ problem, audience, constraint, vibe });
    router.push("/council");
  };

  return (
    <Card className="w-full max-w-xl p-6 bg-zinc-950 border-zinc-800 shadow-2xl space-y-6">
      <section className="space-y-3 rounded-lg border border-zinc-800/80 bg-zinc-900/40 p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md bg-violet-500/15 text-violet-400">
            <FlaskConical className="size-4" aria-hidden />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <h2 className="text-sm font-semibold text-zinc-100">Try a sample problem</h2>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Pick a common brief to preview details, then start the council in one click or load
              it into the form to customize.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="frequent-problem" className="text-xs font-medium text-zinc-400">
            Frequent problems
          </label>
          <select
            id="frequent-problem"
            className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
            value={selectedSampleId}
            onChange={(e) => setSelectedSampleId(e.target.value)}
          >
            <option value={SELECT_NONE}>Choose a sample…</option>
            {FREQUENT_PROBLEMS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>

        {selectedSample && (
          <div className="space-y-4 rounded-md border border-zinc-800 bg-zinc-950/80 p-4">
            <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-zinc-500">
              Preview
            </p>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-xs font-medium text-zinc-500">Title</span>
                <p className="mt-0.5 font-medium text-zinc-100">{selectedSample.title}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-zinc-500">Description</span>
                <p className="mt-0.5 text-zinc-300 leading-relaxed">{selectedSample.description}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-zinc-500">Audience</span>
                <p className="mt-0.5 text-zinc-300">{selectedSample.audience}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-zinc-500">Constraints</span>
                <p className="mt-0.5 text-zinc-300">{selectedSample.constraint}</p>
              </div>
              {selectedSample.vibe ? (
                <div>
                  <span className="text-xs font-medium text-zinc-500">Vibe</span>
                  <p className="mt-0.5 text-zinc-300">{selectedSample.vibe}</p>
                </div>
              ) : null}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
              <Button
                type="button"
                className="flex-1 bg-zinc-100 text-zinc-900 hover:bg-white"
                onClick={() => goToCouncilWithSample(selectedSample)}
              >
                Go with this prompt
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-zinc-700 bg-transparent text-zinc-200 hover:bg-zinc-800/80"
                onClick={() => applySampleToForm(selectedSample)}
              >
                Proceed with custom input
              </Button>
            </div>
          </div>
        )}
      </section>

      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Or define your own</p>

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
