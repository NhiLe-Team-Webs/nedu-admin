-- Rollback: Simplified Mentor System and Course Enhancements
-- Created at: 2026-01-08

-- 1. Remove junction table
DROP TABLE IF EXISTS public.program_mentor;

-- 2. Remove simplified mentor table
DROP TABLE IF EXISTS public.mentor;

-- 3. Remove extra fields from program_description
ALTER TABLE public.program_description 
DROP COLUMN IF EXISTS topic,
DROP COLUMN IF EXISTS short_description,
DROP COLUMN IF EXISTS content,
DROP COLUMN IF EXISTS video_url,
DROP COLUMN IF EXISTS highlight_features;

-- 4. Refresh PostgREST cache
NOTIFY pgrst, 'reload schema';
