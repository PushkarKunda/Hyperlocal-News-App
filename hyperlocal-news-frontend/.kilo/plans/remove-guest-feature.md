# Remove Guest Related Features

## Overview
This plan outlines the removal of all guest-related functionality from the hyperlocal news frontend project. The guest feature appears to be an incomplete implementation that provides a limited experience for non-authenticated users.

## Files to Modify

### 1. types/auth.ts
- Remove `isGuest: boolean;` from the AuthState interface (line 3)

### 2. utils/apiClient.ts
- Remove `isGuest: false,` from the mock verifyOtp response (line 840)

### 3. components/MenuOptions.tsx
- Remove the guest-specific conditional in the user info section (lines 275-276):
  ```typescript
  {user?.isGuest ? (
    <Text style={[styles.userSubtitle, { color: colors.textSecondary }]}>Guest Account</Text>
  ) : user?.isPublisher ? (
    // ... publisher badge
  ) : (
    // ... not verified button
  )}
  ```
  Should become:
  ```typescript
  user?.isPublisher ? (
    // ... publisher badge
  ) : (
    // ... not verified button
  )
  ```

### 4. app/(tabs)/settings.tsx
- Remove `const isGuest = user?.isGuest;` (line 55)
- Update displayName (line 56): 
  - From: `const displayName = user?.name || (isGuest ? 'Guest User' : 'Complete Profile');`
  - To: `const displayName = user?.name || 'Complete Profile';`
- Update displayPhone (line 57):
  - From: `const displayPhone = user?.phoneNumber || (isGuest ? 'No phone added' : 'Setup Phone');`
  - To: `const displayPhone = user?.phoneNumber || 'Setup Phone';`
- Remove guest-specific email text (line 127):
  - Remove: `user?.isGuest && <Text style={[styles.profilePhone, { color: colors.textTertiary, fontSize: 11, marginTop: 2 }]}>No email added</Text>`
- Update premiumBadgeContainer (lines 130-151):
  - Remove the `isGuest ?` branch that shows "Guest Account" badge
  - Keep only publisher badge and "Get Verified to Publish" button conditionals

### 5. app/(tabs)/profile.tsx
- Remove `const isGuest = user?.isGuest;` (line 43)
- Update displayName (line 44):
  - From: `const displayName = user?.name || (isGuest ? 'Guest User' : 'Complete Profile');`
  - To: `const displayName = user?.name || 'Complete Profile';`
- Update displayPhone (line 45):
  - From: `const displayPhone = user?.phoneNumber || (isGuest ? 'No phone added' : 'Setup Phone');`
  - To: `const displayPhone = user?.phoneNumber || 'Setup Phone';`
- Update premium badge section (lines 114-129):
  - Remove the `isGuest ?` branch that shows "Guest Mode" badge
  - Keep only publisher badge and "Get Verified to Publish" button conditionals
- Update bio text (lines 133-136):
  - Remove the conditional and always show the non-guest bio:
    - From: `{isGuest ? 'Enjoying HyperLocal? Log in to personalize your profile...' : 'Tech enthusiast & daily reader...'}`
    - To: `'Tech enthusiast & daily reader. Always seeking the deeper story behind the headlines.'`
- Remove stats conditional (lines 141-155):
  - Remove `{!isGuest && (` and the corresponding closing `)}`
  - Always show the stats row
- Remove Guest Authentication Call to Action Banner (lines 214-236):
  - Remove the entire section that conditionally renders the banner for guests

## Implementation Notes
- All changes involve removing guest-specific conditionals and simplifying the UI to treat all users as regular authenticated users
- No changes needed to authentication logic since isGuest was only used in UI and mock data
- The publisher functionality remains intact
- Default values for display name and phone should be updated to reflect non-guest placeholders

## Testing
After implementation, verify that:
1. UI elements previously shown only to guests are now hidden
2. Publisher badges and verification prompts still work correctly
3. Default display values appear correctly when user data is missing
4. No TypeScript errors related to isGuest property