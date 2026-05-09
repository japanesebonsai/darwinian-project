import { callAgent } from "@/lib/openrouter";
import { parseAgentOutput } from "@/lib/parser";
import { MODELS } from "@/lib/models";
import { getScoreFormat } from "@/lib/agents";
import type { AgentOutput, UserInput, AgentProfile } from "@/lib/types";

export const maxDuration = 60;

function buildUserMessage(
  userInput: UserInput,
  roundHistory: { round: number; pitches: Record<string, string> }[],
  currentRound: number
): string {
  const history =
    roundHistory.length > 0
      ? "\n\n--- PRIOR ROUND PITCHES ---\n" +
        roundHistory
          .map(
            (r) =>
              `Round ${r.round}:\n` +
              Object.entries(r.pitches)
                .map(([k, v]) => `  ${k.toUpperCase()}: ${v}`)
                .join("\n")
          )
          .join("\n\n")
      : "";

  return `PROBLEM: ${userInput.problem}
AUDIENCE: ${userInput.audience}
CONSTRAINT: ${userInput.constraint}${userInput.vibe ? `\nVIBE: ${userInput.vibe}` : ""}
ROUND: ${currentRound} of 4${history}`.trim();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      userInput,
      agentProfiles,
      roundHistory = [],
      currentRound,
    }: {
      userInput: UserInput;
      agentProfiles: Record<string, AgentProfile>;
      roundHistory: { round: number; pitches: Record<string, string> }[];
      currentRound: number;
    } = body;

    if (!userInput?.problem) {
      return Response.json({ error: "Missing userInput.problem" }, { status: 400 });
    }

    const userMessage = buildUserMessage(userInput, roundHistory, currentRound);

    // ─── Call all 5 agents in parallel ───────────────────────────────────────
    const agentNames = Object.keys(agentProfiles);
    const scoreFormat = getScoreFormat(agentNames);
    
    const results = await Promise.all(
      agentNames.map(async (name): Promise<AgentOutput> => {
        const systemPrompt = agentProfiles[name].prompt + "\n\n" + scoreFormat;
        const model = MODELS.agent;

        let raw = "";
        try {
          raw = await callAgent({
            model,
            systemPrompt,
            messages: [{ role: "user", content: userMessage }],
          });
        } catch (err) {
          // Retry once on failure
          console.warn(`[round] ${name} failed, retrying:`, err);
          try {
            raw = await callAgent({
              model,
              systemPrompt,
              messages: [{ role: "user", content: userMessage }],
            });
          } catch (retryErr) {
            console.error(`[round] ${name} retry also failed:`, retryErr);
            raw = `<thought>Error calling model.</thought><pitch>Unable to generate pitch this round.</pitch><scores></scores><critique>N/A</critique>`;
          }
        }

        const parsed = parseAgentOutput(name, raw);

        // Validate parse — retry once if pitch is empty
        if (!parsed.pitch && raw.length > 50) {
          console.warn(`[round] ${name} parse yielded empty pitch, retrying...`);
          try {
            const raw2 = await callAgent({
              model,
              systemPrompt,
              messages: [{ role: "user", content: userMessage }],
            });
            const parsed2 = parseAgentOutput(name, raw2);
            if (parsed2.pitch) return { name, ...parsed2 };
          } catch {
            // fall through to original
          }
        }

        return { name, ...parsed };
      })
    );

    return Response.json({ agents: results });
  } catch (err) {
    console.error("[round] Unexpected error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
