import { callAgent } from "@/lib/openrouter";
import { MODELS } from "@/lib/models";
import { getArbiterPrompt } from "@/lib/agents";
import { computeComposites, lowestComposite, tallyFinalVotes } from "@/lib/scoring";
import type { AgentOutput, ArbiterResult } from "@/lib/types";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      agentOutputs,
      currentRound,
      agentNames,
    }: {
      agentOutputs: AgentOutput[];
      currentRound: number;
      agentNames: string[];
    } = body;

    if (!agentOutputs || agentOutputs.length === 0) {
      return Response.json(
        { error: "No agent outputs provided" },
        { status: 400 }
      );
    }

    // Fallback: derive agentNames from outputs if not provided
    const resolvedNames = agentNames?.length
      ? agentNames
      : agentOutputs.map((a: any) => a.name);

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
        systemPrompt: getArbiterPrompt(resolvedNames),
        messages: [{ role: "user", content: arbiterMessage }],
      });
    } catch (err) {
      console.error("[arbiter] call failed:", err);
      // Fallback arbiter result
      const result: ArbiterResult = {
        round: currentRound,
        composites,
        mutatedAgent: null,
        mutationProfile: null,
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
      // If parsing fails completely, just use a fallback so we don't crash the round
      parsedArbiter = {
        mutatedAgent: lowest,
        mutationProfile: null,
        consensus: isConsensus,
        winner: consensusWinner,
        tiebreakerUsed: false,
        tiebreakerReason: null,
      };
    }

    // 5. Construct final sanitized result
    const result: ArbiterResult = {
      round: currentRound,
      composites, // Always trust our own computed composites over the LLM's
      mutatedAgent: parsedArbiter.mutatedAgent ?? lowest,
      mutationProfile: parsedArbiter.mutationProfile ?? null,
      consensus: isConsensus || parsedArbiter.consensus === true,
      winner: parsedArbiter.winner ?? consensusWinner,
      tiebreakerUsed: parsedArbiter.tiebreakerUsed ?? false,
      tiebreakerReason: parsedArbiter.tiebreakerReason ?? null,
    };

    // If it's round 4 and no winner was declared but a tiebreaker was needed,
    // force a winner based on highest composite score to guarantee an end.
    if (currentRound === 4 && !result.winner) {
      const highest = Object.entries(composites).reduce((max, [name, score]) =>
        score > max[1] ? [name, score] : max
      );
      result.winner = highest[0];
      result.tiebreakerUsed = true;
      result.tiebreakerReason = `Forced tiebreaker based on highest composite score: ${highest[0]} (${highest[1]}).`;
    }

    return Response.json(result);
  } catch (err) {
    console.error("[arbiter] Unexpected error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
