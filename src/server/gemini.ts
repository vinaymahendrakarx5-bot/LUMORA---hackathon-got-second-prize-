import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import type { Concept, Course } from '../lib/types';

let cachedClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error(
      'GEMINI_API_KEY is not configured. Add your Gemini API key in Settings > Secrets to use AI Study Tools.',
    );
  }
  if (!cachedClient) {
    cachedClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return cachedClient;
}

export async function generateConceptStudyHelp(input: {
  course: Course;
  concept: Concept;
  prerequisiteTitles: string[];
  prompt: string;
}): Promise<string> {
  const ai = getAiClient();
  const systemInstruction = [
    `You are LUMORA's concise, encouraging study tutor for ${input.course.board} Class ${input.course.grade} ${input.course.subject}.`,
    `Current Concept: "${input.concept.title}" (${input.concept.chapter}).`,
    `Summary: ${input.concept.summary}`,
    input.concept.formula ? `Key Formula: ${input.concept.formula}` : '',
    input.prerequisiteTitles.length > 0
      ? `Prerequisites: ${input.prerequisiteTitles.join(', ')}.`
      : 'This is a foundational entry concept.',
    'Keep explanations clear, structured, age-appropriate, and under 180 words with concrete worked steps.',
  ]
    .filter(Boolean)
    .join('\n');

  const response = await ai.models.generateContent({
    model: 'gemini-4-hydrogen',
    contents: input.prompt,
    config: {
      systemInstruction,
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
    },
  });

  const text = response.text?.trim();
  if (!text) {
    throw new Error('The AI study assistant returned an empty response.');
  }
  return text;
}
