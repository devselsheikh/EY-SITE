# Form Testing Checklist

## 🎯 Quick Testing Guide

Both contact forms are now configured and ready to test!

---

## 📝 Daycare Tour Booking Form

**URL:** `/daycare/contact`

### Test Submission:
1. Navigate to the Daycare contact page
2. Fill out the form with test data:
   - **Parent Name:** John Doe
   - **Email:** your.test@email.com
   - **Phone:** +20 123 456 7890
   - **Child's Age:** 3 years
   - **Tour Date:** [Select a future date]
   - **Message:** Test submission - please ignore
3. Click "Request Tour"
4. Verify success message appears
5. **Check email at:** `info@theearlyyearscompany.com`
6. Confirm email received with subject: "New Daycare Tour Booking - John Doe"

### Expected Email Format:
```
Subject: New Daycare Tour Booking - John Doe

Form Type: Daycare Tour Booking
Parent Name: John Doe
Email: your.test@email.com
Phone: +20 123 456 7890
Child Age: 3 years
Tour Date: 2026-02-15
Message: Test submission - please ignore
Submitted: [Timestamp]
```

---

## 🎓 EduHub Interest Form

**URL:** `/eduhub/contact`

### Test Submission:
1. Navigate to the EduHub contact page
2. Fill out the form with test data:
   - **Full Name:** Jane Smith
   - **Email:** your.test@email.com
   - **Phone:** +20 123 456 7890
   - **Qualification Interest:** CACHE Level 5
   - **Years of Experience:** 5 years
   - **Current Institution:** ABC Nursery
   - **Message:** Test submission - please ignore
3. Click "Submit Registration"
4. Verify success message appears
5. **Check email at:** `eduhub@theearlyyearscompany.com`
6. Confirm email received with subject: "New EduHub Interest Form - Jane Smith"

### Expected Email Format:
```
Subject: New EduHub Interest Form - Jane Smith

Form Type: EduHub Interest Form
Full Name: Jane Smith
Email: your.test@email.com
Phone: +20 123 456 7890
Qualification: level-5
Experience: 5 years
Institution: ABC Nursery
Message: Test submission - please ignore
Submitted: [Timestamp]
```

---

## ✅ Testing Checklist

### Before Testing:
- [ ] Website is deployed and accessible
- [ ] Internet connection is active
- [ ] Access to both email inboxes

### Daycare Form Tests:
- [ ] Form loads without errors
- [ ] All required fields are validated (Name, Email, Phone)
- [ ] Optional fields work correctly (Child Age, Tour Date, Message)
- [ ] Date picker works correctly
- [ ] Submit button is clickable
- [ ] Success message displays after submission
- [ ] Form resets after successful submission
- [ ] Email arrives at `info@theearlyyearscompany.com`
- [ ] Email contains all submitted data
- [ ] Email is properly formatted

### EduHub Form Tests:
- [ ] Form loads without errors
- [ ] All required fields are validated (Name, Email, Phone, Qualification)
- [ ] Qualification dropdown works correctly
- [ ] Optional fields work correctly (Experience, Institution, Message)
- [ ] Submit button is clickable
- [ ] Loading state shows while submitting
- [ ] Success message displays after submission
- [ ] Form resets after successful submission
- [ ] Email arrives at `eduhub@theearlyyearscompany.com`
- [ ] Email contains all submitted data
- [ ] Email is properly formatted

### Error Handling Tests:
- [ ] Form shows validation error for empty required fields
- [ ] Form shows validation error for invalid email format
- [ ] Error message displays if submission fails
- [ ] Fallback email address shown in error message
- [ ] Form can be resubmitted after error

### Mobile Responsiveness Tests:
- [ ] Daycare form displays correctly on mobile
- [ ] EduHub form displays correctly on mobile
- [ ] All input fields are easily tappable on mobile
- [ ] Date picker works on mobile devices
- [ ] Dropdowns work on mobile devices
- [ ] Submit buttons are accessible on mobile

---

## 🔧 Troubleshooting

### Form submission successful but no email received:

1. **Check spam/junk folder** - Web3Forms emails might be filtered
2. **Verify email addresses:**
   - Daycare: `info@theearlyyearscompany.com`
   - EduHub: `eduhub@theearlyyearscompany.com`
3. **Check Web3Forms dashboard** at https://web3forms.com/
4. **Whitelist Web3Forms** in email settings
5. **Wait a few minutes** - sometimes there's a slight delay

### Form shows error on submission:

1. **Open browser console** (F12) to see detailed error
2. **Check internet connection**
3. **Verify access keys** in `/utils/emailService.ts`:
   - Daycare: `50d9dcbd-5d3a-44d1-adc1-7526d5644c46`
   - EduHub: `7c0346ce-6f6c-4a6d-85b5-64adbde50909`
4. **Clear browser cache** and try again
5. **Test in different browser** to rule out browser-specific issues

### Email arrives but data is missing:

1. **Check form submission** in browser console
2. **Verify all field names** match in emailService.ts
3. **Test with all fields filled** to see which ones work
4. **Report issue** with specific missing fields

---

## 📊 Success Criteria

### Both forms should:
- ✅ Submit without errors
- ✅ Display success confirmation
- ✅ Reset after submission
- ✅ Send email within 1-2 minutes
- ✅ Include all submitted data in email
- ✅ Show proper error messages if fails

### Emails should:
- ✅ Arrive at correct recipient address
- ✅ Have clear, descriptive subject line
- ✅ Contain all form data
- ✅ Include timestamp of submission
- ✅ Be well-formatted and readable

---

## 🎉 Next Steps After Testing

Once both forms are tested and working:

1. **Set up email filters** to organize form submissions
2. **Create email templates** for responding to inquiries
3. **Set up auto-responses** (optional via Web3Forms)
4. **Add to CRM** if you use one
5. **Monitor submissions** regularly
6. **Train staff** on responding to inquiries

---

## 📞 Support Contacts

- **Web3Forms Support:** https://web3forms.com/support
- **Web3Forms Documentation:** https://docs.web3forms.com/

---

**Last Updated:** January 28, 2026  
**Status:** ✅ Ready for Production Testing
