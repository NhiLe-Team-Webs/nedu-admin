-- Migration: Add course_type and is_featured columns to program_description
-- And create dedicated table for 30-day challenge course
-- Created: 2026-01-10

-- ============================================================================
-- STEP 1: Add new columns to program_description
-- ============================================================================

-- Add course_type column to store the business model type ('Course' or 'Membership')
ALTER TABLE program_description
ADD COLUMN IF NOT EXISTS course_type TEXT DEFAULT 'Course';

-- Add is_featured column to store whether the course is starred/featured
ALTER TABLE program_description
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;

-- ============================================================================
-- STEP 2: Create dedicated table for 30-day challenge
-- ============================================================================

-- Create the program_30day_challenge table with fixed 3 benefits
CREATE TABLE IF NOT EXISTS program_30day_challenge (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    program_id BIGINT NOT NULL UNIQUE REFERENCES program(id) ON DELETE CASCADE,
    
    -- Pricing
    monthly_price NUMERIC DEFAULT 0,
    membership_price NUMERIC DEFAULT 0,
    
    -- Benefit 1
    benefit_1_title TEXT,
    benefit_1_quote TEXT,
    benefit_1_description TEXT,
    
    -- Benefit 2
    benefit_2_title TEXT,
    benefit_2_quote TEXT,
    benefit_2_description TEXT,
    
    -- Benefit 3
    benefit_3_title TEXT,
    benefit_3_quote TEXT,
    benefit_3_description TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comment for documentation
COMMENT ON TABLE program_30day_challenge IS 'Dedicated table for 30-day challenge course with fixed 3 benefits';

-- ============================================================================
-- STEP 3: Insert initial row for program_id = 82 (THỬ THÁCH 30 NGÀY)
-- ============================================================================

INSERT INTO program_30day_challenge (program_id)
VALUES (82)
ON CONFLICT (program_id) DO NOTHING;

-- ============================================================================
-- STEP 4: Migrate existing benefit data from program_description.privilege
-- ============================================================================

UPDATE program_30day_challenge SET
    benefit_1_title = (SELECT privilege->0->>'title' FROM program_description WHERE program_id = 82 AND lang_id = 1),
    benefit_1_quote = (SELECT privilege->0->>'quoteText' FROM program_description WHERE program_id = 82 AND lang_id = 1),
    benefit_1_description = (SELECT privilege->0->>'quote' FROM program_description WHERE program_id = 82 AND lang_id = 1),
    benefit_2_title = (SELECT privilege->1->>'title' FROM program_description WHERE program_id = 82 AND lang_id = 1),
    benefit_2_quote = (SELECT privilege->1->>'quoteText' FROM program_description WHERE program_id = 82 AND lang_id = 1),
    benefit_2_description = (SELECT privilege->1->>'quote' FROM program_description WHERE program_id = 82 AND lang_id = 1),
    benefit_3_title = (SELECT privilege->2->>'title' FROM program_description WHERE program_id = 82 AND lang_id = 1),
    benefit_3_quote = (SELECT privilege->2->>'quoteText' FROM program_description WHERE program_id = 82 AND lang_id = 1),
    benefit_3_description = (SELECT privilege->2->>'quote' FROM program_description WHERE program_id = 82 AND lang_id = 1)
WHERE program_id = 82;

-- ============================================================================
-- STEP 5: Sync is_featured from program.highlight_program
-- ============================================================================

UPDATE program_description pd
SET is_featured = (SELECT p.highlight_program = 1 FROM program p WHERE p.id = pd.program_id)
WHERE EXISTS (SELECT 1 FROM program WHERE id = pd.program_id);

-- ============================================================================
-- STEP 6: Set course_type for Membership courses (program_type = 2)
-- ============================================================================

UPDATE program_description pd
SET course_type = 'Membership'
FROM program p
WHERE pd.program_id = p.id AND p.program_type = 2;
