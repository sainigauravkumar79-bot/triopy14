import { callGemini, json, Env } from "./_gemini";

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const { journalEntries } = await request.json<{ journalEntries: { note: string }[] }>();
    const prompt = `Analyze the following daily journal notes and suggest an optimized daily schedule for fitness and study tasks. Keep it practical and motivational:\n\n${journalEntries
      .map((e) => `- ${e.note}`)
      .join("\n")}`;

    const text = await callGemini(env.GEMINI_API_KEY, [{ text: prompt }]);
    return json({ schedule: text });
  } catch (error: any) {
    console.error(error);
    return json({ error: "Failed to generate schedule" }, 500);
  }
};
