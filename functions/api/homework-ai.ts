import { callGemini, json, stripDataUrl, Env } from "./_gemini";

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const { image, questionText } = await request.json<{ image?: string; questionText?: string }>();

    const parts: any[] = [];
    if (image) {
      parts.push({ inlineData: { mimeType: "image/jpeg", data: stripDataUrl(image) } });
    }

    const prompt = `Analyze this question: "${questionText || "Look at the image question"}"
    Provide:
    1. A detailed step-by-step explanation.
    2. The final answer.
    3. Three practice questions with similar concept to reinforce learning.

    Format the output in a structured, friendly markdown format.`;
    parts.push({ text: prompt });

    const text = await callGemini(env.GEMINI_API_KEY, parts);
    return json({ explanation: text });
  } catch (error: any) {
    console.error(error);
    return json({ error: "Failed to solve homework question" }, 500);
  }
};
