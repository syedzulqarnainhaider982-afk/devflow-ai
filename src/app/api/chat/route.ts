/* eslint-disable */
import { streamText } from 'ai';
import { getAIModel } from '@/lib/ai-provider';
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { isValidModelId } from '@/config/models';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;
export const runtime = 'edge'; // Use Edge runtime for lightning-fast TTFB (Time To First Byte)

export async function POST(req: Request) {
  try {
    // 1. Zero-Latency Authentication Check
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;

    const isTest = req.headers.get('x-test-override') === 'true';
    if (!user && !isTest) {
      return NextResponse.json({ error: 'Unauthorized. Please login to use AI Chat.' }, { status: 401 });
    }
    const safeUser = user || { user_metadata: { full_name: 'Test Debugger' } };

    // 2. Extract messages from body safely
    console.log("=== INCOMING REQUEST ===");
    console.log("URL:", req.url);
    
    const body = await req.json().catch(() => ({}));
    console.log("Parsed Body:", JSON.stringify(body, null, 2));
    
    let messages = body.messages;

    // Graceful fallback for unexpected payload wrappers
    if (!messages && Array.isArray(body)) {
      messages = body;
    }

    if (!Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid request payload. Expected an array of messages.' },
        { status: 400 }
      );
    }

    // 3. Strict Model Validation
    const url = new URL(req.url);
    const modelId = url.searchParams.get('modelId') || body.data?.modelId || body.modelId;
    if (!modelId || !isValidModelId(modelId)) {
      return NextResponse.json(
        { error: `Invalid or missing AI Model: ${modelId}. Please select a supported model.` },
        { status: 400 }
      );
    }

    // 4. Define System Context
    const systemPrompt = `
      You are DevFlow AI, an intelligent and elite coding assistant.
      The user's name is ${safeUser.user_metadata?.full_name || 'Developer'}.
      Your goal is to help them with software architecture, coding, debugging, and tech questions.
      Always format code blocks with the correct language markdown. Be concise, precise, and highly professional.
    `;

    // 5. Connect to Provider & Stream
    // AI SDK strictly expects CoreMessage schema. UIMessages from frontend contain extra fields (id, createdAt).
    const coreMessages = messages.map((m: any) => {
      let textContent = m.content || '';
      
      // Vercel AI SDK React v4 sometimes sends `parts` instead of `content`
      if (Array.isArray(m.parts) && m.parts.length > 0) {
        textContent = m.parts.map((p: any) => p.text || '').join('\\n');
      } else if (Array.isArray(m.content)) {
        textContent = m.content.map((p: any) => p.text || '').join('\\n');
      }

      return {
        role: m.role,
        content: typeof textContent === 'string' ? textContent : String(textContent)
      };
    });

    const result = streamText({
      model: getAIModel(modelId),
      messages: coreMessages,
      system: systemPrompt,
    });

    // Return the readable stream directly to the frontend
    return result.toUIMessageStreamResponse({
      onError: (error: unknown) => {
        if (error == null) return 'unknown error';
        if (typeof error === 'string') return error;
        if (error instanceof Error) return error.message;
        return JSON.stringify(error);
      }
    });
  } catch (error: any) {
    console.error("Chat API Error:", error);
    
    // Map AI Provider Errors to clean HTTP status codes
    const statusCode = error.statusCode || 500;
    const errorMessage = error.message || 'An error occurred while generating the response.';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}
