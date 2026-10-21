/**
 * MedInVedic Authentication & Authorization Guard
 * SECURITY MODEL:
 *   - Admin role ONLY assigned at login by verified email whitelist.
 *   - Visiting admin.html NEVER auto-promotes any user to admin.
 *   - Non-admins visiting admin.html are redirected to login.
 *   - Admin UI elements use [data-admin-only] / .admin-only-link class.
 */
(function (global) {
  "use strict";

  const PUBLIC_PAGES = [
    "login.html", "register.html",
    "forgot-password.html", "privacy.html", "privacy-policy.html"
  ];

  // Verified admin email whitelist — ONLY this email gets admin role & portal access
  const ADMIN_EMAILS = [
    "maheshbadiger079@gmail.com"
  ];

  function isAdminEmail(email) {
    return ADMIN_EMAILS.includes((email || "").toLowerCase().trim());
  }

  function getAuthUser() {
    // Source 1: mv_auth_user localStorage
    try {
      const raw = localStorage.getItem("mv_auth_user");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.email) {
          const isAdm = isAdminEmail(parsed.email);
          parsed.role = isAdm ? "SUPER_ADMIN" : "USER";
          parsed.emailVerified = isAdm ? true : (parsed.emailVerified !== false);
          return parsed;
        }
      }
    } catch (e) {}

    // Source 2: mv_token JWT
    try {
      const mvToken = localStorage.getItem("mv_token");
      if (mvToken && mvToken.includes(".")) {
        const parts = mvToken.split(".");
        if (parts[1]) {
          const payload = JSON.parse(decodeURIComponent(escape(atob(parts[1]))));
          if (payload && (payload.email || payload.id)) {
            const email = (payload.email || "").toLowerCase();
            const isAdm = isAdminEmail(email);
            const userObj = {
              uid: payload.id || payload.uid || "u_token",
              email: payload.email || "",
              displayName: payload.name || payload.displayName || email.split("@")[0] || "User",
              role: isAdm ? "SUPER_ADMIN" : "USER",
              emailVerified: isAdm ? true : (payload.emailVerified !== false)
            };
            localStorage.setItem("mv_auth_user", JSON.stringify(userObj));
            localStorage.setItem("mv_user_role", userObj.role);
            return userObj;
          }
        }
      }
    } catch (e) {}

    // Source 3: Firebase Auth currentUser
    try {
      if (window.firebase && window.firebase.auth && window.firebase.auth().currentUser) {
        const u = window.firebase.auth().currentUser;
        const email = (u.email || "").toLowerCase();
        const isAdm = isAdminEmail(email);
        const userObj = {
          uid: u.uid,
          email: u.email,
          displayName: u.displayName || email.split("@")[0] || "User",
          role: isAdm ? "SUPER_ADMIN" : "USER",
          emailVerified: isAdm ? true : (u.emailVerified === true)
        };
        localStorage.setItem("mv_auth_user", JSON.stringify(userObj));
        localStorage.setItem("mv_user_role", userObj.role);
        return userObj;
      }
    } catch (e) {}

    // No session — return null (NO auto-admin fallback)
    return null;
  }

  function isAuthenticated() { 
    const user = getAuthUser();
    if (!user) return false;
    if (isAdminEmail(user.email)) return true;
    return user.emailVerified !== false;
  }

  function isEmailVerified() {
    const user = getAuthUser();
    if (!user) return false;
    if (isAdminEmail(user.email)) return true;
    return user.emailVerified === true;
  }

  function getUserRole() {
    const user = getAuthUser();
    return user ? (user.role || "USER").toUpperCase() : "VISITOR";
  }

  function isAdmin() {
    const user = getAuthUser();
    return !!(user && user.email && isAdminEmail(user.email));
  }

  function setAuthUser(userData) {
    const email = (userData.email || "").toLowerCase().trim();
    const isAdm = isAdminEmail(email);
    const userObj = {
      uid: userData.uid || "u_" + Math.random().toString(36).substring(2, 9),
      email: userData.email || "",
      displayName: userData.displayName || userData.name || email.split("@")[0] || "User",
      role: isAdm ? "SUPER_ADMIN" : "USER",
      emailVerified: isAdm ? true : (userData.emailVerified !== false),
      loginTime: new Date().toISOString()
    };
    localStorage.setItem("mv_auth_user", JSON.stringify(userObj));
    localStorage.setItem("mv_user_role", userObj.role);
    try { applyAdminVisibility(); } catch(e) {}
    return userObj;
  }

  function clearAuthSession() {
    try {
      localStorage.removeItem("mv_auth_user");
      localStorage.removeItem("mv_user_role");
      localStorage.removeItem("mv_token");
      localStorage.removeItem("mv_auth_token");
      localStorage.removeItem("miv_user");
      localStorage.removeItem("miv_token");
      localStorage.removeItem("miv_cart");
      sessionStorage.clear();
    } catch(e) {}
    try { applyAdminVisibility(); } catch(e) {}
    try {
      if (window.firebase && window.firebase.auth) {
        window.firebase.auth().signOut().catch(function(){});
      }
    } catch(e) {}
  }

  function handleLogout() {
    clearAuthSession();
    var path = (typeof window !== "undefined" && window.location.pathname) || "";
    var inPages = path.includes("pages/");
    var loginUrl = inPages ? "login.html" : "pages/login.html";
    if (typeof window !== "undefined") {
      window.location.replace(loginUrl + "?reason=logged_out");
    }
  }

  function applyAdminVisibility() {
    var adminVisible = isAdmin();
    document.querySelectorAll("[data-admin-only], .admin-only-link, #sidebarAdminLink").forEach(function(el) {
      el.style.display = adminVisible ? "" : "none";
    });
  }

  function checkRouteAccess() {
    var path = window.location.pathname || "";
    var filename = path.substring(path.lastIndexOf("/") + 1) || "index.html";
    var isPublic = PUBLIC_PAGES.some(function(p) { return filename.endsWith(p); });
    var user = getAuthUser();
    var inPages = path.includes("pages/");
    var loginUrl = inPages ? "login.html" : "pages/login.html";

    console.log("[AuthGuard] Route: " + filename + " | Auth: " + !!user + " | Role: " + (user ? user.role : "NONE"));

    // STRICT ADMIN GATE — admin.html is off-limits to non-admins
    if (filename.endsWith("admin.html")) {
      if (!user) {
        console.warn("[AuthGuard] BLOCKED: No session. Redirecting to login.");
        window.location.replace(loginUrl + "?redirect=admin.html&reason=auth_required");
        return false;
      }
      if (!isAdmin()) {
        console.warn("[AuthGuard] BLOCKED: Role=" + user.role + " is not admin.");
        window.location.replace(loginUrl + "?redirect=admin.html&reason=admin_required");
        return false;
      }
      console.log("[AuthGuard] Admin access GRANTED:", user.email);
      return true;
    }

    // STRICT GENERAL AUTH GATE — Users must log in with verified email to access Home or any protected page
    if (!isPublic) {
      if (!user) {
        console.warn("[AuthGuard] Not authenticated. Redirecting to login page.");
        window.location.replace(loginUrl + "?redirect=" + encodeURIComponent(filename) + "&reason=auth_required");
        return false;
      }
      if (user.emailVerified === false && !isAdminEmail(user.email)) {
        console.warn("[AuthGuard] BLOCKED: Email not verified for " + user.email);
        window.location.replace(loginUrl + "?redirect=" + encodeURIComponent(filename) + "&reason=email_unverified");
        return false;
      }
    }

    return true;
  }

  var AuthGuard = {
    getAuthUser: getAuthUser,
    isAuthenticated: isAuthenticated,
    isEmailVerified: isEmailVerified,
    getUserRole: getUserRole,
    isAdmin: isAdmin,
    isAdminEmail: isAdminEmail,
    setAuthUser: setAuthUser,
    clearAuthSession: clearAuthSession,
    handleLogout: handleLogout,
    checkRouteAccess: checkRouteAccess,
    applyAdminVisibility: applyAdminVisibility,
    ADMIN_EMAILS: ADMIN_EMAILS
  };

  if (typeof module !== "undefined" && module.exports) { module.exports = AuthGuard; }
  global.AuthGuard = AuthGuard;
  global.handleLogout = handleLogout;
  global.doLogout = handleLogout;
  global.logoutUser = handleLogout;

  // Run immediate synchronous route check
  if (typeof window !== "undefined") {
    try {
      checkRouteAccess();
    } catch(e) {}
  }

  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", function() {
      AuthGuard.checkRouteAccess();
      setTimeout(function() { AuthGuard.applyAdminVisibility(); }, 150);
    });

    // Delegated click handler to guarantee ALL logout buttons across all pages work seamlessly
    document.addEventListener("click", function(e) {
      var el = e.target;
      if (el && (el.matches(".logout-btn, .btn-logout, [data-logout], button[onclick*='logout'], a[onclick*='logout']") || el.closest(".logout-btn, .btn-logout, [data-logout]"))) {
        e.preventDefault();
        e.stopPropagation();
        handleLogout();
      }
    });
  }

})(typeof window !== "undefined" ? window : global);
