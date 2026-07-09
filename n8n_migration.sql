-- Create the n8n_workflows table
CREATE TABLE IF NOT EXISTS public.n8n_workflows (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    webhook_url TEXT,
    workflow_json JSONB,
    category TEXT DEFAULT 'Uncategorized',
    tags TEXT[] DEFAULT '{}',
    is_favorite BOOLEAN DEFAULT FALSE,
    last_run_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.n8n_workflows ENABLE ROW LEVEL SECURITY;

-- Create policies so users can only manage their own workflows
CREATE POLICY "Users can view their own workflows"
    ON public.n8n_workflows FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workflows"
    ON public.n8n_workflows FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workflows"
    ON public.n8n_workflows FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workflows"
    ON public.n8n_workflows FOR DELETE
    USING (auth.uid() = user_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for n8n_workflows to auto-update updated_at
DROP TRIGGER IF EXISTS set_n8n_workflows_updated_at ON public.n8n_workflows;
CREATE TRIGGER set_n8n_workflows_updated_at
    BEFORE UPDATE ON public.n8n_workflows
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
