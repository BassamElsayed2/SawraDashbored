-- Create branch_qr_codes table for storing QR codes for each branch
-- This table stores the generated QR codes that link to branch-specific survey pages

CREATE TABLE IF NOT EXISTS branch_qr_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    branch_id TEXT NOT NULL, -- Changed from UUID to TEXT to handle both UUID and integer IDs
    qr_code_url TEXT NOT NULL,
    qr_code_metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one QR code per branch
    UNIQUE(branch_id)
);

-- Create index for faster lookups by branch_id
CREATE INDEX IF NOT EXISTS idx_branch_qr_codes_branch_id ON branch_qr_codes(branch_id);

-- Create index for created_at for sorting
CREATE INDEX IF NOT EXISTS idx_branch_qr_codes_created_at ON branch_qr_codes(created_at);

-- Add RLS (Row Level Security) policies if needed
-- ALTER TABLE branch_qr_codes ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
-- GRANT SELECT, INSERT, UPDATE, DELETE ON branch_qr_codes TO authenticated;
-- GRANT SELECT ON branch_qr_codes TO anon;

-- Add comments for documentation
COMMENT ON TABLE branch_qr_codes IS 'Stores QR codes generated for each branch that link to branch-specific survey pages';
COMMENT ON COLUMN branch_qr_codes.branch_id IS 'Foreign key reference to the branches table';
COMMENT ON COLUMN branch_qr_codes.qr_code_url IS 'Data URL or file URL of the generated QR code image';
COMMENT ON COLUMN branch_qr_codes.qr_code_metadata IS 'JSON metadata about the QR code including generation options and survey URL';
