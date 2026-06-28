# Database Migration Guide

## Adding Email Field to Existing Database

If you already have a Supabase database running with the old schema (without email), follow these steps:

### Option 1: Fresh Start (Recommended if no important data)

1. Go to Supabase SQL Editor
2. Run:

```sql
DROP TABLE IF EXISTS public.predictions CASCADE;
```

3. Run the full schema from `supabase/schema.sql`

### Option 2: Migration (If you have existing data)

1. Go to Supabase SQL Editor
2. Run the migration script from `supabase/migration-add-email.sql`
3. Manually update existing records with email addresses, or they won't be able to sync anymore:

```sql
-- Example: Set a placeholder email for existing records
UPDATE public.predictions
SET email = 'placeholder+' || id || '@example.com'
WHERE email IS NULL;
```

4. Then make email NOT NULL:

```sql
ALTER TABLE public.predictions ALTER COLUMN email SET NOT NULL;
```

### New Database Setup

If you're setting up a fresh database, just run `supabase/schema.sql` directly. It includes the email field from the start.

## Testing

After migration:

1. Restart your Next.js dev server
2. Clear browser localStorage or use incognito mode
3. Test the sign-up flow with name and email
4. Verify auto-sync works when making picks
5. Check admin dashboard shows emails

## Email Validation

The system enforces:

- Email is required for all new predictions
- Basic email format validation (regex)
- Unique emails per prediction (case-insensitive)
- Email stored as lowercase in database
