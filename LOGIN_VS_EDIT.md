# 🔐 Login vs Edit Profile - Separate Pages

## ✅ What Changed

Email is now **locked** after first login. Only the name can be edited.

---

## 📱 Login Page (New User)

When `email` and `name` are **empty**:

```
┌─────────────────────────────────┐
│   PREDICT THE BRACKET           │
│                                 │
│   The Round of 32 is locked     │
│   in. Call every knockout...    │
│                                 │
│   [Enter your email        ]    │
│   [Start →]                     │
│                                 │
│   32 Teams | 31 Games | ...     │
└─────────────────────────────────┘
```

**Flow:**

1. Enter email only
2. Click "Start →"
3. System checks database
4. If found → Load data
5. If not → Show name modal

---

## ✏️ Edit Profile Page

When user clicks "edit" button (has email + name):

```
┌─────────────────────────────────┐
│   EDIT PROFILE                  │
│                                 │
│   Update your name. Email       │
│   cannot be changed...          │
│                                 │
│   EMAIL (LOCKED)                │
│   🔒 jahidun.nur.mahee@gmail    │
│                                 │
│   [Enter your name        ]     │
│   [Save & Continue →]           │
│                                 │
│   ← Cancel and go back          │
└─────────────────────────────────┘
```

**Flow:**

1. Email is displayed with 🔒 lock icon
2. Email field is NOT editable
3. Can only change name
4. Click "Save & Continue" to update
5. Or "Cancel" to go back

---

## 🎯 Key Differences

| Feature       | Login Page                 | Edit Page              |
| ------------- | -------------------------- | ---------------------- |
| Title         | "PREDICT THE BRACKET"      | "EDIT PROFILE"         |
| Description   | Tournament info            | Edit instructions      |
| Email field   | Editable input             | Locked display (🔒)    |
| Name field    | Not shown                  | Editable input         |
| Button        | "Start →" or "Checking..." | "Save & Continue →"    |
| Cancel option | Resume bracket link        | "← Cancel and go back" |
| Stats strip   | Shown                      | Shown                  |

---

## 🔒 Why Email is Locked

1. **Identity**: Email is used to identify predictions across devices
2. **Security**: Prevents account takeover
3. **Data integrity**: Ensures one email = one prediction
4. **Cross-device sync**: Email is the unique key

---

## 🔄 How Detection Works

```typescript
const isEditing = email.trim() !== "" && name.trim() !== "";

if (isEditing) {
  // Show edit profile page
  // - Lock email
  // - Allow name editing
} else {
  // Show login page
  // - Allow email input
  // - No name field (shown via modal)
}
```

---

## 🧪 Test Cases

### Test 1: New User Login

```
1. Clear localStorage
2. Refresh page
3. Should see: Login page with email input
4. Enter email → Click Start
5. See name modal
```

### Test 2: Existing User Editing

```
1. Have email + name in state
2. Click "edit" button in header
3. Should see: Edit profile page
4. Email is locked with 🔒
5. Can change name
6. Click "Save & Continue"
```

### Test 3: Cross-Device Sync

```
1. Device A: Login with email
2. System loads existing data
3. Goes straight to bracket
4. No edit page shown (correct)
```

---

## 📝 User Experience

### Good UX:

✅ Clear distinction between login and edit
✅ Email locked prevents accidental changes
✅ Cancel button on edit page
✅ Visual lock icon 🔒 makes it obvious
✅ Helpful description text

### What Users Can Do:

- ✅ Login with email
- ✅ Edit their name anytime
- ❌ Cannot change email (by design)

---

## 🚀 Future Enhancement Ideas

1. **Change Email Feature**:
   - Add "Change Email" button
   - Send verification to new email
   - Migrate predictions to new email

2. **Delete Account**:
   - Add "Delete My Predictions" button
   - Confirm before deletion
   - Clear all data

3. **Logout**:
   - Add logout button in edit page
   - Clear localStorage
   - Return to login

4. **Profile Picture**:
   - Allow users to upload avatar
   - Display next to name

---

Now the login and edit experiences are properly separated! 🎉
