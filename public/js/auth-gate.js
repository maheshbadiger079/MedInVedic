/**
 * MedInVedic Authentication Gate
 * Handles login modal, auth state persistence, and seamless browsing
 */

import { auth, signInWithGoogle, logoutUser, RecaptchaVerifier, signInWithPhoneNumber } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// ── AGGRESSIVE BYPASS (RUNS IMMEDIATELY) ──────────────────────────
const checkIsApp = () => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('is_app') === 'true' || urlParams.get('app_mode') === 'true') {
       localStorage.setItem('mv_is_app', 'true');
    }
    const ua = navigator.userAgent || "";
    return localStorage.getItem('mv_is_app') === 'true' || 
           ua.includes('MV_APP') || 
           ua.includes('MV_APP_V3') ||
           ua.includes('MedInVedicApp') ||
           !!window.flutter_inappwebview;
};

const IS_APP_MODE = checkIsApp();
const getPrefix = () => window.location.pathname.includes('pages/') ? '../' : '';

const createAuthGateUI = () => {
  if (IS_APP_MODE) return;
  if (document.getElementById('authGate')) return;

  const gateHTML = `
    <div id="authGate" class="hidden" style="display: none;">
      <div class="auth-container" style="position: relative;">
        <!-- Close Button -->
        <button id="gateCloseBtn" type="button" aria-label="Close" style="
          position: absolute; top: 18px; right: 18px;
          background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2);
          color: #ffffff; width: 34px; height: 34px; border-radius: 50%;
          font-size: 16px; font-weight: 700; cursor: pointer;
          display: flex; align-items: center; justify-content: center; z-index: 30;
          transition: background 0.2s;
        " onmouseover="this.style.background='rgba(255,255,255,0.25)'" onmouseout="this.style.background='rgba(255,255,255,0.12)'">✕</button>

        <!-- Loading State -->
        <div id="gateLoading" class="gate-loading" style="display: none;">
          <div class="spinner"></div>
          <div class="loading-text">Verifying Session...</div>
        </div>

        <!-- Login Card -->
        <div id="gateLogin">
          <div class="gate-logo-container">
            <img src="${getPrefix()}images/assets/app_logo.png?v=v_newlogo_v2" class="gate-logo-img" alt="MedInVedic Logo">
          </div>
          <h1 class="gate-title">MedInVedic</h1>
          <p class="gate-subtitle">Where Modern Medicine Meets Ancient Ayurveda. Sign in to sync your profile & consultations.</p>

          <!-- Google Sign-In (Primary) -->
          <button id="googleSignInBtn" style="
            display: flex; align-items: center; justify-content: center; gap: 12px;
            width: 100%; padding: 14px 20px; margin-top: 20px;
            background: white; color: #1f2937; border: none;
            border-radius: 14px; font-size: 15px; font-weight: 700;
            cursor: pointer; transition: opacity 0.2s; font-family: inherit;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
          ">
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="20" height="20" alt="Google">
            Continue with Google
          </button>

          <!-- Divider -->
          <div style="display:flex; align-items:center; gap:12px; margin: 18px 0; color:#64748b; font-size:12px;">
            <div style="flex:1; height:1px; background:rgba(255,255,255,0.1);"></div>
            or use email
            <div style="flex:1; height:1px; background:rgba(255,255,255,0.1);"></div>
          </div>

          <!-- Email / Password -->
          <input type="email" id="gateEmail" placeholder="Email address" class="auth-input" style="margin-bottom:10px;">
          <input type="password" id="gatePassword" placeholder="Password (min 6 chars)" class="auth-input">
          <button id="emailAuthBtn" style="
            width:100%; padding:13px; margin-top:12px;
            background: linear-gradient(135deg,#2563eb,#059669);
            color:white; border:none; border-radius:12px;
            font-size:14px; font-weight:700; cursor:pointer; font-family:inherit;
          ">Sign In with Email</button>
          <p id="toggleAuthMode" style="margin-top:10px; color:#60a5fa; font-size:13px; cursor:pointer; text-align:center;">New user? Create Account</p>

          <p id="authError" style="color:#ef4444; font-size:13px; margin-top:10px; display:none;"></p>

          <p style="margin-top:18px; color:#94a3b8; font-size:12px; text-align:center;">
            By continuing, you agree to our Terms and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('afterbegin', gateHTML);

  const closeBtn = document.getElementById('gateCloseBtn');
  if (closeBtn) {
    closeBtn.onclick = () => window.closeAuthGate();
  }
};

// ── GLOBAL MODAL CONTROLS ─────────────────────────────────────────
window.openAuthGate = () => {
  createAuthGateUI();
  const gate = document.getElementById('authGate');
  const loading = document.getElementById('gateLoading');
  const login = document.getElementById('gateLogin');
  if (gate) {
    if (loading) loading.style.display = 'none';
    if (login) login.style.display = 'block';
    gate.style.display = 'flex';
    gate.classList.remove('hidden');
  }
};

window.closeAuthGate = () => {
  const gate = document.getElementById('authGate');
  if (gate) {
    gate.classList.add('hidden');
    setTimeout(() => { gate.style.display = 'none'; }, 300);
  }
  if (document.body) {
    document.body.classList.remove('auth-locked');
  }
};

// ── AUTH LOGIC ────────────────────────────────────────────────────
window.confirmationResult = null;

const handleAuthState = async (user) => {
  const gate = document.getElementById('authGate');
  
  if (user) {
    console.log('✅ User Authenticated:', user.email || user.phoneNumber);
    
    if (window.AuthGuard) {
      window.AuthGuard.setAuthUser({
        uid: user.uid,
        email: user.email || user.phoneNumber,
        displayName: user.displayName || user.email || 'MedInVedic Member'
      });
    }

    if (window.AnalyticsEngine) {
      window.AnalyticsEngine.trackEvent(window.AnalyticsEngine.EVENTS.LOGIN_SUCCESS, {
        email: user.email || user.phoneNumber
      });
    }

    // Sync with generic backend if needed
    if (window.API && window.API.auth && (!window.API.auth.isLoggedIn || !window.API.auth.isLoggedIn())) {
      try {
        const identifier = user.email || user.phoneNumber || user.uid;
        const name = user.displayName || 'User';
        await window.API.auth.socialLogin(name, identifier, 'google');
      } catch (err) {
        console.warn('Backend sync warning:', err);
      }
    }
    
    updateNavbarProfile(user);
    window.closeAuthGate();
  } else {
    window.closeAuthGate();
  }
};

const setupGoogleAuth = () => {
  const googleBtn = document.getElementById('googleSignInBtn');
  if (!googleBtn) return;

  googleBtn.onclick = async () => {
    const errorText = document.getElementById('authError');
    try {
      googleBtn.disabled = true;
      googleBtn.textContent = 'Signing in with Google...';
      if (errorText) errorText.style.display = 'none';
      await signInWithGoogle();
    } catch (err) {
      console.error('Google Sign-In error:', err);
      googleBtn.disabled = false;
      googleBtn.innerHTML = `<img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="20" height="20" alt="Google"> Continue with Google`;
      if (errorText && err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
        errorText.textContent = 'Google sign-in failed. Please try again.';
        errorText.style.display = 'block';
      }
    }
  };
};

const setupEmailAuth = () => {
  const emailInput   = document.getElementById('gateEmail');
  const passInput    = document.getElementById('gatePassword');
  const loginBtn     = document.getElementById('emailAuthBtn');
  const toggleBtn    = document.getElementById('toggleAuthMode');
  const errorText    = document.getElementById('authError');

  if (!loginBtn) return;

  let isRegisterMode = false;

  if (toggleBtn) {
    toggleBtn.onclick = () => {
      isRegisterMode = !isRegisterMode;
      loginBtn.textContent   = isRegisterMode ? 'Create Account' : 'Sign In with Email';
      toggleBtn.textContent  = isRegisterMode ? 'Already have an account? Sign In' : 'New user? Create Account';
      if (errorText) errorText.style.display = 'none';
    };
  }

  loginBtn.onclick = async () => {
    const email = (emailInput?.value || '').trim();
    const pass  = (passInput?.value || '').trim();
    if (!email || !pass) {
      if (errorText) {
        errorText.textContent = 'Please enter your email and password.';
        errorText.style.display = 'block';
      }
      return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = isRegisterMode ? 'Creating account...' : 'Signing in...';
    if (errorText) errorText.style.display = 'none';

    try {
      const m = await import('./firebase-config.js');
      if (isRegisterMode) {
        await m.registerUser(email, pass, email.split('@')[0]);
      } else {
        await m.loginUser(email, pass);
      }
    } catch (error) {
      console.error('Email Auth Error:', error);
      const msg = {
        'auth/email-already-in-use':  'This email is already registered. Try signing in.',
        'auth/user-not-found':        'No account found. Try creating one.',
        'auth/wrong-password':        'Incorrect password. Please try again.',
        'auth/weak-password':         'Password must be at least 6 characters.',
        'auth/invalid-email':         'Please enter a valid email address.',
        'auth/invalid-credential':    'Invalid email or password. Please check and retry.',
      }[error.code] || error.message;
      if (errorText) {
        errorText.textContent = msg;
        errorText.style.display = 'block';
      }
      loginBtn.disabled = false;
      loginBtn.textContent = isRegisterMode ? 'Create Account' : 'Sign In with Email';
    }
  };

  [emailInput, passInput].forEach(el => {
    if (el) el.addEventListener('keydown', e => { if (e.key === 'Enter') loginBtn.click(); });
  });
};

const updateNavbarProfile = (user) => {
  const navAuth = document.querySelector('.nav-auth');
  const sideNavAcc = document.getElementById('sideNavAccount');
  const prefix = getPrefix();
  
  const userIdentifier = user.displayName || user.email?.split('@')[0] || user.phoneNumber || 'User';

  const userProfileHTML = `
    <div class="user-profile-mini" id="navUserProfile" onclick="goToDashboard()">
      <img src="${user.photoURL || prefix + 'images/assets/doc_avatar.png'}" class="user-avatar" alt="Profile">
      <span class="user-name">${userIdentifier}</span>
    </div>
  `;

  if (navAuth) navAuth.innerHTML = userProfileHTML;
  if (sideNavAcc) {
    sideNavAcc.innerHTML = `👤 My Profile (${userIdentifier})`;
    sideNavAcc.onclick = (e) => { e.preventDefault(); goToDashboard(); };
    sideNavAcc.href = '#';
  }

  document.querySelectorAll('.logout-btn').forEach(btn => {
    btn.onclick = async () => {
      if (confirm('Are you sure you want to logout?')) {
        await logoutUser();
        window.closeAuthGate();
      }
    };
  });
};

window.goToDashboard = () => {
  const prefix = getPrefix();
  window.location.href = `${prefix}pages/dashboard.html`.replace('pages/pages/', 'pages/');
};

// ── INITIALIZATION ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  if (document.body) {
    document.body.classList.remove('auth-locked');
  }

  if (IS_APP_MODE) return;

  createAuthGateUI();
  setupGoogleAuth();
  setupEmailAuth();

  // Attach openAuthGate to signin triggers if present
  document.querySelectorAll('.nav-account, .open-login-modal').forEach(el => {
    el.addEventListener('click', (e) => {
      if (!auth.currentUser) {
        e.preventDefault();
        window.openAuthGate();
      }
    });
  });

  // Monitor Auth State
  onAuthStateChanged(auth, handleAuthState);
});
