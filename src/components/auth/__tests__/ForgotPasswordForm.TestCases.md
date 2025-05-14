# ForgotPasswordForm Test Cases

1. ✅ renders all form fields and submit button
2. ✅ shows validation error for empty email field
3. ✅ shows error for invalid email format
4. ❌ disables input and shows loading indicator during submission
5. ❌ shows success view with submitted email after form submission
6. ❌ shows toast success message after form submission
7. ❌ shows error toast and retains form on API error
8. ❌ shows error toast and retains form on network exception
9. ❌ has "Back to login" link pointing to `/login` in form view
10. ❌ has "Back to login" link pointing to `/login` in success view 