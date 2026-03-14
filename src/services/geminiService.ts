import { GoogleGenAI, Type } from "@google/genai";
import { Question } from "../questions";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateQuestions(): Promise<Question[]> {
  const categories = ["History", "Geography", "Science", "Literature", "Art", "Pop Culture", "Sports", "Technology", "Nature", "Movies", "Music", "Mythology"];
  const selectedCategories = categories.sort(() => 0.5 - Math.random()).slice(0, 5).join(", ");
  const randomSeed = Math.random().toString(36).substring(7);
  
  const prompt = `Generate 15 unique trivia questions for a "Who Wants to Be a Millionaire" style game in Georgian language.
  Random seed for variety: ${randomSeed}.
  Focus on these categories among others: ${selectedCategories}.
  The questions should increase in difficulty from 1 to 15.
  Each question must have exactly 4 options and one correct answer index (0-3).
  The categories should be diverse and change every time.
  Ensure the questions are interesting, factually correct, and completely different from any previous sets.
  Avoid common or repetitive questions.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.INTEGER },
            text: { type: Type.STRING },
            options: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            correctAnswer: { type: Type.INTEGER },
            difficulty: { type: Type.INTEGER },
            category: { type: Type.STRING },
          },
          required: ["id", "text", "options", "correctAnswer", "difficulty", "category"],
        },
      },
    },
  });

  try {
    const questions = JSON.parse(response.text);
    return questions;
  } catch (error) {
    console.error("Failed to parse generated questions:", error);
    throw new Error("Failed to generate questions");
  }
}
