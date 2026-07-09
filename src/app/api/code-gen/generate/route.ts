import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { generateText } from 'ai';
import { getAIModel } from '@/lib/ai-provider';
import { getDefaultModelId } from '@/config/models';

// Allow streaming or generation up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    
    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse request
    const body = await req.json();
    const prompt = body.prompt;
    
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Valid prompt is required' }, { status: 400 });
    }

    // 3. AI Generation (Smart Language Detection + Code)
    // The prompt is structured to force JSON output so we can reliably extract both Language and Code.
    const systemPrompt = `You are an elite, senior Software Engineer and AI Coding Assistant.
Your task is to generate production-ready, highly optimized, and maintainable code based on the user's prompt.

CRITICAL RULES:
1. You MUST respond with ONLY a valid JSON object. No conversational text. No markdown formatting outside of the JSON string values.
2. The JSON object must have EXACTLY two properties: "language" and "code".
   - "language": A short string identifying the best programming language for the task (e.g., "typescript", "javascript", "python", "sql", "html", "react", "nextjs").
   - "code": The actual raw, complete generated code.
3. The generated code MUST be robust, follow best practices, include necessary imports (if applicable), and use strict typing where supported.
4. DO NOT include markdown fences (e.g. \`\`\`typescript) inside the "code" property value. Just the raw code.
5. If the request is ambiguous, default to TypeScript/Node.js or the most logical industry standard.

Example output format:
{
  "language": "typescript",
  "code": "export function add(a: number, b: number): number {\\n  return a + b;\\n}"
}`;

    const result = await generateText({
      model: getAIModel(getDefaultModelId()),
      system: systemPrompt,
      prompt: `Generate code for the following request:\n\n${prompt}`,
      temperature: 0.2, // Low temperature for more deterministic, precise code output
    });

    let rawOutput = result.text.trim();
    
    // 4. Strict Validation and Markdown Removal
    // Sometimes AI still wraps JSON in markdown fences like ```json ... ```
    if (rawOutput.startsWith('```')) {
      rawOutput = rawOutput.replace(/^```[a-z]*\n?/, '').replace(/\n?```$/, '');
    }
    
    let parsedData;
    try {
      parsedData = JSON.parse(rawOutput);
    } catch (parseError) {
      console.error("AI Output Parse Error. Raw Output:", rawOutput);
      return NextResponse.json({ 
        error: 'Failed to generate valid code structure. The AI produced an invalid response format. Please try again.' 
      }, { status: 500 });
    }

    if (!parsedData.code || !parsedData.language) {
      return NextResponse.json({ 
        error: 'Generation failed: AI response missing required code or language fields.' 
      }, { status: 500 });
    }

    let finalCode = parsedData.code;
    const finalLanguage = parsedData.language.toLowerCase();

    // Secondary cleanup: If the AI injected markdown fences inside the "code" property value
    if (finalCode.startsWith('\`\`\`')) {
      finalCode = finalCode.replace(/^\`\`\`[a-z]*\n?/, '').replace(/\n?\`\`\`$/, '');
    }

    // 5. Save to Database
    const { data: insertedRecord, error: dbError } = await supabase
      .from('code_generations')
      .insert({
        user_id: user.id,
        prompt: prompt,
        language: finalLanguage,
        generated_code: finalCode,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database Error:', dbError);
      return NextResponse.json({ error: 'Failed to save generated code to history.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, generation: insertedRecord });
    
  } catch (error: any) {
    console.error('Code Gen API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
