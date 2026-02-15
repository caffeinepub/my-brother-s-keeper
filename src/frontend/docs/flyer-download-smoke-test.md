# Flyer Download Smoke Test

Manual production smoke-test checklist for flyer download functionality.

## Test Environment
- [ ] Desktop browser (Chrome/Firefox/Safari)
- [ ] Mobile browser (iOS Safari/Android Chrome)

## Test 1: Flyer Page Direct Download

### Steps:
1. Navigate to `/flyer` page
2. Wait for QR code to generate (should show "Generating QR code..." then complete)
3. Verify QR code is visible and clear
4. Verify share URL is displayed below QR code
5. Click "Download Flyer" button
6. Check downloaded PNG file

### Expected Results:
- [ ] QR code generates within 3 seconds
- [ ] QR code is visible and crisp (no blurring)
- [ ] Share URL matches the current app URL
- [ ] Download completes successfully
- [ ] Downloaded PNG is not empty (file size > 50KB)
- [ ] Downloaded PNG contains QR code, app branding, and URL
- [ ] **QR code scans successfully with iPhone Camera app and shows tappable URL**
- [ ] **QR code scans successfully with Android camera QR scanner and shows tappable URL**

## Test 2: Share Dialog Auto-Export

### Steps:
1. Open Share dialog from header
2. Wait for QR code to generate
3. Click "Download Flyer" button in Share dialog
4. Should navigate to `/flyer` page with auto-export
5. Check downloaded PNG file

### Expected Results:
- [ ] QR code generates in Share dialog
- [ ] Navigation to `/flyer` page occurs
- [ ] Auto-export triggers automatically
- [ ] Download completes within 2 seconds of page load
- [ ] Downloaded PNG is not empty (file size > 50KB)
- [ ] Downloaded PNG contains QR code, app branding, and URL
- [ ] **QR code scans successfully with iPhone Camera app and shows tappable URL**
- [ ] **QR code scans successfully with Android camera QR scanner and shows tappable URL**

## Test 3: QR Code Scanning Verification

### Steps:
1. Download flyer from either method above
2. Display the downloaded PNG on a computer screen or print it
3. Use iPhone Camera app to scan the QR code
4. Use Android camera QR scanner to scan the QR code
5. Verify the URL appears and is tappable

### Expected Results:
- [ ] **iPhone Camera recognizes QR code immediately**
- [ ] **iPhone Camera shows notification with app URL**
- [ ] **Tapping notification opens the app URL in Safari**
- [ ] **Android camera recognizes QR code immediately**
- [ ] **Android camera shows the app URL**
- [ ] **Tapping opens the app URL in Chrome/default browser**
- [ ] **URL matches the canonical share URL from getShareUrl()**

## Test 4: Error Handling

### Steps:
1. Open Share dialog
2. Immediately click "Download Flyer" before QR generates
3. Verify error message appears
4. Wait for QR to generate
5. Try download again

### Expected Results:
- [ ] Error toast appears with clear message
- [ ] Error message suggests waiting and trying again
- [ ] Download succeeds after QR is ready
- [ ] No infinite loading states

## Test 5: Fallback Guidance

### Steps:
1. If QR generation fails (simulate by blocking canvas)
2. Verify fallback messaging appears
3. Verify "Copy Link" button is available
4. Test copying the link manually

### Expected Results:
- [ ] Clear English message explains QR is unavailable
- [ ] Message suggests using "Copy Link" as fallback
- [ ] App Link field is visible and copyable
- [ ] Copy button works correctly
- [ ] No blame placed on user's device

## Notes
- Test on both desktop and mobile browsers
- Verify QR codes are scannable in real-world conditions (printed or on-screen)
- Check file sizes are reasonable (typically 100-300KB)
- Ensure no console errors during the process
- Verify all user-facing messages are in English and safety-focused
