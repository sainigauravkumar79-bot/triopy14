import { callGemini, json, Env } from "./_gemini";

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const { prompt } = await request.json<{ prompt: string }>();
    const text = await callGemini(env.GEMINI_API_KEY, [{ text: prompt }], true);
    return json(JSON.parse(text || "{}"));
  } catch (error: any) {
    console.error(error);
    return json({ error: "Failed to analyze symptoms" }, 500);
  }
};
