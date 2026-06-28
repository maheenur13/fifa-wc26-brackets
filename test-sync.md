# Testing Checklist

## 1. Database Migration

❌ **CRITICAL**: Did you run the SQL migration in Supabase?

Go to: https://supabase.com/dashboard/project/qbzzxrawsmonllgpxybs/editor

Run this:

```sql
DROP TABLE IF EXISTS public.predictions CASCADE;

CREATE TABLE public.predictions (
  id uuid primary key default gen_random_uuid(),
  client_id text unique not null,
  name text not null,
  email text not null,
  picks jsonb not null default '{}'::jsonb,
  phase text not null default 'intro'
    check (phase in ('intro', 'predict', 'result')),
  champion text,
  picks_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

CREATE INDEX predictions_updated_at_idx ON public.predictions (updated_at desc);
CREATE INDEX predictions_champion_idx ON public.predictions (champion);
CREATE UNIQUE INDEX predictions_email_idx ON public.predictions (lower(email));

ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;
```

## 2. Dev Server

- Stop current server (Ctrl+C)
- Restart: `pnpm dev`

## 3. Browser Testing

1. Open DevTools (F12)
2. Go to Console tab
3. Clear localStorage:
   - Application tab → Local Storage → Clear All
4. Refresh page
5. Enter email: `test@example.com`
6. Click "Start →"

## 4. What to Check in Console

You should see these logs:

```
Start clicked, email: test@example.com, name:
Showing name modal, prefilling with: test
showNameModal changed to: true
```

## 5. What Should Happen

✅ Name modal should pop up with pre-filled "test"
✅ You enter/edit your name
✅ Click "Start Predicting →"
✅ Bracket screen loads
✅ When you make picks, auto-sync happens

## 6. If Modal Doesn't Appear

Check console for:

- Any red errors?
- Are the console.log messages appearing?
- What's the value of `showNameModal`?

## 7. If Sync Doesn't Work

Possible issues:

- Database migration not run (email column doesn't exist)
- Network error (check Network tab)
- 400/500 errors from `/api/predictions`

Check Network tab:

1. Make a pick
2. Wait 2 seconds
3. Look for POST to `/api/predictions`
4. Check response - should be 200 OK

## 8. Common Errors

**"email is required"** → Database needs email column
**"Invalid email"** → Check validation regex
**Nothing happens** → Check console logs
**Modal doesn't show** → Check CSS z-index

---

**Current Status:**

- ❓ Database migrated?
- ❓ Dev server restarted?
- ❓ Console logs showing?
- ❓ Modal visible?

Please answer these and share console output!
