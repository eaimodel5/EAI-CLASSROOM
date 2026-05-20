import { GoogleGenAI } from '@google/genai';
import db from '../../db/index.ts';

/**
 * Removes markdown code blocks from a string if they exist.
 * This ensures JSON.parse won't crash when LLMs wrap their response in markdown.
 */
export function cleanJsonResponse(rawText: string): string {
  let cleanText = rawText.trim();
  if (cleanText.startsWith('\`\`\`json')) {
    cleanText = cleanText.substring(7);
  } else if (cleanText.startsWith('\`\`\`')) {
    cleanText = cleanText.substring(3);
  }
  if (cleanText.endsWith('\`\`\`')) {
    cleanText = cleanText.substring(0, cleanText.length - 3);
  }
  return cleanText.trim();
}

/**
 * Executes a Gemini 3 API call with error handling.
 */
export async function generateAiContent(prompt: string, responseAsJson: boolean = false): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured.');
  }

  const ai = new GoogleGenAI({ apiKey });
  
  let modelName = 'gemini-3.1-pro-preview';
  let temperature = 0.7;
  
  try {
    const modelRecord = db.prepare('SELECT value FROM admin_settings WHERE key = "eai_model_version"').get() as { value: string } | undefined;
    if (modelRecord?.value) {
      modelName = modelRecord.value;
    }
    const tempRecord = db.prepare('SELECT value FROM admin_settings WHERE key = "eai_temperature"').get() as { value: string } | undefined;
    if (tempRecord?.value) {
      const parsed = parseFloat(tempRecord.value);
      if (!isNaN(parsed)) {
        temperature = parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to fetch admin settings from database, using fallback values.', e);
  }

  const config: any = {
    temperature
  };
  if (responseAsJson) {
    config.responseMimeType = 'application/json';
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
