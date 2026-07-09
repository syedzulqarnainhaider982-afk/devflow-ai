-- Create the project_assets table
CREATE TABLE IF NOT EXISTS public.project_assets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    asset_type TEXT NOT NULL CHECK (asset_type IN ('code', 'website', 'chat', 'n8n')),
    asset_id UUID NOT NULL,
    title TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    -- Ensure an asset can only be linked once to a specific project
    UNIQUE(project_id, asset_type, asset_id)
);

-- Enable RLS
ALTER TABLE public.project_assets ENABLE ROW LEVEL SECURITY;

-- Create Policies for project_assets
CREATE POLICY "Users can view their own project assets"
    ON public.project_assets FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own project assets"
    ON public.project_assets FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own project assets"
    ON public.project_assets FOR DELETE
    USING (auth.uid() = user_id);
