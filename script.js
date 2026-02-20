/* ─────────────────────────────────────────────────────────────────
   auth-nav.js — Drop this script into your index page
   Reads login session from localStorage and updates the nav button.
   No HTML changes needed.
───────────────────────────────────────────────────────────────── */

(function() {
  const email    = localStorage.getItem('user_email');
  const name     = localStorage.getItem('user_name');
  const loginBtn = document.querySelector('.btn-login');

  if (!loginBtn) return; // Safety check

  if (email) {
    // ── User is logged in — show their name/email with a dropdown ──

    // Generate initials avatar (e.g. "Raj Kumar" → "RK")
    const initials = name
      ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
      : email[0].toUpperCase();

    // Display name: prefer first name, fall back to email prefix
    const displayName = name
      ? name.split(' ')[0]           // "Raj Kumar" → "Raj"
      : email.split('@')[0];         // "raj@acme.com" → "raj"

    // Replace the login button with a user menu
    loginBtn.outerHTML = `
      <div class="nav-user-menu" id="navUserMenu">
        <button class="nav-user-btn" onclick="toggleUserDropdown()" aria-haspopup="true">
          <span class="nav-user-avatar">${initials}</span>
          <span class="nav-user-name">${displayName}</span>
          <svg class="nav-chevron" width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <div class="nav-user-dropdown" id="navUserDropdown">
          <div class="nav-user-dropdown-header">
            <div class="nud-avatar">${initials}</div>
            <div class="nud-info">
              <div class="nud-name">${name || displayName}</div>
              <div class="nud-email">${email}</div>
            </div>
          </div>
          <div class="nav-user-dropdown-divider"></div>
          <a href="merchant-onboarding.html" class="nav-user-dropdown-item">
            <span>📋</span> KYC Onboarding
          </a>
          <a href="#" class="nav-user-dropdown-item">
            <span>⚙️</span> Account Settings
          </a>
          <div class="nav-user-dropdown-divider"></div>
          <button class="nav-user-dropdown-item logout" onclick="handleLogout()">
            <span>🚪</span> Logout
          </button>
        </div>
      </div>
    `;

    // Inject styles
    const style = document.createElement('style');
    style.textContent = `
      .nav-user-menu { position: relative; display: inline-flex; }

      .nav-user-btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 7px 14px 7px 7px;
        background: #fff;
        border: 1.5px solid #e2e8f0;
        border-radius: 999px;
        cursor: pointer;
        font-family: inherit;
        font-size: 0.875rem;
        font-weight: 600;
        color: #0d1b2a;
        transition: box-shadow 0.2s, border-color 0.2s;
      }
      .nav-user-btn:hover {
        border-color: #00c9a7;
        box-shadow: 0 0 0 3px rgba(0,201,167,0.12);
      }

      .nav-user-avatar {
        width: 28px; height: 28px;
        border-radius: 50%;
        background: #0d1b2a;
        color: #00c9a7;
        font-size: 0.72rem;
        font-weight: 800;
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0;
        letter-spacing: 0.02em;
      }

      .nav-user-name { max-width: 100px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

      .nav-chevron {
        color: #94a3b8;
        transition: transform 0.2s;
        flex-shrink: 0;
      }
      .nav-user-menu.open .nav-chevron { transform: rotate(180deg); }

      .nav-user-dropdown {
        display: none;
        position: absolute;
        top: calc(100% + 8px);
        right: 0;
        min-width: 230px;
        background: #fff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        box-shadow: 0 8px 30px rgba(0,0,0,0.12);
        overflow: hidden;
        z-index: 9999999;
        animation: dropdownIn 0.15s ease;
      }
      .nav-user-menu.open .nav-user-dropdown { display: block; }

      @keyframes dropdownIn {
        from { opacity: 0; transform: translateY(-6px); }
        to   { opacity: 1; transform: translateY(0); }
      }

      .nav-user-dropdown-header {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 14px 16px;
        background: #f8fafd;
      }
      .nud-avatar {
        width: 36px; height: 36px;
        border-radius: 50%;
        background: #0d1b2a;
        color: #00c9a7;
        font-size: 0.8rem;
        font-weight: 800;
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0;
      }
      .nud-name {
        font-size: 0.875rem;
        font-weight: 700;
        color: #0d1b2a;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 150px;
      }
      .nud-email {
        font-size: 0.75rem;
        color: #64748b;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 150px;
      }

      .nav-user-dropdown-divider {
        height: 1px;
        background: #f1f5f9;
        margin: 4px 0;
      }

      .nav-user-dropdown-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 16px;
        font-size: 0.85rem;
        font-weight: 500;
        color: #334155;
        text-decoration: none;
        background: none;
        border: none;
        width: 100%;
        text-align: left;
        cursor: pointer;
        font-family: inherit;
        transition: background 0.15s;
      }
      .nav-user-dropdown-item:hover { background: #f8fafd; }
      .nav-user-dropdown-item.logout { color: #ef4444; }
      .nav-user-dropdown-item.logout:hover { background: #fef2f2; }
    `;
    document.head.appendChild(style);

    // Track that logged-in user visited index
    if (window.analytics) {
      analytics.track('Index Page Viewed - Logged In', {
        email: email,
        name: name || null,
      });
    }

  } else {
    // ── Not logged in — keep the Login button, no changes needed ──
    if (window.analytics) {
      analytics.track('Index Page Viewed - Not Logged In');
    }
  }

  // ── Dropdown toggle ──
  window.toggleUserDropdown = function() {
    document.getElementById('navUserMenu').classList.toggle('open');
  };

  // Close dropdown when clicking outside
  document.addEventListener('click', function(e) {
    const menu = document.getElementById('navUserMenu');
    if (menu && !menu.contains(e.target)) {
      menu.classList.remove('open');
    }
  });

  // ── Logout ──
  window.handleLogout = function() {
    // Clear all session keys
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_name');
    localStorage.removeItem('tazapay_user');
    // Keep tazapay_previous_login so "first_login" trait stays accurate

    if (window.analytics) {
      analytics.track('User Logged Out', { email: email });
      analytics.reset(); // Clears Segment anonymousId — fresh session after logout
    }

    window.location.href = 'login.html';
  };

})();

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar scroll effect
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 50) {
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.boxShadow = 'none';
    }
    
    lastScroll = currentScroll;
});

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const fadeInObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Apply fade-in animation to sections
document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('.feature-box, .demo-card, .industry-card, .testimonial-card, .efficiency-card');
    
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        fadeInObserver.observe(section);
    });
});

// Currency option selection
document.querySelectorAll('.currency-option').forEach(option => {
    option.addEventListener('click', function() {
        // Remove selected class from all options
        document.querySelectorAll('.currency-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        // Add selected class to clicked option
        this.classList.add('selected');
        // Check the radio button
        this.querySelector('input[type="radio"]').checked = true;
    });
});

// Animate flag circles
const flagCircles = document.querySelectorAll('.flag-circle');
flagCircles.forEach((flag, index) => {
    flag.style.animationDelay = `${index * 0.2}s`;
});

// Add hover effect to company logos
document.querySelectorAll('.company-logos img, .investor-logos img').forEach(logo => {
    logo.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.1)';
        this.style.transition = 'transform 0.3s ease';
    });
    
    logo.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
    });
});

// Simulate conversion animation
const conversionInputs = document.querySelectorAll('.conversion-input');
if (conversionInputs.length > 0) {
    setInterval(() => {
        conversionInputs.forEach(input => {
            input.style.transform = 'scale(1.02)';
            setTimeout(() => {
                input.style.transform = 'scale(1)';
            }, 200);
        });
    }, 3000);
}

// Add pulse animation to badges
const badges = document.querySelectorAll('.badge-green');
badges.forEach((badge, index) => {
    setTimeout(() => {
        badge.style.animation = 'pulse 2s infinite';
    }, index * 500);
});

// Add pulse keyframes
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0%, 100% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.05);
        }
    }
`;
document.head.appendChild(style);

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const flagsContainer = document.querySelector('.flags-container');
    
    if (flagsContainer && scrolled < 800) {
        flagsContainer.style.transform = `translateY(${scrolled * 0.2}px)`;
    }
});

// Button hover effects
document.querySelectorAll('.btn-get-started, .btn-contact, .btn-learn-more, .btn-learn-white').forEach(button => {
    button.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px)';
    });
    
    button.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
});

// Mobile menu toggle (for responsive design)
const createMobileMenu = () => {
    if (window.innerWidth <= 768) {
        const navMenu = document.querySelector('.nav-menu');
        const mobileToggle = document.createElement('button');
        mobileToggle.className = 'mobile-toggle';
        mobileToggle.innerHTML = '☰';
        mobileToggle.style.cssText = `
            display: block;
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
        `;
        
        const navWrapper = document.querySelector('.nav-wrapper');
        const navButtons = document.querySelector('.nav-buttons');
        
        if (!document.querySelector('.mobile-toggle')) {
            navWrapper.insertBefore(mobileToggle, navButtons);
        }
        
        mobileToggle.addEventListener('click', () => {
            navMenu.style.display = navMenu.style.display === 'flex' ? 'none' : 'flex';
            navMenu.style.position = 'absolute';
            navMenu.style.top = '100%';
            navMenu.style.left = '0';
            navMenu.style.right = '0';
            navMenu.style.background = 'white';
            navMenu.style.flexDirection = 'column';
            navMenu.style.padding = '20px';
            navMenu.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
        });
    }
};

// Initialize mobile menu on load and resize
window.addEventListener('load', createMobileMenu);
window.addEventListener('resize', createMobileMenu);

// Testimonial card hover effect
document.querySelectorAll('.testimonial-card:not(.with-image)').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-8px)';
        this.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.15)';
        this.style.transition = 'all 0.3s ease';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = 'none';
    });
});

// Industry card hover effect
document.querySelectorAll('.industry-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.05)';
        this.style.transition = 'transform 0.3s ease';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
    });
});

// Console message
console.log('%cTazapay Clone Website', 'font-size: 20px; font-weight: bold; color: #00D4AA;');
console.log('%cBuilt with HTML, CSS, and JavaScript', 'font-size: 14px; color: #0A4D4D;');
console.log('%c💚 Exact replica created', 'font-size: 12px; color: #00D4AA;');

// Loading animation
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});






