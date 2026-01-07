-- Rollback: Remove benefits and mentor tables
-- Created: 2026-01-07

-- Drop tables in reverse order (respect foreign keys)
DROP TABLE IF EXISTS public.program_benefits CASCADE;
DROP TABLE IF EXISTS public.program_mentors CASCADE;
DROP TABLE IF EXISTS public.mentor_description CASCADE;
DROP TABLE IF EXISTS public.mentors CASCADE;

-- Drop indexes (if tables are not dropped)
DROP INDEX IF EXISTS public.idx_program_benefits_program_lang;
DROP INDEX IF EXISTS public.idx_program_mentors_program;
DROP INDEX IF EXISTS public.idx_program_mentors_mentor;
DROP INDEX IF EXISTS public.idx_mentor_description_lang;
