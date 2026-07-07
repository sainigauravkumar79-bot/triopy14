import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let aiInstance: GoogleGenAI | null = null;

function getAI() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // ===== API: Daily Quote =====
  app.get("/api/quote", async (req, res) => {
    try {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: "Provide a short, inspirational, health/fitness or study related quote for today. Keep it under 50 words.",
      });
      res.json({ quote: response.text });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch quote" });
    }
  });

  // ===== API: Smart Schedule =====
  app.post("/api/suggest-schedule", async (req, res) => {
    try {
      const { journalEntries } = req.body;
      const prompt = `Analyze the following daily journal notes and suggest an optimized daily schedule for fitness and study tasks. Keep it practical and motivational:\n\n${journalEntries.map((e: any) => `- ${e.note}`).join('\n')}`;
      
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: prompt,
      });
      res.json({ schedule: response.text });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to generate schedule" });
    }
  });

  // ===== API: Food Recognition =====
  app.post("/api/food-recognition", async (req, res) => {
    try {
      const { image } = req.body;
      const ai = getAI();
      const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
      
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

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Data
            }
          },
          prompt
        ],
        config: {
          responseMimeType: "application/json"
        }
      });

      res.json(JSON.parse(response.text || "{}"));
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to process food recognition" });
    }
  });

  // ===== API: Notes Scanner =====
  app.post("/api/notes-scanner", async (req, res) => {
    try {
      const { image } = req.body;
      const ai = getAI();
      const base64Data = image.replace(/^data:image\/\w+;base64,/, "");

      const prompt = `Extract all text and key concepts from these handwritten or printed notes. Return a structured markdown text. Be precise and capture formulas, lists, or headers cleanly.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Data
            }
          },
          prompt
        ]
      });

      res.json({ text: response.text });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to scan notes" });
    }
  });

  // ===== API: Homework AI =====
  app.post("/api/homework-ai", async (req, res) => {
    try {
      const { image, questionText } = req.body;
      const ai = getAI();
      
      let contents: any[] = [];
      if (image) {
        const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
        contents.push({
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Data
          }
        });
      }

      const prompt = `Analyze this question: "${questionText || 'Look at the image question'}"
      Provide:
      1. A detailed step-by-step explanation.
      2. The final answer.
      3. Three practice questions with similar concept to reinforce learning.
      
      Format the output in a structured, friendly markdown format.`;
      contents.push(prompt);

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents
      });

      res.json({ explanation: response.text });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to solve homework question" });
    }
  });

  // ===== API: Body Measurement (SAHI VERSION) =====
  app.post("/api/body-measurement", async (req, res) => {
    try {
      const { height, weight, gender, age, image } = req.body;
      const ai = getAI();

      let contents: any[] = [];
      if (image) {
        const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
        contents.push({
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Data
          }
        });
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
      contents.push(prompt);

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents,
        config: {
          responseMimeType: "application/json"
        }
      });

      res.json(JSON.parse(response.text || "{}"));
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to estimate body measurements" });
    }
  });

  // ===== API: Generate Meal Plan (NEW) =====
  app.post("/api/generate-meal-plan", async (req, res) => {
    try {
      const { prompt } = req.body;
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: prompt,
      });
      res.json({ plan: response.text });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to generate meal plan" });
    }
  });

  // ===== API: Analyze Symptoms (NEW) =====
  app.post("/api/analyze-symptoms", async (req, res) => {
    try {
      const { prompt } = req.body;
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });
      res.json(JSON.parse(response.text || "{}"));
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to analyze symptoms" });
    }
  });

  // ===== Vite Middleware / Static Serving =====
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
