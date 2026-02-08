// api/generate-quiz.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const context = req.body; // UserContext from frontend

    const detailString =
      context.level === "secondary"
        ? `Exam: ${context.secondaryDetails?.examType}, Subject: ${context.secondaryDetails?.subject}, Topic: ${context.secondaryDetails?.topic || "General"}`
        : `University: ${context.universityDetails?.universityName}, Course: ${context.universityDetails?.courseCode} - ${context.universityDetails?.courseName}, Level: ${context.universityDetails?.level}`;

    const novelContext = context.novelTitle
      ? `Literature/Book Study: "${context.novelTitle}".`
      : "";

    const prompt = `
You are a professional educational assessment designer.

Generate exactly ${context.questionCount} exam-standard MCQs.

Context: ${detailString}
${novelContext}

Return STRICTLY this JSON shape:
{
  "questions": [
    {
      "question": "string",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 0,
      "explanation": "string"
    }
  ],
  "recommendations": [
    { "title": "string", "description": "string", "link": "string" }
  ]
}
`;

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY is not set");
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        // Optional but recommended:
        "HTTP-Referer": "https://your-site-url.com",
        "X-Title": "Quiz Generator",
      },
      body: JSON.stringify({
        // pick a free/cheap model, e.g. DeepSeek via OpenRouter:
        model: "deepseek/deepseek-chat:free", // you can change this later
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("OpenRouter error:", response.status, text);
      return res.status(500).json({ error: "AI provider error" });
    }

    const json = await response.json();
    const content: string = json.choices?.[0]?.message?.content || "{}";

    let data: any;
    try {
      data = JSON.parse(content);
    } catch {
      data = { questions: [], recommendations: [] };
    }

    return res.status(200).json({
      questions: data.questions || [],
      sources: [], // OpenRouter doesn't return Google grounding
      recommendations: data.recommendations || [],
    });
  } catch (err) {
    console.error("Quiz API error:", err);
    return res.status(500).json({ error: "Failed to generate quiz" });
  }
}
