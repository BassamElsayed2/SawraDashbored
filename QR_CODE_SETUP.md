# QR Code Setup for Branch Feedback System

## Overview

This system allows you to generate QR codes for each branch that link directly to branch-specific feedback survey pages. When customers scan the QR code, they are taken to a survey page specifically for that branch.

## Database Setup

### 1. Create the branch_qr_codes table

Run the SQL script in `setup-qr-codes.sql` in your Supabase database:

```sql
-- Execute the contents of setup-qr-codes.sql
```

The table already exists in your database with the following structure:

- `id`: Unique identifier for the QR code (UUID)
- `branch_id`: Foreign key to the branches table (BIGINT - references branches.id)
- `qr_code_url`: Data URL or file URL of the generated QR code image
- `qr_code_metadata`: JSON metadata about the QR code
- `created_at` and `updated_at`: Timestamps

## Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# Enable QR code generation (defaults to true in development)
NEXT_PUBLIC_ENABLE_QR_CODE_GENERATION=true

# App URL for generating survey links
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## How It Works

### 1. QR Code Generation

- Each branch can have one QR code
- QR codes are generated as data URLs (base64 encoded images)
- The QR code contains a link to `/feedback-survey/[branchId]`

### 2. Survey URL Structure

QR codes link to: `{APP_URL}/feedback-survey/{branchId}`

For example:

- `http://localhost:3000/feedback-survey/123e4567-e89b-12d3-a456-426614174000`

### 3. Features Available

#### In the Branches Dashboard:

- **Generate QR Code**: Click the QR code icon to generate a QR code for a branch
- **View QR Code**: Click the eye icon to view the generated QR code in a modal
- **Download QR Code**: Click the download icon to download the QR code as a PNG file

#### QR Code Modal:

- Displays the QR code image
- Shows creation date
- Provides download option
- Explains that the QR code leads to the branch-specific survey

## Usage Instructions

### For Administrators:

1. **Navigate to Branches Dashboard**

   - Go to `/dashboard/branches`

2. **Generate QR Code for a Branch**

   - Find the branch in the table
   - Click the QR code icon (📱) in the "رمز QR" column
   - Wait for the QR code to be generated

3. **View/Download QR Code**

   - Once generated, you'll see two icons:
     - 👁️ (View): Opens a modal to view the QR code
     - ⬇️ (Download): Downloads the QR code as PNG file

4. **Print and Display**
   - Download the QR code
   - Print it and display it at the branch location
   - Customers can scan it with their phones to access the survey

### For Customers:

1. **Scan QR Code**

   - Use any QR code scanner app on your phone
   - Point camera at the QR code displayed at the branch

2. **Complete Survey**
   - You'll be taken to a survey page specific to that branch
   - Fill out the feedback form
   - Submit your responses

## Technical Details

### QR Code Generation Process:

1. System fetches branch information
2. Generates survey URL: `{APP_URL}/feedback-survey/{branchId}`
3. Creates QR code image using the survey URL
4. Stores QR code as data URL in database
5. Associates QR code with the branch

### QR Code Options:

- **Size**: 300x300 pixels (default)
- **Format**: PNG
- **Error Correction**: Medium level
- **Colors**: Black on white background

### Database Relationships:

- `branch_qr_codes.branch_id` → `branches.id`
- One QR code per branch (enforced by UNIQUE constraint)
- Cascade delete: if branch is deleted, QR code is also deleted

## Troubleshooting

### QR Code Not Generating:

1. Check if `NEXT_PUBLIC_ENABLE_QR_CODE_GENERATION=true`
2. Verify database table exists (run `setup-qr-codes.sql`)
3. Check browser console for errors
4. Ensure branch exists in database
5. If you see UUID errors, make sure the branch_qr_codes table uses BIGINT for branch_id column (which matches your existing table structure)

### QR Code Not Working:

1. Verify `NEXT_PUBLIC_APP_URL` is set correctly
2. Check if survey page exists at `/feedback-survey/[branchId]`
3. Test the survey URL manually in browser

### Database Issues:

1. Run the SQL script to create the table
2. Check database permissions
3. Verify foreign key relationships

## Security Considerations

- QR codes are publicly accessible (they need to be scannable)
- Survey pages should have appropriate rate limiting
- Consider implementing CAPTCHA for survey submissions
- Monitor for spam submissions

## Future Enhancements

- QR code customization (colors, logo overlay)
- Analytics tracking for QR code scans
- Bulk QR code generation
- QR code expiration dates
- Different QR codes for different survey types
