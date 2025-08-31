-- Complete QR Code Setup Script for Branch Feedback System
-- Run this script in your Supabase SQL editor

-- 1. Create the branch_qr_codes table (if it doesn't exist)
-- Note: This table already exists in your database with bigint branch_id
-- This script is for reference only

-- The actual table structure is:
-- CREATE TABLE public.branch_qr_codes (
--   id uuid not null default gen_random_uuid (),
--   qr_code_url text not null,
--   qr_code_metadata jsonb null default '{}'::jsonb,
--   created_at timestamp with time zone null default now(),
--   updated_at timestamp with time zone null default now(),
--   branch_id bigint null,
--   constraint branch_qr_codes_pkey primary key (id),
--   constraint branch_qr_codes_branch_id_fkey foreign KEY (branch_id) references branches (id)
-- );

-- 2. Add unique constraint if it doesn't exist
ALTER TABLE branch_qr_codes ADD CONSTRAINT IF NOT EXISTS branch_qr_codes_branch_id_unique UNIQUE (branch_id);

-- 2. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_branch_qr_codes_branch_id ON branch_qr_codes(branch_id);
CREATE INDEX IF NOT EXISTS idx_branch_qr_codes_created_at ON branch_qr_codes(created_at);

-- 3. Add comments for documentation
COMMENT ON TABLE branch_qr_codes IS 'Stores QR codes generated for each branch that link to branch-specific survey pages';
COMMENT ON COLUMN branch_qr_codes.branch_id IS 'Foreign key reference to the branches table (supports both UUID and integer IDs)';
COMMENT ON COLUMN branch_qr_codes.qr_code_url IS 'Data URL or file URL of the generated QR code image';
COMMENT ON COLUMN branch_qr_codes.qr_code_metadata IS 'JSON metadata about the QR code including generation options and survey URL';

-- 4. Grant necessary permissions (uncomment if needed)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON branch_qr_codes TO authenticated;
-- GRANT SELECT ON branch_qr_codes TO anon;

-- 5. Enable RLS if needed (uncomment if needed)
-- ALTER TABLE branch_qr_codes ENABLE ROW LEVEL SECURITY;

-- 6. Verify the table was created
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'branch_qr_codes'
ORDER BY ordinal_position;

-- 7. Show existing branches (for reference)
SELECT 
    id,
    name_ar,
    name_en,
    created_at
FROM branches
ORDER BY created_at DESC
LIMIT 5;
-- Add unique constraint for branch_id if it doesn't exist
