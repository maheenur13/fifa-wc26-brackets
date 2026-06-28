# 🔍 Debug Steps - Email Not Loading Data

## Step 1: Open Browser Console

Press **F12** or **Cmd+Option+I** to open DevTools
Go to **Console** tab

## Step 2: Check Current State

Run this in console:

```javascript
// Check localStorage
console.log(
  "localStorage:",
  JSON.parse(localStorage.getItem("wc26-predictor-v1")),
);

// Check what email you're using
console.log("Current URL:", window.location.href);
```

## Step 3: Test API Directly

Run this in console:

```javascript
// Test if email exists in database
fetch("/api/predictions?email=jahidun.nur.mahee@gmail.com")
  .then((r) => r.json())
  .then((data) => {
    console.log("API Response:", data);
    if (data.prediction) {
      console.log("✅ Found prediction:", data.prediction);
    } else {
      console.log("❌ No prediction found for this email");
    }
  })
  .catch((err) => console.error("❌ API Error:", err));
```

## Step 4: Check Database Directly

Go to Supabase:
https://supabase.com/dashboard/project/qbzzxrawsmonllgpxybs/editor

Run this SQL:

```sql
-- Check if email column exists
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'predictions';

-- Check if your email exists
SELECT * FROM predictions WHERE email = 'jahidun.nur.mahee@gmail.com';

-- Check all predictions
SELECT id, name, email, picks_count, phase FROM predictions;
```

## Step 5: Check Console Logs

When you click "Start", you should see:

```
Start clicked, email: jahidun.nur.mahee@gmail.com, name:
(checking email...)
```

What do you see instead?

## Common Issues:

### Issue 1: Database Not Migrated

**Symptom:** API returns error about email column
**Fix:** Run SQL migration in Supabase

### Issue 2: Email Doesn't Exist Yet

**Symptom:** API returns `{ prediction: null }`
**Fix:** This is normal for first-time users

### Issue 3: Email Stored Differently

**Symptom:** Saved as lowercase but searching with uppercase
**Fix:** Check SQL: `SELECT * FROM predictions;`

### Issue 4: Old Data Without Email

**Symptom:** Old predictions exist but have no email
**Fix:** They can't be found - need to create new one

## What Should Happen:

### Scenario A: Email Exists

```
1. Enter: jahidun.nur.mahee@gmail.com
2. Click "Start"
3. Console: "✅ Found existing prediction for email: {...}"
4. Loads name, picks automatically
5. Goes to bracket screen
```

### Scenario B: Email Doesn't Exist

```
1. Enter: jahidun.nur.mahee@gmail.com
2. Click "Start"
3. Console: "📝 No existing data, showing name modal"
4. Name modal appears
5. Enter name
6. Start fresh bracket
```

## Quick Fix Commands:

### Clear Everything and Start Fresh:

```javascript
// In browser console
localStorage.clear();
location.reload();
```

### Test API Endpoint:

```bash
# In terminal
curl "http://localhost:3000/api/predictions?email=jahidun.nur.mahee@gmail.com"
```

## Please Share:

1. What do you see in console when clicking "Start"?
2. What does the API test return?
3. Did you run the database migration?
4. Screenshot of Supabase table editor showing columns?

---

**Let me know what you find and I'll help fix it!** 🚀
