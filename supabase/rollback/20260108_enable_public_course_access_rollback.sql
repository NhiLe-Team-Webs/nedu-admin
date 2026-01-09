-- Rollback: Disable Public Access and RLS for Course Data
-- Created at: 2026-01-08

-- 1. Drop Select Policies
DROP POLICY IF EXISTS "Allow public select on program" ON public.program;
DROP POLICY IF EXISTS "Allow public select on program_description" ON public.program_description;
DROP POLICY IF EXISTS "Allow public select on mentor" ON public.mentor;
DROP POLICY IF EXISTS "Allow public select on program_mentor" ON public.program_mentor;

-- 2. Disable RLS (Optional, depending on security requirements)
ALTER TABLE public.program DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_description DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_mentor DISABLE ROW LEVEL SECURITY;

-- 3. Refresh PostgREST cache
NOTIFY pgrst, 'reload schema';
