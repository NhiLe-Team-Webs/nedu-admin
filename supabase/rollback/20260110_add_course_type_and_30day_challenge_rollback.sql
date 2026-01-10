-- Rollback: Remove course_type, is_featured columns and drop 30-day challenge table
-- Created: 2026-01-10
-- Run this script to undo the migration

-- ============================================================================
-- STEP 1: Drop the 30-day challenge table
-- ============================================================================

DROP TABLE IF EXISTS program_30day_challenge;

-- ============================================================================
-- STEP 2: Remove new columns from program_description
-- ============================================================================

ALTER TABLE program_description DROP COLUMN IF EXISTS course_type;
ALTER TABLE program_description DROP COLUMN IF EXISTS is_featured;

-- ============================================================================
-- Done! Schema has been rolled back to previous state.
-- ============================================================================
