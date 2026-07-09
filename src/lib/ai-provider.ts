import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

/**
 * Modular AI Provider Abstraction
 * Accepts a modelId and resolves the correct provider instance.
 */
export function getAIModel(modelId: string) {
  if (!modelId) {
    throw new Error('No AI Model specified. A valid modelId is required.');
  }

  // If model is Gemini
  if (modelId.startsWith('gemini')) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY is not set in environment variables.');
    
    const google = createGoogleGenerativeAI({ apiKey });
    return google(modelId);
  }
  
  // If model is OpenAI
  if (modelId.startsWith('gpt-4')) {
    const apiKey = process.env.DEVFLOW_OPENAI_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('DEVFLOW_OPENAI_KEY is not set in environment variables.');
    
    const customOpenAI = createOpenAI({ apiKey });
    return customOpenAI(modelId);
  }

  // Fallback for completely unsupported models
  throw new Error(`The model "${modelId}" is not supported by the AI provider abstraction.`);
}
