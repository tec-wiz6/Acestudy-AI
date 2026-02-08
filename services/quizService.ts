// src/services/quizService.ts
import { UserContext, QuizQuestion, StudyMaterial } from "../types";

export async function generateQuiz(context: UserContext): Promise<{
  questions: QuizQuestion[];
  sources: { title: string; uri: string }[];
  recommendations: StudyMaterial[];
}> {
  const res = await fetch("/api/generate-quiz", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(context),
  });

  if (!res.ok) {
    throw new Error("Failed to generate quiz. Please try again later.");
  }

  const data = await res.json();
  return {
    questions: data.questions || [],
    sources: data.sources || [],
    recommendations: data.recommendations || [],
  };
}
