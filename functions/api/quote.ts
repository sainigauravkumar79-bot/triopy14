import { callGemini, json, Env } from "./_gemini";

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  try {
    const text = await callGemini(env.GEMINI_API_KEY, [
      {
        text: "Provide a short, inspirational, health/fitness or study related quote for today. Keep it under 50 words.",
      },
    ]);
    return json({ quote: text });
  } catch (error: any) {
    console.error(error);
    return json({ error: "Failed to fetch quote" }, 500);
  }
};
