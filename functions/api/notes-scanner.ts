import { callGemini, json, stripDataUrl, Env } from "./_gemini";

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const { image } = await request.json<{ image: string }>();
    const base64Data = stripDataUrl(image);

    const prompt = `Extract all text and key concepts from these handwritten or printed notes. Return a structured markdown text. Be precise and capture formulas, lists, or headers cleanly.`;

    const text = await callGemini(env.GEMINI_API_KEY, [
      { inlineData: { mimeType: "image/jpeg", data: base64Data } },
      { text: prompt },
    ]);
    return json({ text });
  } catch (error: any) {
    console.error(error);
    return json({ error: "Failed to scan notes" }, 500);
  }
};
