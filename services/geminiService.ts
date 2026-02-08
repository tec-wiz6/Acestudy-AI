
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { UserContext, QuizQuestion, StudyMaterial } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const QUIZ_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          options: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "Must provide exactly 4 options."
          },
          correctIndex: { type: Type.NUMBER, description: "Index of the correct option (0-3)." },
          explanation: { type: Type.STRING, description: "A brief explanation of why the answer is correct." }
        },
        required: ["question", "options", "correctIndex", "explanation"]
      }
    },
    recommendations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          link: { type: Type.STRING, description: "A URL to a public resource or search query." }
        },
        required: ["title", "description", "link"]
      },
      description: "Recommended study materials for further reading."
    }
  },
  required: ["questions", "recommendations"]
};

export async function generateQuizFromGemini(context: UserContext): Promise<{ 
  questions: QuizQuestion[], 
  sources: { title: string, uri: string }[],
  recommendations: StudyMaterial[] 
}> {
  const isSecondary = context.level === 'secondary';
  const detailString = isSecondary 
    ? `Exam: ${context.secondaryDetails?.examType}, Subject: ${context.secondaryDetails?.subject}, Topic: ${context.secondaryDetails?.topic || 'General'}`
    : `University: ${context.universityDetails?.universityName}, Course: ${context.universityDetails?.courseCode} - ${context.universityDetails?.courseName}, Level: ${context.universityDetails?.level}`;

  const novelContext = context.novelTitle ? `\nLiterature/Book Study: "${context.novelTitle}". Search specifically for questions, characters, and key themes of this book.` : "";

  const systemInstruction = `You are a professional educational assessment designer. 
  Your goal is to generate exactly ${context.questionCount} high-quality, exam-standard Multiple Choice Questions (MCQs) for:
  ${detailString}
  
  Instructions:
  1. Priority: If a 'Literature/Book Study' title is provided, use Google Search to find specific questions, themes, and details about that specific book.
  2. Main Task: Use Google Search to find real public past questions for this exam (WAEC/JAMB/NECO) or university course and mimic their pattern.
  3. Accuracy: Ensure exactly 4 options per question.
  4. Context: For University, match the specific depth of the university mentioned.
  5. Recommendations: Provide specific study materials (books or links) tailored to this context.
  6. Return data strictly in JSON format.`;

  const prompt = `Generate exactly ${context.questionCount} questions for: ${detailString}. ${novelContext}`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: QUIZ_SCHEMA,
        tools: [{ googleSearch: {} }] 
      },
    });

    const data = JSON.parse(response.text || '{"questions": [], "recommendations": []}');
    
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || "Reference",
      uri: chunk.web?.uri || ""
    })).filter((s: any) => s.uri !== "") || [];

    return {
      questions: data.questions || [],
      sources: sources,
      recommendations: data.recommendations || []
    };
  } catch (error) {
    console.error("Gemini Error:", error);
    throw new Error("Failed to generate quiz. Please check your connection.");
  }
}
