// api/generate-quiz.ts

export default async function handler(req: any, res: any) {
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

IMPORTANT:
- Respond with JSON ONLY, no backticks, no markdown, no explanation.
- Do not include any text before or after the JSON.
- Follow this structure exactly.

Return this JSON object:
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

    async function callOpenRouter(): Promise<any> {
      const apiKey = process.env.OPENROUTER_API_KEY;
      if (!apiKey) throw new Error("OPENROUTER_API_KEY missing");

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://acestudy-ai.vercel.app",
          "X-Title": "AceStudy Quiz Generator",
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-chat", // pick your OpenRouter model
          messages: [{ role: "user", content: prompt }],
          temperature: 0.5,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`OpenRouter error ${response.status}: ${text}`);
      }

      const json = await response.json();
      return json.choices?.[0]?.message?.content || "{}";
    }

    async function callGroq(): Promise<any> {
      const apiKey = process.env.GROQ_API_KEY;
      if (!apiKey) throw new Error("GROQ_API_KEY missing");

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant", // or another Groq model
          messages: [{ role: "user", content: prompt }],
          temperature: 0.5,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Groq error ${response.status}: ${text}`);
      }

      const json = await response.json();
      return json.choices?.[0]?.message?.content || "{}";
    }

    function extractJson(text: string): any {
      const firstBrace = text.indexOf("{");
      const lastBrace = text.lastIndexOf("}");
      if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
        throw new Error("No JSON object found");
      }
      const jsonString = text.slice(firstBrace, lastBrace + 1);
      return JSON.parse(jsonString);
    }

    let content: string;
    try {
      // Try OpenRouter first
      content = await callOpenRouter();
    } catch (e) {
      console.error("OpenRouter failed, trying Groq:", e);
      // Fallback to Groq
      content = await callGroq();
    }

    let data: any;
    try {
      data = extractJson(content);
    } catch (e) {
      console.error("Failed to parse model JSON:", e, "content:", content);
      data = { questions: [], recommendations: [] };
    }

    return res.status(200).json({
      questions: data.questions || [],
      sources: [],
      recommendations: data.recommendations || [],
    });
  } catch (err) {
    console.error("Quiz API error:", err);
    return res.status(500).json({ error: "Failed to generate quiz" });
  }
}
