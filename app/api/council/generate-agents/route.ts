import { callAgent } from "@/lib/openrouter";
import { MODELS } from "@/lib/models";
import type { AgentProfile, UserInput } from "@/lib/types";

export const maxDuration = 60;

const SYSTEM_PROMPT = `You are the Director of an Ideation Council.
The user will provide a problem, audience, and constraints.
Your job is to generate exactly 5 distinct, highly opinionated, unique personas who will debate this problem.
The personas should all be centered around project ideation, but they should have completely different perspectives (e.g., a pragmatic engineer, a ruthless VC, a human-centered designer, a local-first hacker, a utopian futurist, etc.).

Return the response STRICTLY as a JSON array of 5 objects. Do not include markdown code blocks (like \`\`\`json) or any other text.
Each object must match this interface:
{
  "name": "A short, unique, one-word lowercase name (e.g., 'axiom')",
  "emoji": "A single emoji representing them",
  "color": "A hex color code (e.g., '#7c3aed')",
  "initial": "A single uppercase letter",
  "prompt": "Their system prompt. Detail their personality, stance, and how they should approach ideation and critique."
}

Ensure the "prompt" field gives them a very strong, distinct personality that will clash interestingly with the others.`;

export async function POST(request: Request) {
  try {
    const { userInput }: { userInput: UserInput } = await request.json();

    if (!userInput?.problem) {
      return Response.json({ error: "Missing userInput.problem" }, { status: 400 });
    }

    const userMessage = `PROBLEM: ${userInput.problem}
AUDIENCE: ${userInput.audience}
CONSTRAINT: ${userInput.constraint}${userInput.vibe ? `\nVIBE: ${userInput.vibe}` : ""}`;

    const raw = await callAgent({
      model: MODELS.director,
      systemPrompt: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    let jsonStr = raw.trim();
    if (jsonStr.startsWith("```json")) {
      jsonStr = jsonStr.replace(/^```json/, "").replace(/```$/, "").trim();
    }
    
    const profiles = JSON.parse(jsonStr) as AgentProfile[];
    if (!Array.isArray(profiles) || profiles.length !== 5) {
      throw new Error("Invalid output from Director");
    }

    // Convert array to Record
    const profileRecord: Record<string, AgentProfile> = {};
    profiles.forEach((p) => {
      profileRecord[p.name] = p;
    });

    return Response.json({ profiles: profileRecord });
  } catch (err) {
    console.error("[generate-agents] Error:", err);
    return Response.json({ error: "Failed to generate agents" }, { status: 500 });
  }
}
