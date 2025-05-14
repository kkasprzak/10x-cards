# RegisterForm Test Cases

1. ✅ renders all form fields and submit button
2. ✅ shows validation errors for empty required fields
3. ✅ shows error for invalid email format
4. ✅ shows error for password too short
5. ✅ shows error when password and confirmPassword do not match
6. ❌ disables inputs and shows loading indicator during submission
7. ❌ shows success view and calls toast.success on successful registration
8. ❌ shows error toast and retains form on API error response
9. ❌ shows error toast and retains form on network exception
10. ❌ has "Already have an account? Sign in" link pointing to `/login` 