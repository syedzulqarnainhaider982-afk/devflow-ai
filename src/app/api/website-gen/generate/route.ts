import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { generateText } from 'ai';
import { getAIModel } from '@/lib/ai-provider';
import { getDefaultModelId } from '@/config/models';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    
    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse request
    const { prompt, brandName } = await req.json();
    
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // 3. Generate Website Code using Gemini
    const systemPrompt = `You are an expert Frontend Developer and UI/UX Designer.
Your task is to generate a complete, production-ready, beautiful, modern, and responsive website using HTML5 and Tailwind CSS (via CDN).

CRITICAL RULES:
1. ONLY output valid HTML code. No markdown fences like \`\`\`html.
2. Must start with <!DOCTYPE html> and end with </html>.
3. Include <script src="https://cdn.tailwindcss.com"></script> and FontAwesome (if needed) in the <head>.
4. IMAGES (CRITICAL): You MUST use 100% reliable image URLs. Use EXACTLY this format: https://images.unsplash.com/photo-[REAL_ID] if you know a real one, OR use https://picsum.photos/seed/[RANDOM_WORD]/800/600. DO NOT use source.unsplash.com (it is deprecated and broken). Every single <img> tag MUST have a fallback like: onerror="this.src='https://placehold.co/800x600?text=Image+Unavailable'".
5. STATIC MARKUP ONLY (CRITICAL): NEVER use JavaScript array mapping, template literals, or raw logic (like .map() or \`\${variable}\`) inside the HTML body to generate content. You MUST write out the full, static HTML markup manually for EVERY card, list item, or section.
6. BUTTONS & INTERACTIONS (CRITICAL):
   - ALL CTA buttons MUST be anchor tags (\`<a href="#contact">\`) that smoothly scroll to a valid \`<section id="contact">\` that ACTUALLY EXISTS on the page.
   - If a button implies a modal (like "Login"), write a functional hidden modal div and use vanilla JS to toggle it.
   - ABSOLUTELY NO fake alerts. Do NOT write onclick="alert(...)". Do NOT write "Redirecting...". Every interaction must feel like a real standalone Single Page Application.
7. SCROLLING: Ensure smooth scrolling behavior by adding <style>html { scroll-behavior: smooth; }</style> to the head.
8. QUALITY: The design must be extremely premium, utilizing modern layout patterns (Hero sections, Features, Testimonials, Pricing, Footer), proper whitespace, elegant typography, and hover effects.
9. Make the output look like a fully working standalone Single Page Application (SPA).
10. The Brand Name is: "${brandName || 'My Brand'}". Use this where appropriate in the header/hero.`;

    const result = await generateText({
      model: getAIModel(getDefaultModelId()),
      system: systemPrompt,
      prompt: `Generate the website based on this description:\n\n${prompt}`,
      temperature: 0.7,
    });

    let generatedCode = result.text.trim();
    
    // Clean up any potential markdown fences just in case the AI ignores the rule
    if (generatedCode.startsWith('```html')) {
      generatedCode = generatedCode.replace(/^```html\n?/, '');
    } else if (generatedCode.startsWith('```')) {
      generatedCode = generatedCode.replace(/^```\n?/, '');
    }
    if (generatedCode.endsWith('```')) {
      generatedCode = generatedCode.replace(/\n?```$/, '');
    }
    
    generatedCode = generatedCode.trim();

    // 4. Validate output to ensure no raw JS/template literals leaked into the HTML
    const rawJSLeakPattern = /(\.map\s*\()|(\.join\s*\()|(\$\{[a-zA-Z_])/;
    if (rawJSLeakPattern.test(generatedCode)) {
      console.error("Validation Error: AI leaked raw JS logic into HTML.");
      return NextResponse.json({ 
        error: 'Generation Failed: The AI output raw Javascript code instead of static HTML. Please try generating again.' 
      }, { status: 400 });
    }

    // 5. Save to Database
    const { data: insertedRecord, error: dbError } = await supabase
      .from('website_generations')
      .insert({
        user_id: user.id,
        prompt,
        brand_name: brandName || 'My Brand',
        generated_code: generatedCode,
        framework: 'html-tailwind'
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database Error:', dbError);
      return NextResponse.json({ error: 'Failed to save generated website' }, { status: 500 });
    }

    return NextResponse.json({ success: true, website: insertedRecord });
    
  } catch (error: any) {
    console.error('Generation API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
