-- Create the code_generations table
CREATE TABLE IF NOT EXISTS public.code_generations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    prompt TEXT NOT NULL,
    language TEXT NOT NULL,
    generated_code TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.code_generations ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Users can view their own generated code"
    ON public.code_generations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own generated code"
    ON public.code_generations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own generated code"
    ON public.code_generations FOR DELETE
    USING (auth.uid() = user_id);

-- Create updated_at trigger function if it doesn't exist (reuses existing one if possible)
CREATE OR REPLACE FUNCTION update_code_generations_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS update_code_generations_updated_at ON public.code_generations;
CREATE TRIGGER update_code_generations_updated_at
    BEFORE UPDATE ON public.code_generations
    FOR EACH ROW
    EXECUTE FUNCTION update_code_generations_updated_at_column();
