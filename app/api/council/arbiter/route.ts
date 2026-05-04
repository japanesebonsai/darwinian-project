import { callAgent } from "@/lib/openrouter";
import { MODELS } from "@/lib/models";
import { ARBITER_SYSTEM_PROMPT } from "@/lib/agents";
import { computeComposites, lowestComposite, tallyFinalVotes } from "@/lib/scoring";
import type { AgentOutput, ArbiterResult, AgentName } from "@/lib/types";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      agentOutputs,
      currentRound,
    }: {
      agentOutputs: AgentOutput[];
      currentRound: number;
    } = body;

    if (!agentOutputs || agentOutputs.length !== 5) {
      return Response.json(
        { error: "Expected exactly 5 agent outputs" },
        { status: 400 }
      );
    }

    // 1. Compute composites server-side
    const composites = computeComposites(agentOutputs);
    const lowest = lowestComposite(composites);

    // 2. Tally votes if round 4 or if we want to check consensus
    let consensusWinner = tallyFinalVotes(agentOutputs);
    const isConsensus = consensusWinner !== null;

    // 3. Ask Arbiter to mutate the lowest scorer (and tiebreak if necessary)
    const arbiterMessage = JSON.stringify({
      round: currentRound,
      agentOutputs: agentOutputs.map((a) => ({
        name: a.name,
        pitch: a.pitch,
        scoresGiven: a.scores,
        finalVote: a.finalVote,
      })),
      computedComposites: composites,
      lowestScorer: lowest,
      needsTiebreaker: currentRound === 4 && !isConsensus,
    });

    let rawArbiter = "";
    try {
      rawArbiter = await callAgent({
        model: MODELS.arbiter,
        systemPrompt: ARBITER_SYSTEM_PROMPT,
        messages: [{ role: "user", content: arbiterMessage }],
      });
    } catch (err) {
      console.error("[arbiter] call failed:", err);
      // Fallback arbiter result
      const result: ArbiterResult = {
        round: currentRound,
        composites,
        mutatedAgent: null,
        mutationPrompt: null,
        consensus: isConsensus,
        winner: isConsensus ? consensusWinner : null,
        tiebreakerUsed: false,
        tiebreakerReason: null,
      };
      return Response.json(result);
    }

    // 4. Parse Arbiter JSON response
    // LLMs often wrap JSON in markdown blocks, so we extract it
    const jsonMatch = rawArbiter.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    const jsonString = jsonMatch ? jsonMatch[1] : rawArbiter;

    let parsedArbiter: any;
    try {
      parsedArbiter = JSON.parse(jsonString);
    } catch (err) {
      console.error("[arbiter] failed to parse JSON:", err, rawArbiter);
      return Response.json(
        { error: "Failed to parse arbiter response" },
        { status: 500 }
      );
    }

    // 5. Construct final sanitized result
    const result: ArbiterResult = {
      round: currentRound,
      composites, // Always trust our own computed composites over the LLM's
      mutatedAgent: parsedArbiter.mutatedAgent ?? lowest,
      mutationPrompt: parsedArbiter.mutationPrompt ?? null,
      consensus: isConsensus || parsedArbiter.consensus === true,
      winner: parsedArbiter.winner ?? consensusWinner,
      tiebreakerUsed: parsedArbiter.tiebreakerUsed ?? false,
      tiebreakerReason: parsedArbiter.tiebreakerReason ?? null,
    };

    // If it's round 4 and no winner was declared but a tiebreaker was needed,
    // force a winner based on highest composite score to guarantee an end.
    if (currentRound === 4 && !result.winner) {
      const highest = Object.entries(composites).reduce((max, [name, score]) =>
        score > max[1] ? [name as AgentName, score] : max
      );
      result.winner = highest[0] as AgentName;
      result.tiebreakerUsed = true;
      result.tiebreakerReason = `Forced tiebreaker based on highest composite score: ${highest[0]} (${highest[1]}).`;
    }

    return Response.json(result);
  } catch (err) {
    console.error("[arbiter] Unexpected error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
