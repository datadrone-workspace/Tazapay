// Track Login Page View
window.addEventListener('load', function() {
    console.log('Login page loaded');
    
    // Track page view
    if (window.analytics) {
        analytics.track('Login Page Viewed', {
            page: 'Login',
            timestamp: new Date().toISOString()
        });
    }
});

// Form elements
const form = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const rememberMeCheckbox = document.getElementById('rememberMe');
const togglePasswordBtn = document.getElementById('togglePassword');

// Toggle password visibility
if (togglePasswordBtn) {
    togglePasswordBtn.addEventListener('click', function() {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;
        
        if (window.analytics) {
            analytics.track('Password Visibility Toggled', {
                visible: type === 'text'
            });
        }
    });
}

// Validation functions
function validateEmail(value) {
    if (!value || value.trim().length === 0) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return 'Please enter a valid email address';
    return null;
}

function validatePassword(value) {
    if (!value || value.trim().length === 0) return 'Password is required';
    if (value.length < 6) return 'Password must be at least 6 characters';
    return null;
}

// Show error message
function showError(inputId, message) {
    const errorElement = document.getElementById(inputId + 'Error');
    const inputElement = document.getElementById(inputId);
    if (message) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
        inputElement.classList.add('error');
    } else {
        errorElement.textContent = '';
        errorElement.classList.remove('show');
        inputElement.classList.remove('error');
    }
}

// Real-time validation
emailInput.addEventListener('blur', function() {
    const error = validateEmail(this.value);
    showError('email', error);
    if (window.analytics) {
        analytics.track('Login Email Field Completed', {
            has_error: error !== null,
            error_message: error,
            email_domain: this.value.split('@')[1] || ''
        });
    }
});

passwordInput.addEventListener('blur', function() {
    const error = validatePassword(this.value);
    showError('password', error);
    if (window.analytics) {
        analytics.track('Login Password Field Completed', {
            has_error: error !== null,
            password_length: this.value.length
        });
    }
});

rememberMeCheckbox.addEventListener('change', function() {
    if (window.analytics) {
        analytics.track('Remember Me Toggled', { checked: this.checked });
    }
});

// Form submission
let loginAttempts = 0;

form.addEventListener('submit', function(e) {
    e.preventDefault();
    loginAttempts++;

    const emailError = validateEmail(emailInput.value);
    const passwordError = validatePassword(passwordInput.value);
    showError('email', emailError);
    showError('password', passwordError);

    if (emailError || passwordError) {
        if (window.analytics) {
            analytics.track('Login Validation Failed', {
                errors: { email: emailError, password: passwordError },
                attempt_number: loginAttempts
            });
        }
        return;
    }

    const email = emailInput.value.trim().toLowerCase();
    const rememberMe = rememberMeCheckbox.checked;

    // ── Derive a display name from email prefix (e.g. "raj.kumar@acme.com" → "Raj Kumar") ──
    const nameParts = email.split('@')[0].replace(/[._-]/g, ' ').split(' ');
    const displayName = nameParts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');

    if (window.analytics) {
        analytics.track('Login Attempt', {
            email: email,
            email_domain: email.split('@')[1],
            remember_me: rememberMe,
            attempt_number: loginAttempts,
            timestamp: new Date().toISOString()
        });
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    // Simulate authentication (replace with actual API call)
    setTimeout(function() {
        const userData = {
            email: email,
            name: displayName,
            logged_in: true,
            login_timestamp: new Date().toISOString(),
            remember_me: rememberMe
        };

        // ── Existing keys (unchanged) ──
        localStorage.setItem('tazapay_user', JSON.stringify(userData));
        localStorage.setItem('tazapay_previous_login', 'true');

        // ── NEW: flat keys that KYC onboarding page reads to link the profile ──
        // These two lines are the only addition needed — KYC page does the rest
        localStorage.setItem('user_email', email);
        localStorage.setItem('user_name', displayName);

        let redirected = false;
        const failsafeTimeout = setTimeout(function() {
            if (!redirected) {
                console.log('Failsafe redirect triggered');
                redirected = true;
                window.location.href = 'index.html';
            }
        }, 3000);

        if (window.analytics && typeof window.analytics.identify === 'function') {
            try {
                // ── Identify the user with email as the key trait ──
                // All future KYC track() events will be stitched to this profile in Segment
                analytics.identify(email, {
                    email: email,
                    name: displayName,
                    logged_in: true,
                    login_method: 'email_password',
                    remember_me: rememberMe,
                    first_login: !localStorage.getItem('tazapay_previous_login'),
                    last_login: new Date().toISOString(),
                    email_domain: email.split('@')[1]
                });

                analytics.track('User Logged In', {
                    email: email,
                    login_method: 'email_password',
                    remember_me: rememberMe,
                    attempt_number: loginAttempts,
                    success: true,
                    timestamp: new Date().toISOString()
                });

                console.log('Segment tracking sent');

                setTimeout(function() {
                    if (!redirected) {
                        console.log('Normal redirect after Segment');
                        redirected = true;
                        clearTimeout(failsafeTimeout);
                        window.location.href = 'index.html';
                    }
                }, 800);

            } catch (error) {
                console.error('Segment error:', error);
                if (!redirected) {
                    redirected = true;
                    clearTimeout(failsafeTimeout);
                    window.location.href = 'index.html';
                }
            }
        } else {
            console.log('Segment not available, redirecting');
            if (!redirected) {
                redirected = true;
                clearTimeout(failsafeTimeout);
                window.location.href = 'index.html';
            }
        }

    }, 1000);
});

// Track social login clicks
document.querySelectorAll('.btn-social').forEach(function(btn) {
    btn.addEventListener('click', function() {
        const provider = this.classList.contains('google') ? 'google' : 'other';
        if (window.analytics) {
            analytics.track('Social Login Clicked', { provider: provider, page: 'Login' });
        }
        alert('Social login integration would go here');
    });
});

// Track forgot password click
const forgotPasswordLink = document.querySelector('.forgot-password');
if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', function(e) {
        e.preventDefault();
        if (window.analytics) {
            analytics.track('Forgot Password Clicked', {
                email_entered: !!emailInput.value,
                email: emailInput.value || null
            });
        }
        alert('Password reset functionality would go here');
    });
}

// Track signup link click
const signupLink = document.querySelector('.signup-link a');
if (signupLink) {
    signupLink.addEventListener('click', function() {
        if (window.analytics) {
            analytics.track('Signup Link Clicked', { source: 'login_page' });
        }
    });
}

// Track form abandonment
let formStarted = false;

form.addEventListener('input', function() {
    if (!formStarted) {
        formStarted = true;
        if (window.analytics) {
            analytics.track('Login Form Started', { timestamp: new Date().toISOString() });
        }
    }
});

window.addEventListener('beforeunload', function() {
    if (formStarted && !localStorage.getItem('tazapay_user')) {
        if (window.analytics) {
            analytics.track('Login Form Abandoned', {
                email_entered: !!emailInput.value,
                password_entered: !!passwordInput.value,
                timestamp: new Date().toISOString()
            });
        }
    }
});

document.addEventListener('visibilitychange', function() {
    if (document.hidden && formStarted && !localStorage.getItem('tazapay_user')) {
        if (window.analytics) {
            analytics.track('Login Page Hidden - Not Completed', {
                email_entered: !!emailInput.value,
                timestamp: new Date().toISOString()
            });
        }
    }
});
