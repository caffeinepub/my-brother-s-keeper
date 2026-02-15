# Flyer Download Smoke Test Checklist

This document provides a manual smoke-test checklist for validating flyer download functionality across different browsers and devices.

## Test Environment Requirements
- **Desktop**: Chrome/Edge (latest), Firefox (latest)
- **Mobile**: Android Chrome, iOS Safari

## Pre-Test Setup
1. Deploy the application to a test environment
2. Ensure you have access to both desktop and mobile devices
3. Clear browser cache before testing

## Test Cases

### 1. Manual Download from Flyer Page (/flyer)

**Steps:**
1. Navigate to `/flyer` page
2. Wait for QR code to fully generate (no "Generating..." message)
3. Verify QR code is visible and not blank
4. Verify share URL text is displayed below QR code
5. Click "Download Flyer" button
6. Wait for download to complete

**Expected Results:**
- ✅ Download triggers without errors
- ✅ PNG file is saved to device
- ✅ Downloaded image contains:
  - App logo/icon
  - "My Brother's Keeper" title
  - Introduction text
  - Visible QR code (not blank)
  - Share URL text
  - Footer text
- ✅ Image is high resolution (not blurry)
- ✅ No console errors related to "tainted canvas" or "toBlob"

**Test on:**
- [ ] Desktop Chrome
- [ ] Desktop Firefox
- [ ] Android Chrome
- [ ] iOS Safari

---

### 2. Auto-Export from Share Dialog

**Steps:**
1. Navigate to any page with the Share button (e.g., home page)
2. Click the Share button to open Share Dialog
3. Click "Download Flyer" button in the dialog
4. Wait for navigation to `/flyer` page
5. Wait for auto-download to trigger

**Expected Results:**
- ✅ Navigates to `/flyer` page
- ✅ QR code generates successfully
- ✅ Download triggers automatically after QR is ready
- ✅ Success toast appears: "Flyer downloaded successfully"
- ✅ Downloaded PNG contains all expected content (same as Test Case 1)
- ✅ No error toasts appear
- ✅ No console errors

**Test on:**
- [ ] Desktop Chrome
- [ ] Desktop Firefox
- [ ] Android Chrome
- [ ] iOS Safari

---

### 3. Copy Link Functionality

**Steps:**
1. Navigate to `/flyer` page
2. Click the "Copy" button next to the App Link field
3. Paste the copied link into a new browser tab

**Expected Results:**
- ✅ Success toast appears: "Link copied to clipboard"
- ✅ Pasted link matches the displayed share URL
- ✅ Link opens the application correctly

**Test on:**
- [ ] Desktop Chrome
- [ ] Desktop Firefox
- [ ] Android Chrome
- [ ] iOS Safari

---

### 4. Error Handling

**Steps:**
1. Navigate to `/flyer` page
2. Immediately click "Download Flyer" before QR code finishes generating
3. Observe error message

**Expected Results:**
- ✅ User-friendly error message appears (not technical jargon)
- ✅ Error message suggests waiting and trying again
- ✅ No raw exception text visible to user
- ✅ Console logs technical details for debugging

**Test on:**
- [ ] Desktop Chrome
- [ ] Android Chrome

---

### 5. Regression Tests

**Steps:**
1. Navigate to `/flyer` page
2. Verify all existing functionality still works:
   - QR code generation
   - Share URL display
   - Copy link button
   - Back button navigation

**Expected Results:**
- ✅ QR code generates correctly
- ✅ Share URL is displayed and correct
- ✅ Copy link works
- ✅ Back button returns to previous page
- ✅ No visual regressions (layout, styling)

**Test on:**
- [ ] Desktop Chrome
- [ ] Android Chrome
- [ ] iOS Safari

---

## Known Limitations
- Export quality depends on browser rendering capabilities
- Some CSS effects (e.g., complex gradients, shadows) may render differently in the exported image
- Export time may vary based on device performance

## Troubleshooting

### Issue: Download fails with "tainted canvas" error
**Solution:** This should no longer occur with the new implementation. If it does, check console logs and report the issue.

### Issue: QR code is blank in downloaded image
**Solution:** Ensure QR code has fully generated before downloading. The download button should be disabled until QR is ready.

### Issue: Download doesn't trigger on mobile
**Solution:** Check browser console for errors. Ensure browser allows downloads from the site.

### Issue: Image quality is poor
**Solution:** This is expected on very low-end devices. The export uses 2x scale for better quality.

---

## Sign-Off

**Tester Name:** ___________________________

**Date:** ___________________________

**Overall Result:** [ ] Pass [ ] Fail

**Notes:**
