# 🔍 Missing Features & Improvements

## ✅ Implemented

- [x] Email-based login
- [x] Name collection after email
- [x] Auto-sync on every pick (2s debounce)
- [x] Cross-device sync by email
- [x] Mobile-responsive buttons
- [x] Admin dashboard with email column
- [x] Existing user email migration modal
- [x] LocalStorage persistence
- [x] Share image download

## 🚨 Critical Missing Features

### 1. **Email Verification**

**Problem**: Anyone can use any email without verification
**Impact**: Spam, impersonation, data integrity issues
**Solution**:

- Send magic link to email
- Verify before allowing predictions
- Or use OAuth (Google, GitHub)

### 2. **Edit Profile**

**Problem**: Users can't change name/email after first entry
**Impact**: Typos are permanent
**Solution**:

```typescript
// Add edit mode in intro screen
const [editMode, setEditMode] = useState(false);

// Allow editing even with saved data
if (email && editMode) {
  // Show both email and name inputs
  // Update on save
}
```

### 3. **Delete Account / Predictions**

**Problem**: GDPR compliance - users can't delete their data
**Impact**: Legal issues in EU
**Solution**:

```sql
-- Add deletion endpoint
DELETE FROM predictions WHERE email = ?

-- Add button in intro or admin panel
```

### 4. **Better Error Messages**

**Problem**: Generic "sync failed" messages
**Impact**: Users don't know what went wrong
**Solution**:

- Duplicate email: "This email is already in use. Did you mean to login?"
- Network error: "Can't connect. Check your internet."
- Invalid email: "Please enter a valid email address."

### 5. **Offline Mode Indicator**

**Problem**: Users don't know if auto-sync is working
**Impact**: Lost data when offline
**Solution**:

```tsx
// Add online/offline detection
const [isOnline, setIsOnline] = useState(navigator.onLine);

useEffect(() => {
  const handleOnline = () => setIsOnline(true);
  const handleOffline = () => setIsOnline(false);

  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);

  return () => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
  };
}, []);

// Show indicator
{
  !isOnline && (
    <div className={styles.offlineBanner}>
      📡 Offline - Changes will sync when online
    </div>
  );
}
```

### 6. **Share via Link**

**Problem**: Only image download, no shareable URL
**Impact**: Hard to share on social media
**Solution**:

```typescript
// Generate shareable link
const shareUrl = `${window.location.origin}/share/${predictionId}`;

// Add share button
if (navigator.share) {
  await navigator.share({
    title: "My World Cup 2026 Bracket",
    url: shareUrl,
  });
}
```

### 7. **Public Profile Pages**

**Problem**: Can't view others' predictions
**Impact**: No social sharing
**Solution**:

```
/predictions/[email-hash] - Public view of someone's bracket
/leaderboard - Top predictions ranked by accuracy (future)
```

### 8. **Duplicate Email Handling**

**Problem**: Confusing when email already exists
**Impact**: User doesn't know if they should login or signup
**Solution**:

```typescript
// On email submit, check if exists
if (existingPrediction) {
  // Show: "Welcome back! Continue your bracket"
  // Load their data
} else {
  // Show: "Let's get started! What's your name?"
}
```

### 9. **Logout / Switch Account**

**Problem**: No way to logout or use different email
**Impact**: Stuck with one account per device
**Solution**:

```tsx
// Add logout button
function logout() {
  localStorage.clear();
  setEmail("");
  setName("");
  setPicks({});
  setPhase("intro");
}
```

### 10. **Change Email**

**Problem**: Typo in email = can't sync
**Impact**: User loses access to cloud data
**Solution**:

- Add "Change Email" in settings
- Verify new email
- Migrate predictions

## 🎨 UX Improvements

### 11. **Loading States**

- [x] "Checking..." on start button
- [ ] Skeleton loader for bracket
- [ ] Progress bar for image download
- [ ] Spinner for auto-sync

### 12. **Better Visual Feedback**

- [x] Auto-sync indicator "☁ Syncing..."
- [ ] Success checkmark "✅ Synced"
- [ ] Error alert "❌ Sync failed"
- [ ] Offline indicator "📡 Offline"

### 13. **Confirmation Dialogs**

- [ ] "Are you sure?" before deleting
- [ ] "Reset bracket?" before clearing
- [ ] "Logout?" before clearing data

### 14. **Better Mobile Experience**

- [x] Touch targets (52px)
- [ ] Swipe gestures
- [ ] Pull to refresh
- [ ] Native share sheet

### 15. **Keyboard Navigation**

- [ ] Tab through matches
- [ ] Enter to select team
- [ ] Esc to close modals
- [ ] Arrow keys to navigate

## 🔒 Security Improvements

### 16. **Rate Limiting**

**Problem**: API can be spammed
**Impact**: DDoS vulnerability
**Solution**: Add rate limiting to all endpoints

### 17. **Input Sanitization**

**Problem**: XSS vulnerabilities
**Impact**: Malicious scripts in names
**Solution**: Sanitize all user inputs

### 18. **CORS Protection**

**Problem**: API accessible from anywhere
**Impact**: Unauthorized access
**Solution**: Restrict to your domain

### 19. **Email Validation Server-Side**

**Problem**: Only client-side validation
**Impact**: Bypassed easily
**Solution**: Validate in API routes too

### 20. **SQL Injection Prevention**

**Problem**: Direct query params
**Impact**: Database compromise
**Solution**: Already using Supabase (protected) ✅

## 📊 Analytics & Monitoring

### 21. **Error Tracking**

- [ ] Sentry or similar
- [ ] Log sync failures
- [ ] Track API errors

### 22. **Usage Analytics**

- [ ] Track sign-ups
- [ ] Track bracket completions
- [ ] Track popular teams

### 23. **Performance Monitoring**

- [ ] Page load times
- [ ] API response times
- [ ] Auto-sync success rate

## 🎯 Feature Enhancements

### 24. **Multiple Brackets**

**Allow users to create multiple predictions**

- Personal prediction
- "Safe" prediction
- "Wishful thinking" prediction

### 25. **Groups / Friends**

**Create prediction groups**

- Invite friends
- Private leaderboards
- Group chat

### 26. **Live Scoring** (Post-tournament)

**Compare predictions to actual results**

- Points system
- Live updates
- Final rankings

### 27. **Push Notifications**

**Remind users to complete bracket**

- "Tournament starts soon!"
- "Update your picks!"

### 28. **Social Features**

**Share and compare**

- Twitter/X integration
- Instagram stories
- WhatsApp sharing

### 29. **Themes**

**Different visual themes**

- Dark mode (current)
- Light mode
- Team colors

### 30. **Languages**

**Internationalization**

- Spanish
- Portuguese
- French
- Arabic
- More...

## 🐛 Known Bugs

### 31. **Modal Not Showing**

**Status**: Debugging needed
**Impact**: Name modal doesn't appear
**Fix**: Check console logs, verify state

### 32. **Auto-Sync Timing**

**Status**: Works but could be better
**Impact**: Sometimes feels delayed
**Fix**: Add immediate feedback, reduce debounce

### 33. **LocalStorage Conflicts**

**Status**: Possible with multiple tabs
**Impact**: Data race conditions
**Fix**: Use BroadcastChannel API

## 📝 Documentation Missing

### 34. **API Documentation**

- Endpoint reference
- Request/response examples
- Error codes

### 35. **User Guide**

- How to use the app
- FAQ section
- Troubleshooting

### 36. **Deployment Guide**

- Environment variables
- Database setup
- Vercel configuration

### 37. **Contributing Guide**

- Code style
- PR process
- Testing requirements

## 🚀 Priority Fixes (Do First)

1. **Fix name modal not showing** (Critical bug)
2. **Add logout button** (User control)
3. **Better error messages** (User experience)
4. **Offline indicator** (User awareness)
5. **Edit profile** (Data correction)
6. **Delete account** (GDPR compliance)
7. **Email verification** (Security)

---

## Would You Like Me To Implement Any Of These?

Let me know which features are most important and I'll add them right away! 🚀

**Most Critical:**

1. Fix the name modal issue (debugging needed)
2. Add logout/switch account
3. Better error handling
4. Offline detection
5. Edit profile

Which should I tackle first?
