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
    "landing.html","login.html","register.html",
    "forgot-password.html","privacy.html","privacy-policy.html"
  ];

  // Verified admin email whitelist — only these emails get admin role
  const ADMIN_EMAILS = [
    "admin@medinvedic.com",
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
          parsed.role = isAdminEmail(parsed.email) ? "SUPER_ADMIN" : (parsed.role || "USER").toUpperCase();
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
            const userObj = {
              uid: payload.id || payload.uid || "u_token",
              email: payload.email || "",
              displayName: payload.name || payload.displayName || email.split("@")[0] || "User",
              role: isAdminEmail(email) ? "SUPER_ADMIN" : ((payload.role || "USER").toUpperCase())
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
        const userObj = {
          uid: u.uid,
          email: u.email,
          displayName: u.displayName || email.split("@")[0] || "User",
          role: isAdminEmail(email) ? "SUPER_ADMIN" : (localStorage.getItem("mv_user_role") || "USER").toUpperCase()
        };
        localStorage.setItem("mv_auth_user", JSON.stringify(userObj));
        localStorage.setItem("mv_user_role", userObj.role);
        return userObj;
      }
    } catch (e) {}

    // No session — return null (NO auto-admin fallback)
    return null;
  }

  function isAuthenticated() { return !!getAuthUser(); }

  function getUserRole() {
    const user = getAuthUser();
    return user ? (user.role || "USER").toUpperCase() : "VISITOR";
  }

  function isAdmin() {
    const role = getUserRole();
    return role === "ADMIN" || role === "SUPER_ADMIN";
  }

  function setAuthUser(userData) {
    const email = (userData.email || "").toLowerCase();
    const userObj = {
      uid: userData.uid || "u_" + Math.random().toString(36).substring(2, 9),
      email: userData.email || "",
      displayName: userData.displayName || userData.name || email.split("@")[0] || "User",
      role: isAdminEmail(email) ? "SUPER_ADMIN" : (userData.role || "USER").toUpperCase(),
      loginTime: new Date().toISOString()
    };
    localStorage.setItem("mv_auth_user", JSON.stringify(userObj));
    localStorage.setItem("mv_user_role", userObj.role);
    return userObj;
  }

  function clearAuthSession() {
    localStorage.removeItem("mv_auth_user");
    localStorage.removeItem("mv_user_role");
    if (window.firebase && window.firebase.auth) {
      window.firebase.auth().signOut().catch(function(){});
    }
  }

  function applyAdminVisibility() {
    var adminVisible = isAdmin();
    document.querySelectorAll("[data-admin-only]").forEach(function(el) {
      el.style.display = adminVisible ? "" : "none";
    });
    document.querySelectorAll(".admin-only-link").forEach(function(el) {
      el.style.display = adminVisible ? "" : "none";
    });
  }

  function checkRouteAccess() {
    var path = window.location.pathname;
    var filename = path.substring(path.lastIndexOf("/") + 1) || "index.html";
    var isPublic = PUBLIC_PAGES.some(function(p) { return filename.endsWith(p); });
    var user = getAuthUser();
    var prefix = path.includes("pages/") ? "../" : "";

    console.log("[AuthGuard] Route: " + filename + " | Auth: " + !!user + " | Role: " + (user ? user.role : "NONE"));

    // STRICT ADMIN GATE — admin.html is off-limits to non-admins
    if (filename.endsWith("admin.html")) {
      if (!user) {
        console.warn("[AuthGuard] BLOCKED: No session. Redirecting to login.");
        window.location.href = prefix + "login.html?redirect=admin&reason=auth_required";
        return false;
      }
      if (!isAdmin()) {
        console.warn("[AuthGuard] BLOCKED: Role=" + user.role + " is not admin.");
        window.location.href = prefix + "login.html?redirect=admin&reason=admin_required";
        return false;
      }
      console.log("[AuthGuard] Admin access GRANTED:", user.email);
      return true;
    }

    // General auth gate
    if (!isPublic && !user) {
      console.warn("[AuthGuard] Not authenticated. Redirecting to landing.");
      window.location.href = prefix + "landing.html";
      return false;
    }

    return true;
  }

  var AuthGuard = {
    getAuthUser: getAuthUser,
    isAuthenticated: isAuthenticated,
    getUserRole: getUserRole,
    isAdmin: isAdmin,
    isAdminEmail: isAdminEmail,
    setAuthUser: setAuthUser,
    clearAuthSession: clearAuthSession,
    checkRouteAccess: checkRouteAccess,
    applyAdminVisibility: applyAdminVisibility,
    ADMIN_EMAILS: ADMIN_EMAILS
  };

  if (typeof module !== "undefined" && module.exports) { module.exports = AuthGuard; }
  global.AuthGuard = AuthGuard;

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
  }

})(typeof window !== "undefined" ? window : global);
