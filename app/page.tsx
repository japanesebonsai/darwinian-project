import { InputForm } from "@/components/InputForm";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 min-h-screen relative overflow-hidden selection:bg-violet-500/30">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-600/10 blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-3xl flex flex-col items-center text-center mb-12">
        <h1 className="text-5xl sm:text-7xl font-bold tracking-tighter mb-6 bg-gradient-to-br from-white to-zinc-500 bg-clip-text text-transparent">
          Council of LLMs
        </h1>
        <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl leading-relaxed">
          Submit your problem statement. Five specialized AI agents with clashing
          personalities will debate, critique, and ideate until they reach a
          consensus on the perfect solution.
        </p>
      </div>

      <div className="relative z-10 w-full flex justify-center">
        <InputForm />
      </div>
    </main>
  );
}
