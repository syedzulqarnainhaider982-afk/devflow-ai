-- Create the projects table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active',
    tech_stack TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create the project_tasks table
CREATE TABLE IF NOT EXISTS public.project_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    status TEXT DEFAULT 'todo',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;

-- Create Policies for projects
CREATE POLICY "Users can view their own projects"
    ON public.projects FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects"
    ON public.projects FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
    ON public.projects FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
    ON public.projects FOR DELETE
    USING (auth.uid() = user_id);

-- Create Policies for project_tasks
CREATE POLICY "Users can view their own tasks"
    ON public.project_tasks FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks"
    ON public.project_tasks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks"
    ON public.project_tasks FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks"
    ON public.project_tasks FOR DELETE
    USING (auth.uid() = user_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_projects_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger for updated_at on projects
DROP TRIGGER IF EXISTS update_projects_updated_at ON public.projects;
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION update_projects_updated_at_column();

-- Add trigger for updated_at on project_tasks
DROP TRIGGER IF EXISTS update_project_tasks_updated_at ON public.project_tasks;
CREATE TRIGGER update_project_tasks_updated_at
    BEFORE UPDATE ON public.project_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_projects_updated_at_column();
