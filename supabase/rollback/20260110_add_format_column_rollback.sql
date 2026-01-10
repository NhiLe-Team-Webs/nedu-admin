-- Rollback: Remove format column and restore course_type to program_description
-- Created at: 2026-01-10

-- Remove format column
ALTER TABLE public.program_description DROP COLUMN IF EXISTS format;

-- Restore course_type column
ALTER TABLE public.program_description ADD COLUMN IF NOT EXISTS course_type text;

-- Refresh PostgREST cache
NOTIFY pgrst, 'reload schema';
