/**
 * MedInVedic Visitor & User Analytics Engine
 * Privacy-conscious event logger supporting anonymous sessions and admin metrics
 */
(function (global) {
  'use strict';

  // Event Name Constants
  const EVENTS = {
    PAGE_VIEW: 'page_view',
    LANDING_VIEW: 'landing_page_view',
    DEMO_VIEW: 'demo_view',
    DEMO_START: 'demo_start',
    DEMO_PROGRESS: 'demo_progress',
    DEMO_COMPLETE: 'demo_complete',
    SIGN_IN_CLICKED: 'sign_in_clicked',
    REGISTRATION_STARTED: 'registration_started',
    REGISTRATION_COMPLETED: 'registration_completed',
    LOGIN_SUCCESS: 'login_success',
    LOGOUT: 'logout',
    FEATURE_OPENED: 'feature_opened',
    SEARCH_PERFORMED: 'search_performed',
    AI_QUESTION: 'ai_question',
    RAG_QUERY: 'rag_query'
  };

  const STORAGE_KEY_SESSION = 'mv_analytics_session_id';
  const STORAGE_KEY_EVENTS = 'mv_analytics_events_store';

  // Get or generate anonymous visitor session ID
  function getVisitorSessionId() {
    let sid = localStorage.getItem(STORAGE_KEY_SESSION);
    if (!sid) {
      sid = 'v_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
      localStorage.setItem(STORAGE_KEY_SESSION, sid);
    }
    return sid;
  }

  // Read stored analytics events
  function getStoredEvents() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_EVENTS);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  // Persist event to store (keep max 1000 recent events locally)
  function saveEvent(ev) {
    const events = getStoredEvents();
    events.unshift(ev);
    if (events.length > 1000) events.length = 1000;
    try {
      localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(events));
    } catch (e) {
      console.warn('Analytics storage quota exceeded', e);
    }
  }

  // Get user info if logged in
  function getCurrentUserInfo() {
    let userId = 'anonymous';
    let userRole = 'VISITOR';
    try {
      const authUser = localStorage.getItem('mv_auth_user');
      if (authUser) {
        const u = JSON.parse(authUser);
        userId = u.uid || u.email || 'user';
        userRole = u.role || 'USER';
      }
    } catch (e) {}
    return { userId, userRole };
  }

  // Primary event logger
  function trackEvent(eventName, metadata = {}) {
    const sessionId = getVisitorSessionId();
    const { userId, userRole } = getCurrentUserInfo();
    const eventObj = {
      id: 'ev_' + Math.random().toString(36).substring(2, 9),
      eventName,
      sessionId,
      userId,
      userRole,
      timestamp: new Date().toISOString(),
      dateStr: new Date().toISOString().split('T')[0],
      page: window.location.pathname,
      browser: navigator.userAgent.includes('Chrome') ? 'Chrome' : navigator.userAgent.includes('Firefox') ? 'Firefox' : 'Safari',
      metadata
    };

    saveEvent(eventObj);
    console.log(`[Analytics] 📊 Event tracked: ${eventName}`, metadata);

    // Sync to Firebase Firestore if available
    if (window.db && window.db.collection) {
      window.db.collection('analytics_events').add(eventObj).catch(err => {
        // Silent catch for offline or unauthenticated Firestore rules
      });
    }

    return eventObj;
  }

  // Analytics Aggregator for Admin Dashboard
  function getAnalyticsSummary() {
    const events = getStoredEvents();

    const uniqueSessions = new Set();
    const registeredUsers = new Set();
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    let todayVisitors = 0;
    let yesterdayVisitors = 0;
    let demoViews = 0;
    let demoStarts = 0;
    let demoCompletes = 0;
    let aiQueries = 0;

    const featureUsage = {};
    const popularSearches = {};
    const languageStats = {};

    events.forEach(ev => {
      if (ev.sessionId) uniqueSessions.add(ev.sessionId);
      if (ev.userId && ev.userId !== 'anonymous') registeredUsers.add(ev.userId);

      if (ev.dateStr === todayStr) todayVisitors++;
      if (ev.dateStr === yesterdayStr) yesterdayVisitors++;

      if (ev.eventName === EVENTS.DEMO_VIEW) demoViews++;
      if (ev.eventName === EVENTS.DEMO_START) demoStarts++;
      if (ev.eventName === EVENTS.DEMO_COMPLETE) demoCompletes++;

      if (ev.eventName === EVENTS.AI_QUESTION || ev.eventName === EVENTS.RAG_QUERY) {
        aiQueries++;
      }

      if (ev.eventName === EVENTS.FEATURE_OPENED && ev.metadata && ev.metadata.feature) {
        const feat = ev.metadata.feature;
        featureUsage[feat] = (featureUsage[feat] || 0) + 1;
      }

      if (ev.eventName === EVENTS.SEARCH_PERFORMED && ev.metadata && ev.metadata.query) {
        const q = ev.metadata.query.toLowerCase().trim();
        if (q) popularSearches[q] = (popularSearches[q] || 0) + 1;
      }

      if (ev.metadata && ev.metadata.language) {
        const lang = ev.metadata.language;
        languageStats[lang] = (languageStats[lang] || 0) + 1;
      }
    });

    return {
      totalEvents: events.length,
      totalVisitors: events.length,
      uniqueVisitors: uniqueSessions.size,
      registeredUsers: registeredUsers.size,
      todayVisitors,
      yesterdayVisitors,
      demoViews,
      demoStarts,
      demoCompletes,
      demoCompletionRate: demoStarts > 0 ? Math.round((demoCompletes / demoStarts) * 100) : 0,
      aiQueries,
      featureUsage,
      popularSearches,
      languageStats,
      recentEvents: events.slice(0, 50)
    };
  }

  // Export UMD
  const AnalyticsEngine = {
    EVENTS,
    getVisitorSessionId,
    trackEvent,
    getAnalyticsSummary,
    getStoredEvents
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnalyticsEngine;
  }
  global.AnalyticsEngine = AnalyticsEngine;

  // Auto-track page view on load
  document.addEventListener('DOMContentLoaded', () => {
    const pageName = window.location.pathname.includes('landing') ? EVENTS.LANDING_VIEW : EVENTS.PAGE_VIEW;
    AnalyticsEngine.trackEvent(pageName, { title: document.title });
  });

})(typeof window !== 'undefined' ? window : global);
