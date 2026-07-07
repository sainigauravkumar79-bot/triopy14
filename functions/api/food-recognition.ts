import { callGemini, json, stripDataUrl, Env } from "./_gemini";

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const { image } = await request.json<{ image: string }>();
    const base64Data = stripDataUrl(image);

    const prompt = `Analyze this image of food and identify the dishes. Estimate the nutritional values:
    - Calories (kcal)
    - Protein (g)
    - Carbs (g)
    - Fat (g)
    - Fiber (g)
    - Sugar (g)
    Provide your confidence score (0 to 1).
    Format your response STRICTLY as a JSON object of this structure:
    {
      "name": "Identified Food Name",
      "calories": 350,
      "protein": 12,
      "carbs": 45,
      "fat": 10,
      "fiber": 4,
      "sugar": 8,
      "confidence": 0.92
    }`;

    const text = await callGemini(
      env.GEMINI_API_KEY,
      [{ inlineData: { mimeType: "image/jpeg", data: base64Data } }, { text: prompt }],
      true
    );
    return json(JSON.parse(text || "{}"));
  } catch (error: any) {
    console.error(error);
    return json({ error: "Failed to process food recognition" }, 500);
  }
};
