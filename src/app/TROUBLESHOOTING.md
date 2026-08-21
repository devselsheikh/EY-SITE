# Form Submission Troubleshooting Guide

## 🔍 How to Debug Form Issues

When you test the form and get the error "❌ Something went wrong", follow these steps:

---

## Step 1: Open Browser Console

1. **Open Developer Tools:**
   - **Chrome/Edge:** Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
   - **Firefox:** Press `F12` or `Ctrl+Shift+K` (Windows) / `Cmd+Option+K` (Mac)
   - **Safari:** Enable Developer menu in Preferences, then press `Cmd+Option+C`

2. **Go to Console Tab** - Look for red error messages

3. **Try submitting the form again** while watching the console

---

## Step 2: Check Console Output

Look for these specific messages:

### ✅ Success Message:
```
Web3Forms Daycare Response: {success: true, message: "Email sent successfully"}
```

### ❌ Error Messages:

**Access Key Error:**
```
Web3Forms error: {success: false, message: "Invalid access key"}
```
**Solution:** Check that access keys in `/utils/emailService.ts` are correct:
- Daycare: `50d9dcbd-5d3a-44d1-adc1-7526d5644c46`
- EduHub: `7c0346ce-6f6c-4a6d-85b5-64adbde50909`

**Network Error:**
```
Failed to fetch
```
**Solution:** Check your internet connection and firewall settings

**CORS Error:**
```
Access to fetch at 'https://api.web3forms.com/submit' from origin...
```
**Solution:** This shouldn't happen with Web3Forms, but try in a different browser

---

## Step 3: Check Network Tab

1. **Open Network tab** in Developer Tools
2. **Submit the form**
3. **Look for a request** to `api.web3forms.com/submit`
4. **Click on it** to see details

### What to Check:

**Request Headers:**
- Method should be: `POST`
- Content-Type should be: `application/json`

**Request Payload:**
Should include:
```json
{
  "access_key": "50d9dcbd-5d3a-44d1-adc1-7526d5644c46",
  "subject": "New Daycare Tour Booking - [Name]",
  "from_name": "...",
  "from_email": "...",
  ...
}
```

**Response:**
- Status code should be: `200 OK`
- Response body should show: `{"success": true, ...}`

---

## Common Issues and Solutions

### Issue 1: "Invalid access key"
**Cause:** Access key is wrong or missing  
**Fix:**
1. Open `/utils/emailService.ts`
2. Verify lines 17-18 have correct keys:
   ```typescript
   const DAYCARE_ACCESS_KEY = '50d9dcbd-5d3a-44d1-adc1-7526d5644c46';
   const EDUHUB_ACCESS_KEY = '7c0346ce-6f6c-4a6d-85b5-64adbde50909';
   ```

### Issue 2: "Failed to fetch"
**Cause:** Network or CORS issue  
**Fix:**
1. Check internet connection
2. Disable browser extensions (especially ad blockers)
3. Try in incognito/private mode
4. Check if Web3Forms is blocked by firewall

### Issue 3: Form submits but no email arrives
**Cause:** Web3Forms processed but email delivery issue  
**Fix:**
1. Check spam/junk folder
2. Wait 5-10 minutes for delivery
3. Verify access key is configured at web3forms.com
4. Check Web3Forms dashboard for logs

### Issue 4: "TypeError: Cannot read property 'success'"
**Cause:** API response format unexpected  
**Fix:**
1. Check console for full error
2. Verify Web3Forms API is responding
3. Try with minimal data first

### Issue 5: Form button doesn't respond
**Cause:** JavaScript error before submission  
**Fix:**
1. Check console for errors on page load
2. Clear browser cache
3. Hard refresh: `Ctrl+Shift+R` (Windows) / `Cmd+Shift+R` (Mac)

---

## Quick Test Checklist

- [ ] Browser console is open
- [ ] No JavaScript errors on page load
- [ ] All form fields filled correctly
- [ ] Internet connection is active
- [ ] No ad blockers interfering
- [ ] Correct access keys in `/utils/emailService.ts`

---

## Testing with Minimal Data

Try submitting with just required fields:

### Daycare Form:
```
Name: Test User
Email: test@test.com
Phone: 1234567890
(Leave other fields empty)
```

### EduHub Form:
```
Name: Test User
Email: test@test.com
Phone: 1234567890
Qualification: level-3
(Leave other fields empty)
```

---

## Web3Forms Dashboard

Check your submissions at:
- **Daycare:** https://web3forms.com/access/50d9dcbd-5d3a-44d1-adc1-7526d5644c46
- **EduHub:** https://web3forms.com/access/7c0346ce-6f6c-4a6d-85b5-64adbde50909

This shows all submissions even if email delivery failed.

---

## Still Not Working?

### Option 1: Send me the console output
1. Open console (F12)
2. Try to submit form
3. Right-click on errors → "Save as..."
4. Send the log file

### Option 2: Test access key directly

Open browser console and paste:
```javascript
fetch('https://api.web3forms.com/submit', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    access_key: '50d9dcbd-5d3a-44d1-adc1-7526d5644c46',
    subject: 'Test',
    name: 'Test User',
    email: 'test@test.com',
    message: 'This is a test'
  })
})
.then(r => r.json())
.then(d => console.log('Result:', d))
.catch(e => console.error('Error:', e));
```

This tests the Daycare access key directly. You should see:
```
Result: {success: true, message: "..."}
```

### Option 3: Alternative Email Service

If Web3Forms doesn't work, we can switch to:
- EmailJS (requires signup)
- FormSubmit (simpler but less features)
- SendGrid API
- Your own SMTP server

---

## Contact Support

- **Web3Forms Support:** support@web3forms.com
- **Web3Forms Docs:** https://docs.web3forms.com/

---

**Last Updated:** January 28, 2026
