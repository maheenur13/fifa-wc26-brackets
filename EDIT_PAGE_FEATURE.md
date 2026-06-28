# Edit Profile Page - Separate Route

## Overview

Created a dedicated `/edit` page for editing user profile. This separates the edit functionality from the login flow, providing a cleaner UX and proper routing.

## What Changed

### 1. New Route: `/edit`

- **URL**: `http://localhost:3000/edit`
- **File**: `src/app/edit/page.tsx`
- **Component**: `EditProfile` component

### 2. New Component: EditProfile

- **File**: `src/components/EditProfile.tsx`
- Dedicated component for profile editing
- Shows locked email field (cannot be changed)
- Editable name field
- Save changes button
- Back to bracket button
- Danger zone with logout option

### 3. Updated Predictor Component

- **Removed** internal edit mode state (`isEditMode`)
- **Changed** edit button to use `router.push("/edit")` for navigation
- **Simplified** intro phase - now only shows login screen
- **Cleaner** code with separation of concerns

### 4. New CSS Styles

Added to `src/components/predictor.module.css`:

- `.editField` - Form field styling for edit page
- `.editActions` - Button container for save/cancel
- `.dangerZone` - Red/warning styled area for logout
- `.dangerHeader`, `.dangerIcon`, `.dangerTitle` - Danger zone header
- `.dangerText` - Danger zone description text

## User Flow

### Before (Old Behavior)

1. User clicks "edit" in header
2. Page changes to show edit form in same route
3. Shows email (locked) + name (editable)
4. Save button updates state and returns to bracket

### After (New Behavior)

1. User clicks "edit" in header
2. **Redirects to `/edit` page** ✨
3. Shows dedicated edit profile page with:
   - Locked email field with 🔒 icon
   - Editable name field with label
   - "💾 Save Changes" button
   - "← Back to Bracket" button
   - Danger zone section with logout
4. Save changes and redirects back to home (`/`)
5. Cancel returns to home without saving

## Features

### Edit Profile Page (`/edit`)

```
┌─────────────────────────────────────┐
│  FIFA World Cup 2026 · Profile      │
│                                     │
│         EDIT PROFILE                │
│                                     │
│  Update your name. Your email is    │
│  locked as it's used to identify... │
│                                     │
│  ┌──────────────────────────────┐  │
│  │ Email (locked)               │  │
│  │ 🔒 user@email.com           │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │ Your Name                    │  │
│  │ John Doe                     │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │   💾 Save Changes            │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │   ← Back to Bracket          │  │
│  └──────────────────────────────┘  │
│                                     │
│  ╔══════════════════════════════╗  │
│  ║ ⚠️  DANGER ZONE              ║  │
│  ║                              ║  │
│  ║ Logging out will clear your  ║  │
│  ║ local session...             ║  │
│  ║                              ║  │
│  ║  🚪 Logout                   ║  │
│  ╚══════════════════════════════╝  │
└─────────────────────────────────────┘
```

### Key UI Elements

1. **Locked Email Field**
   - Shows with 🔒 icon
   - Cannot be edited (read-only display)
   - Labeled "Email (locked)"

2. **Editable Name Field**
   - Input with label "Your Name"
   - Max 28 characters
   - Auto-focus on page load
   - Enter key submits

3. **Action Buttons**
   - Primary: "💾 Save Changes" (gradient style)
   - Secondary: "← Back to Bracket" (ghost style)
   - Full-width on mobile

4. **Danger Zone**
   - Red/pink warning border
   - Semi-transparent red background
   - Warning icon ⚠️
   - Clear description of what logout does
   - Red "🚪 Logout" button

5. **Logout Confirmation Modal**
   - Same modal as main page
   - Shows email being logged out
   - "Cancel" and "Yes, Logout" buttons
   - Helpful tip about cloud sync

## Mobile Responsiveness

All elements are fully responsive:

- Full-width inputs and buttons
- Stacked layout on mobile
- Proper touch targets (48px minimum)
- Danger zone adjusts to mobile width

## Implementation Details

### EditProfile Component Logic

```typescript
// Load user data from localStorage on mount
useEffect(() => {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
  if (!saved || !saved.email) {
    router.push("/"); // No user data, go to login
  }
  setEmail(saved.email);
  setName(saved.name);
}, []);

// Save changes
function handleSave() {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
  saved.name = name.trim();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  router.push("/"); // Return to home
}

// Logout
function handleLogout() {
  localStorage.removeItem(STORAGE_KEY);
  router.push("/"); // Go to login screen
}
```

### Routing

- Uses Next.js App Router
- Client-side navigation with `useRouter()`
- No page reload (SPA behavior)
- Browser back button works correctly

## Benefits of This Approach

1. **Cleaner Code**
   - Separation of concerns
   - Dedicated component for editing
   - No complex conditional rendering

2. **Better UX**
   - Clear dedicated page for editing
   - Proper URL structure
   - Can bookmark `/edit`
   - Browser back button works

3. **Easier Maintenance**
   - Each page has single responsibility
   - Easier to add features to edit page
   - No state management complexity

4. **Better for SEO**
   - Proper route structure
   - Descriptive URLs
   - Each page can have own metadata

## Testing Checklist

- [ ] Navigate to bracket page when logged in
- [ ] Click "edit" button in header
- [ ] Should redirect to `/edit` page
- [ ] Email should show as locked with 🔒
- [ ] Name should be editable
- [ ] Change name and click "Save Changes"
- [ ] Should save and redirect to home page
- [ ] Name should be updated in header
- [ ] Go to `/edit` again and click "← Back to Bracket"
- [ ] Should return to home without saving
- [ ] Click "🚪 Logout" in danger zone
- [ ] Confirmation modal should appear
- [ ] Confirm logout
- [ ] Should redirect to login screen
- [ ] Try accessing `/edit` without being logged in
- [ ] Should redirect to home (login page)

## Files Created/Modified

### Created

1. `src/app/edit/page.tsx` - Edit route page
2. `src/components/EditProfile.tsx` - Edit profile component
3. `EDIT_PAGE_FEATURE.md` - This documentation

### Modified

1. `src/components/Predictor.tsx`
   - Removed `isEditMode` state
   - Changed edit button to use `router.push("/edit")`
   - Simplified intro phase rendering
2. `src/components/predictor.module.css`
   - Added `.editField`
   - Added `.editActions`
   - Added `.dangerZone` and related styles
   - Updated mobile styles

## Future Enhancements

- Add profile picture upload
- Add more editable fields (bio, country, etc.)
- Add password change (if auth is added)
- Add delete account option
- Add theme preferences
- Show prediction statistics on edit page
