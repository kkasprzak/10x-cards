# LoginForm Test Cases

1. ✅ renders all form fields and submit button
2. ✅ shows validation errors for empty required fields
3. ✅ shows error for invalid email format
4. ❌ disables inputs and shows loading indicator during submission
5. ❌ clears API error when email or password changes
6. ❌ handles successful login and redirects to /generate
7. ❌ shows error notification on API error response
8. ❌ shows error notification on network exception
9. ✅ has "Forgot your password?" link pointing to `/forgot-password`
10. ✅ has "Don't have an account? Sign up" link pointing to `/register` 