-- Migration: Enable Row Level Security and Public Access for Course Data
-- Created at: 2026-01-08
-- Description: Allows unauthenticated (anon) users to view programs and mentors

-- 1. Enable RLS on tables
ALTER TABLE public.program ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_description ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_mentor ENABLE ROW LEVEL SECURITY;

-- 2. Create Select Policies for Anonymous Users
DO $$ 
BEGIN
    -- Program Policy
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public select on program') THEN
        CREATE POLICY "Allow public select on program" ON public.program FOR SELECT TO anon USING (true);
    END IF;

    -- Program Description Policy
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public select on program_description') THEN
        CREATE POLICY "Allow public select on program_description" ON public.program_description FOR SELECT TO anon USING (true);
    END IF;

    -- Mentor Policy
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public select on mentor') THEN
        CREATE POLICY "Allow public select on mentor" ON public.mentor FOR SELECT TO anon USING (true);
    END IF;

    -- Program Mentor Policy
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public select on program_mentor') THEN
        CREATE POLICY "Allow public select on program_mentor" ON public.program_mentor FOR SELECT TO anon USING (true);
    END IF;
END $$;

-- 3. Refresh PostgREST cache
NOTIFY pgrst, 'reload schema';
