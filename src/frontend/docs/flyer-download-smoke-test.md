# Flyer Download Smoke Test

Manual production smoke-test checklist for flyer download functionality.

## Test Environment
- [ ] Desktop browser (Chrome/Firefox/Safari)
- [ ] Mobile browser (iOS Safari/Android Chrome)

## Test 1: Flyer Page Direct Download

### Steps:
1. Navigate to `/flyer` page
2. Verify share URL is displayed
3. Verify flyer preview shows app branding and URL
4. Click "Download Flyer" button
5. Check downloaded PNG file

### Expected Results:
- [ ] Share URL matches the current app URL
- [ ] Flyer preview displays correctly with branding
- [ ] Download completes successfully
- [ ] Downloaded PNG is not empty (file size > 50KB)
- [ ] Downloaded PNG contains app branding and URL

## Test 2: Share Dialog Auto-Export

### Steps:
1. Open Share dialog from header
2. Click "Download Flyer" button in Share dialog
3. Should navigate to `/flyer` page with auto-export
4. Check downloaded PNG file

### Expected Results:
- [ ] Navigation to `/flyer` page occurs
- [ ] Auto-export triggers automatically
- [ ] Download completes within 2 seconds of page load
- [ ] Downloaded PNG is not empty (file size > 50KB)
- [ ] Downloaded PNG contains app branding and URL

## Test 3: Link Sharing Verification

### Steps:
1. Open Share dialog
2. Verify App Link field shows the correct URL
3. Click "Copy Link" button
4. Paste the link in a browser
5. Verify the app loads correctly

### Expected Results:
- [ ] App Link field displays the full, correct URL
- [ ] Copy Link button successfully copies to clipboard
- [ ] Pasted link opens the app correctly
- [ ] URL matches the canonical share URL from getShareUrl()

## Test 4: Error Handling

### Steps:
1. Open Share dialog
2. Immediately click "Download Flyer" before page fully loads
3. Verify error message appears if needed
4. Wait for page to load
5. Try download again

### Expected Results:
- [ ] Error toast appears with clear message if download fails
- [ ] Error message suggests waiting and trying again
- [ ] Download succeeds after page is ready
- [ ] No infinite loading states

## Test 5: Quick Share Functionality

### Steps:
1. Open Share dialog
2. Click "Quick Share" button
3. Test on mobile device with native share support
4. Test on desktop without native share support

### Expected Results:
- [ ] Quick Share opens native share sheet on mobile
- [ ] Quick Share falls back to clipboard copy on desktop
- [ ] Clear success/error messages appear
- [ ] App Link field remains available as fallback

## Notes
- Test on both desktop and mobile browsers
- Verify flyer downloads are readable and contain all necessary information
- Check file sizes are reasonable (typically 100-300KB)
- Ensure no console errors during the process
- Verify all user-facing messages are in English and safety-focused
- QR code functionality has been temporarily removed and will be revisited later
