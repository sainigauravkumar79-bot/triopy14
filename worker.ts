export interface Env {
  ASSETS: { fetch: typeof fetch };
  GEMINI_API_KEY: string;
}

type Part = { text: string } | { inlineData: { mimeType: string; data: string } };

async function callGemini(apiKey: string, parts: Part[], jsonMode = false): Promise<string> {
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;
  const body: Record<string, unknown> = { contents: [{ parts }] };
  if (jsonMode) body.generationConfig = { responseMimeType: "application/json" };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`Gemini API error (${res.status}): ${await res.text()}`);

  const data: any = await res.json();
  return data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text || "").join("") ?? "";
}

function stripDataUrl(image: string): string {
  return image.replace(/^data:image\/\w+;base64,/, "");
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    try {
      if (path === "/api/quote" && request.method === "GET") {
        const text = await callGemini(env.GEMINI_API_KEY, [
          { text: "Provide a short, inspirational, health/fitness or study related quote for today. Keep it under 50 words." },
        ]);
        return json({ quote: text });
      }

      if (path === "/api/suggest-schedule" && request.method === "POST") {
        const { journalEntries } = await request.json<{ journalEntries: { note: string }[] }>();
        const prompt = `Analyze the following daily journal notes and suggest an optimized daily schedule for fitness and study tasks. Keep it practical and motivational:\n\n${journalEntries.map((e) => `- ${e.note}`).join("\n")}`;
        const text = await callGemini(env.GEMINI_API_KEY, [{ text: prompt }]);
        return json({ schedule: text });
      }

      if (path === "/api/food-recognition" && request.method === "POST") {
        const { image } = await request.json<{ image: string }>();
        const prompt = `Analyze this image of food and identify the dishes. Estimate calories, protein, carbs, fat, fiber, sugar, and confidence (0-1). Format STRICTLY as JSON: {"name":"...","calories":350,"protein":12,"carbs":45,"fat":10,"fiber":4,"sugar":8,"confidence":0.92}`;
        const text = await callGemini(env.GEMINI_API_KEY, [
          { inlineData: { mimeType: "image/jpeg", data: stripDataUrl(image) } },
          { text: prompt },
        ], true);
        return json(JSON.parse(text || "{}"));
      }

      if (path === "/api/notes-scanner" && request.method === "POST") {
        const { image } = await request.json<{ image: string }>();
        const prompt = "Extract all text and key concepts from these handwritten or printed notes. Return structured markdown.";
        const text = await callGemini(env.GEMINI_API_KEY, [
          { inlineData: { mimeType: "image/jpeg", data: stripDataUrl(image) } },
          { text: prompt },
        ]);
        return json({ text });
      }

      if (path === "/api/homework-ai" && request.method === "POST") {
        const { image, questionText } = await request.json<{ image?: string; questionText?: string }>();
        const parts: Part[] = [];
        if (image) parts.push({ inlineData: { mimeType: "image/jpeg", data: stripDataUrl(image) } });
        parts.push({ text: `Analyze this question: "${questionText || "Look at the image question"}". Provide: 1) step-by-step explanation 2) final answer 3) three practice questions. Use friendly markdown.` });
        const text = await callGemini(env.GEMINI_API_KEY, parts);
        return json({ explanation: text });
      }

      if (path === "/api/body-measurement" && request.method === "POST") {
        const { height, weight, gender, age, image } = await request.json<{ height: number; weight: number; gender: string; age: number; image?: string }>();
        const parts: Part[] = [];
        if (image) parts.push({ inlineData: { mimeType: "image/jpeg", data: stripDataUrl(image) } });
        parts.push({ text: `Analyze body proportions (height: ${height}cm, weight: ${weight}kg, gender: ${gender}, age: ${age}). Estimate waist, chest, shoulder, hip (cm), bodyFat (%), bmi, tips. Format STRICTLY as JSON: {"waist":82,"chest":98,"shoulder":44,"hip":96,"bodyFat":18.5,"bmi":22.4,"tips":"..."}` });
        const text = await callGemini(env.GEMINI_API_KEY, parts, true);
        return json(JSON.parse(text || "{}"));
      }

      if (path === "/api/generate-meal-plan" && request.method === "POST") {
        const { prompt } = await request.json<{ prompt: string }>();
        const text = await callGemini(env.GEMINI_API_KEY, [{ text: prompt }]);
        return json({ plan: text });
      }

      if (path === "/api/analyze-symptoms" && request.method === "POST") {
        const { prompt } = await request.json<{ prompt: string }>();
        const text = await callGemini(env.GEMINI_API_KEY, [{ text: prompt }], true);
        return json(JSON.parse(text || "{}"));
      }

      // Not an API route — serve static assets (React app)
      return env.ASSETS.fetch(request);
    } catch (error: any) {
      console.error(error);
      return json({ error: error.message || "Internal server error" }, 500);
    }
  },
};
