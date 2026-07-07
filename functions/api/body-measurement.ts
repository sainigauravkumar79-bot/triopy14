import { callGemini, json, stripDataUrl, Env } from "./_gemini";

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const { height, weight, gender, age, image } = await request.json<{
      height: number;
      weight: number;
      gender: string;
      age: number;
      image?: string;
    }>();

    const parts: any[] = [];
    if (image) {
      parts.push({ inlineData: { mimeType: "image/jpeg", data: stripDataUrl(image) } });
    }

    const prompt = `Analyze this person's body shape and proportions (height: ${height} cm, weight: ${weight} kg, gender: ${gender}, age: ${age}).
    Estimate the following measurements (in cm) and parameters:
    - Waist circumference
    - Chest circumference
    - Shoulder width
    - Hip circumference
    - Estimated body fat (%)
    - BMI

    Format your response strictly as a JSON object:
    {
      "waist": 82,
      "chest": 98,
      "shoulder": 44,
      "hip": 96,
      "bodyFat": 18.5,
      "bmi": 22.4,
      "tips": "Your BMI is in the healthy range. Continue with standard resistance training."
    }`;
    parts.push({ text: prompt });

    const text = await callGemini(env.GEMINI_API_KEY, parts, true);
    return json(JSON.parse(text || "{}"));
  } catch (error: any) {
    console.error(error);
    return json({ error: "Failed to estimate body measurements" }, 500);
  }
};
