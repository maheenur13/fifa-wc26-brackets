# 🎯 User Login & Onboarding Flow

## New User Flow

```
┌─────────────────────────────────────┐
│  INTRO SCREEN                       │
│  ────────────────────────────       │
│                                     │
│  🏆 PREDICT THE BRACKET             │
│                                     │
│  [Enter your email     ]            │
│  [Start →]                          │
└─────────────────────────────────────┘
              ↓ (clicks Start)
              ↓
┌─────────────────────────────────────┐
│  NAME MODAL (popup)                 │
│  ────────────────────────────────   │
│                                     │
│  👤 What's Your Name?               │
│                                     │
│  Your name will be displayed        │
│  on your bracket...                 │
│                                     │
│  [Enter your name      ]            │
│  [Start Predicting →]               │
└─────────────────────────────────────┘
              ↓ (enters name)
              ↓
┌─────────────────────────────────────┐
│  BRACKET PREDICTION                 │
│  ────────────────────────────────   │
│                                     │
│  🏆 Pick your winners!              │
│  (Auto-syncs after each pick)       │
│  ☁ Syncing...                       │
└─────────────────────────────────────┘
```

---

## Existing User Flow (No Email)

```
┌─────────────────────────────────────┐
│  User returns to app                │
│  (has saved picks but no email)     │
└─────────────────────────────────────┘
              ↓
              ↓ (automatic)
┌─────────────────────────────────────┐
│  EMAIL MODAL (popup)                │
│  ────────────────────────────────   │
│                                     │
│  📧 Add Your Email                  │
│                                     │
│  We now require an email address    │
│  to sync your predictions...        │
│                                     │
│  [Enter your email     ]            │
│  [Continue]                         │
└─────────────────────────────────────┘
              ↓ (adds email)
              ↓
┌─────────────────────────────────────┐
│  BRACKET PREDICTION                 │
│  ────────────────────────────────   │
│                                     │
│  Welcome back! Continue where       │
│  you left off.                      │
│  ☁ Auto-syncing enabled             │
└─────────────────────────────────────┘
```

---

## Existing User Flow (Has Email & Name)

```
┌─────────────────────────────────────┐
│  User returns to app                │
│  (has email and name saved)         │
└─────────────────────────────────────┘
              ↓
              ↓ (automatic)
┌─────────────────────────────────────┐
│  BRACKET PREDICTION                 │
│  ────────────────────────────────   │
│                                     │
│  Welcome back, John!                │
│  Continue your bracket              │
│  ☁ Auto-syncing enabled             │
└─────────────────────────────────────┘
```

---

## Key Features

### 1. Simple Email Login

- Only email required on intro screen
- Clean, minimal interface
- Quick to get started

### 2. Name Collection

- Happens AFTER email is verified
- Modal popup prevents confusion
- Cannot be skipped (required for predictions)

### 3. Auto-Save

- Email + Name saved to localStorage
- No need to re-enter on return visits
- Seamless experience

### 4. Auto-Sync

- Every pick automatically synced to cloud
- 2-second debounce
- Visual indicator in header

### 5. Existing User Migration

- Old users without email get prompted
- Cannot continue without email
- Graceful upgrade path

---

## Technical Details

### Data Requirements

```javascript
{
  email: "user@example.com",  // Required, unique, validated
  name: "John Doe",            // Required, min 2 chars
  picks: {...},                // Bracket selections
  phase: "predict"             // Current state
}
```

### Validation Rules

**Email:**

- Required
- Must be valid format (regex)
- Unique in database
- Case-insensitive

**Name:**

- Required
- Minimum 2 characters
- Maximum 28 characters
- Used for display only

### Modal Behavior

- Cannot dismiss (no X button)
- Must complete to proceed
- Auto-focus on input
- Enter key submits
- Inline error messages

---

## Example User Journey

**First Time User:**

1. Lands on homepage
2. Sees "Enter your email"
3. Types: `john@example.com`
4. Clicks "Start →"
5. **Modal appears**: "What's Your Name?"
6. Types: `John Doe`
7. Clicks "Start Predicting →"
8. Bracket screen loads
9. Starts making picks
10. Auto-sync works! ✨

**Returning User (with email & name):**

1. Lands on homepage
2. Instantly redirected to bracket
3. Sees "Welcome back, John!"
4. Continues making picks
5. Auto-sync works! ✨

**Legacy User (no email):**

1. Opens app
2. **Modal appears**: "Add Your Email"
3. Types: `john@example.com`
4. Clicks "Continue"
5. Back to bracket
6. Can now auto-sync! ✨

---

## UX Benefits

✅ **Simple**: Only one field on intro (email)
✅ **Progressive**: Name asked after email verification
✅ **Safe**: Both email and name are required
✅ **Seamless**: Returning users skip everything
✅ **Forgiving**: Existing users guided to add email
✅ **Modern**: Auto-sync, no manual buttons

---

## Mobile Experience

- Email keyboard shows on mobile
- Touch targets are 52px tall
- Full-width buttons
- No tap delays
- Smooth animations
- Works perfectly on small screens

---

Ready to test! 🚀
