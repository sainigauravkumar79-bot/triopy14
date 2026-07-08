export interface Env {
  GEMINI_API_KEY: string;
}

type Part = { text: string } | { inlineData: { mimeType: string; data: string } };

export async function callGemini(
  apiKey: string,
  parts: Part[],
  jsonMode = false
): Promise<string> {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured on the server");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;

  const body: Record<string, unknown> = {
    contents: [{ parts }],
  };
  if (jsonMode) {
    body.generationConfig = { responseMimeType: "application/json" };
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text || "").join("") ?? "";
  return text;
}

export function stripDataUrl(image: string): string {
  return image.replace(/^data:image\/\w+;base64,/, "");
}

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
