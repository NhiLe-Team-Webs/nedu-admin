-- Migration: Add format column and remove course_type from program_description
-- Created at: 2026-01-10

-- Add format column
ALTER TABLE public.program_description ADD COLUMN IF NOT EXISTS format text;

-- Remove course_type column (no longer needed, 30day = Membership default)
ALTER TABLE public.program_description DROP COLUMN IF EXISTS course_type;

-- Refresh PostgREST cache
NOTIFY pgrst, 'reload schema';
