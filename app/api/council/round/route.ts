import { callAgent } from "@/lib/openrouter";
import { parseAgentOutput } from "@/lib/parser";
import { MODELS } from "@/lib/models";
import { getScoreFormat } from "@/lib/agents";
import type { AgentOutput, UserInput, AgentProfile } from "@/lib/types";

export const maxDuration = 120;

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

async function callOneAgent(
  name: string,
  systemPrompt: string,
  userMessage: string
): Promise<AgentOutput> {
  const model = MODELS.agent;
  let raw = "";

  try {
    raw = await callAgent({ model, systemPrompt, messages: [{ role: "user", content: userMessage }] });
  } catch (err) {
    console.warn(`[round] ${name} failed, retrying:`, err);
    try {
      raw = await callAgent({ model, systemPrompt, messages: [{ role: "user", content: userMessage }] });
    } catch (retryErr) {
      console.error(`[round] ${name} retry also failed:`, retryErr);
      raw = `<thought>Error calling model.</thought><pitch>Unable to generate pitch this round.</pitch><scores></scores><critique>N/A</critique>`;
    }
  }

  const parsed = parseAgentOutput(name, raw);

  if (!parsed.pitch && raw.length > 50) {
    try {
      const raw2 = await callAgent({ model, systemPrompt, messages: [{ role: "user", content: userMessage }] });
      const parsed2 = parseAgentOutput(name, raw2);
      if (parsed2.pitch) return { name, ...parsed2 };
    } catch {
      // fall through
    }
  }

  return { name, ...parsed };
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
    const agentNames = Object.keys(agentProfiles);
    const scoreFormat = getScoreFormat(agentNames);

    // ─── Stream each agent's response as NDJSON ──────────────────────────────
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        for (const name of agentNames) {
          try {
            const systemPrompt = agentProfiles[name].prompt + "\n\n" + scoreFormat;
            const result = await callOneAgent(name, systemPrompt, userMessage);
            controller.enqueue(encoder.encode(JSON.stringify(result) + "\n"));
          } catch (err) {
            console.error(`[round] Error streaming ${name}:`, err);
            const fallback: AgentOutput = {
              name,
              thought: "Error occurred.",
              pitch: "Unable to generate pitch.",
              scores: {},
              critique: "N/A",
              raw: "",
            };
            controller.enqueue(encoder.encode(JSON.stringify(fallback) + "\n"));
          }
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "application/x-ndjson",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    console.error("[round] Unexpected error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
