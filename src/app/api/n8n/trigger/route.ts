import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    
    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse request body
    const body = await req.json().catch(() => null);
    if (!body || !body.workflowId) {
      return NextResponse.json({ error: 'Workflow ID is required' }, { status: 400 });
    }

    const { workflowId, payload } = body;

    // 3. Fetch workflow to verify ownership and get webhook URL
    const { data: workflow, error: fetchError } = await supabase
      .from('n8n_workflows')
      .select('webhook_url, id')
      .eq('id', workflowId)
      .single();

    if (fetchError || !workflow) {
      console.error("Workflow fetch error:", fetchError);
      return NextResponse.json({ error: 'Workflow not found or access denied' }, { status: 404 });
    }

    if (!workflow.webhook_url) {
      return NextResponse.json({ error: 'No webhook URL configured for this workflow' }, { status: 400 });
    }

    // 4. Trigger the actual n8n webhook securely from backend
    console.log(`Triggering n8n webhook for workflow: ${workflowId}`);
    const n8nResponse = await fetch(workflow.webhook_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...payload,
        triggered_by: user.id,
        timestamp: new Date().toISOString()
      }),
    });

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text();
      console.error(`n8n Webhook failed with status ${n8nResponse.status}:`, errorText);
      return NextResponse.json(
        { error: `n8n webhook failed with status ${n8nResponse.status}` },
        { status: 502 }
      );
    }

    // Attempt to parse response if it's JSON
    let resultData = null;
    const contentType = n8nResponse.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      resultData = await n8nResponse.json();
    } else {
      resultData = { message: await n8nResponse.text() };
    }

    // 5. Update last_run_at timestamp in background (fire and forget)
    supabase
      .from('n8n_workflows')
      .update({ last_run_at: new Date().toISOString() })
      .eq('id', workflowId)
      .then(({ error }) => {
        if (error) console.error("Failed to update last_run_at:", error);
      });

    return NextResponse.json({
      success: true,
      message: 'Workflow triggered successfully',
      data: resultData
    });

  } catch (error: any) {
    console.error("n8n Trigger Route Error:", error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
