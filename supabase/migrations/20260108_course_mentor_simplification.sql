-- Migration: Simplified Mentor System and Course Enhancements
-- Created at: 2026-01-08
-- Targets: Vietnamese-first build with simplified structure

-- 1. Add extra fields to program_description for richer content
-- Note: 'hashtag' in 'program' table is used for topic, but we'll add 'topic' here for more flexibility
ALTER TABLE public.program_description 
ADD COLUMN IF NOT EXISTS topic text,
ADD COLUMN IF NOT EXISTS short_description text,
ADD COLUMN IF NOT EXISTS content text, 
ADD COLUMN IF NOT EXISTS video_url text, 
ADD COLUMN IF NOT EXISTS highlight_features jsonb DEFAULT '[]'::jsonb;

-- 2. Create a simplified mentor table (Single table for VN-first)
CREATE TABLE IF NOT EXISTS public.mentor (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name text NOT NULL,
    role text, -- E.g., "Founder & CEO"
    bio text, -- Biography content
    avatar_url text,
    status smallint DEFAULT 1, -- 0: Hidden, 1: Visible
    is_featured boolean DEFAULT false,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 3. Create junction table for programs and mentors
CREATE TABLE IF NOT EXISTS public.program_mentor (
    program_id bigint NOT NULL REFERENCES public.program(id) ON DELETE CASCADE,
    mentor_id bigint NOT NULL REFERENCES public.mentor(id) ON DELETE CASCADE,
    PRIMARY KEY (program_id, mentor_id)
);

-- 4. Refresh PostgREST cache
NOTIFY pgrst, 'reload schema';
