import { GoogleGenAI } from '@google/genai';
import { db } from '../../lib/firebase.ts';
import { doc, getDoc } from 'firebase/firestore';

/**
 * Removes markdown code blocks from a string if they exist.
 * This ensures JSON.parse won't crash when LLMs wrap their response in markdown.
 */
export function cleanJsonResponse(rawText: string): string {
  let text = rawText.trim();
  const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (match) {
    return match[1].trim();
  }
  return text;
}

/**
 * Executes a Gemini 3 API call with error handling.
 */
export async function generateAiContent(prompt: string, responseAsJson: boolean = false, responseSchema?: any, options?: { model?: string, temperature?: number }): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured.');
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
  
  let modelName = options?.model || 'gemini-3.1-pro-preview';
  let temperature = options?.temperature ?? 0.7;

  try {
    const docSnap = await getDoc(doc(db, 'admin_settings', 'global'));
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (!options?.model && data.eai_model_version) {
        modelName = data.eai_model_version;
      }
      if (options?.temperature === undefined && data.eai_temperature !== undefined) {
        const parsed = parseFloat(data.eai_temperature);
        if (!isNaN(parsed)) temperature = parsed;
      }
    }
  } catch (error) {
    console.warn('Failed to read admin_settings from Firestore:', error);
  }

  const config: any = {
    temperature
  };
  if (responseAsJson) {
    config.responseMimeType = 'application/json';
  }
  if (responseSchema) {
    config.responseSchema = responseSchema;
  }
  
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config
    });

    const text = response.text || '';
    return responseAsJson ? cleanJsonResponse(text) : text;
  } catch (err: any) {
    console.error('AI Generation Error:', err);
    throw new Error('An error occurred while generating AI content.');
  }
}
