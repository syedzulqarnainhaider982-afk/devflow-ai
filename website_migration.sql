-- Create the website_generations table
CREATE TABLE IF NOT EXISTS public.website_generations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    prompt TEXT NOT NULL,
    brand_name TEXT NOT NULL,
    generated_code TEXT NOT NULL,
    framework TEXT NOT NULL DEFAULT 'html-tailwind', -- Future proofing for React/Next.js
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.website_generations ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Users can view their own generated websites"
    ON public.website_generations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own generated websites"
    ON public.website_generations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own generated websites"
    ON public.website_generations FOR DELETE
    USING (auth.uid() = user_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS update_website_generations_updated_at ON public.website_generations;
CREATE TRIGGER update_website_generations_updated_at
    BEFORE UPDATE ON public.website_generations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
