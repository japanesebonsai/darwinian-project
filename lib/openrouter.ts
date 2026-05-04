const BASE = "https://openrouter.ai/api/v1/chat/completions";

export async function callAgent({
  model,
  systemPrompt,
  messages,
}: {
  model: string;
  systemPrompt: string;
  messages: { role: "user" | "assistant"; content: string }[];
}): Promise<string> {
  const res = await fetch(BASE, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://council-of-llms.vercel.app",
      "X-Title": "Council of LLMs",
    },
    body: JSON.stringify({
      model,
      max_tokens: 1200,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}
