/**
 * MedInVedic Production GA4 & Privacy-Conscious Analytics Engine
 * Measurement ID: G-RW9JCDWBQ7
 * 
 * Features:
 * - Production-ready Google Analytics 4 (gtag.js) dynamic loading
 * - Strict Privacy Safeguards (HIPAA/DISHA/GDPR compliant PII redaction)
 * - Do Not Track (DNT) and User Consent Management
 * - Standard GA4 E-Commerce & Healthcare/Vedic event taxonomy
 * - Full backward compatibility with existing AnalyticsEngine API
 * - Local visitor session tracking and admin dashboard aggregation
 */
(function (global) {
  'use strict';

  const GA4_MEASUREMENT_ID = (typeof global !== 'undefined' && global.MEDINVEDIC_GA4_ID) || 'G-RW9JCDWBQ7';
  const STORAGE_KEY_SESSION = 'mv_analytics_session_id';
  const STORAGE_KEY_EVENTS = 'mv_analytics_events_store';
  const STORAGE_KEY_CONSENT = 'mv_analytics_consent';

  // Comprehensive Event Taxonomy Constants
  const EVENTS = {
    // Navigation & Page Views
    PAGE_VIEW: 'page_view',
    LANDING_VIEW: 'landing_page_view',
    DEMO_VIEW: 'demo_view',
    DEMO_START: 'demo_start',
    DEMO_PROGRESS: 'demo_progress',
    DEMO_COMPLETE: 'demo_complete',

    // Authentication & Access
    SIGN_IN_CLICKED: 'sign_in_clicked',
    REGISTRATION_STARTED: 'registration_started',
    REGISTRATION_COMPLETED: 'registration_completed',
    LOGIN_SUCCESS: 'login_success',
    LOGOUT: 'logout',

    // E-Commerce (GA4 Standard Compliant)
    VIEW_ITEM: 'view_item',
    ADD_TO_CART: 'add_to_cart',
    REMOVE_FROM_CART: 'remove_from_cart',
    BEGIN_CHECKOUT: 'begin_checkout',
    PURCHASE: 'purchase',

    // Healthcare, Clinical AI & RAG
    RAG_QUERY: 'rag_query',
    AI_QUESTION: 'ai_question',
    AI_CONSULTATION: 'ai_consultation',
    HEALTH_SCORE_CALCULATED: 'health_score_calculated',
    PRAKRITI_ASSESSMENT_COMPLETED: 'prakriti_assessment_completed',
    VEDICMIND_QUIZ_COMPLETED: 'vedicmind_quiz_completed',
    PRESCRIPTION_DECODED: 'prescription_decoded',
    PRESCRIPTION_UPLOADED: 'prescription_uploaded',
    DOCTOR_SEARCH: 'doctor_search',
    DOCTOR_CONSULTATION_BOOKED: 'doctor_consultation_booked',
    SOS_EMERGENCY_TRIGGERED: 'sos_emergency_triggered',
    HEALING_HUB_ACTION: 'healing_hub_action',
    LANGUAGE_CHANGED: 'language_changed',
    FEATURE_OPENED: 'feature_opened',
    SEARCH_PERFORMED: 'search_performed'
  };

  // ─────────────────────────────────────────────────────────────
  // 1. PRIVACY & SANITIZATION LAYER (HIPAA / GDPR / DISHA)
  // ─────────────────────────────────────────────────────────────

  // Regular expressions for PII detection and redaction
  const PII_PATTERNS = {
    // Email addresses
    EMAIL: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/gi,
    // Indian 10-digit mobile numbers (optional +91 or 0 prefix)
    PHONE: /(?:\+?91[-.\s]?)?[6-9]\d{9}\b/g,
    // 12-digit Indian Aadhaar or National ID formats
    AADHAAR_ID: /\b\d{4}[\s\-]?\d{4}[\s\-]?\d{4}\b/g,
    // Sensitive auth tokens / keys (hex or base64 length > 30)
    TOKEN: /\b(bearer\s+[A-Za-z0-9\-_=]+\.[A-Za-z0-9\-_=]+\.?[A-Za-z0-9\-_=]*|[A-Fa-f0-9]{32,})\b/gi
  };

  // Sensitive parameter keys that should never be logged or sent to GA4
  const BLACKLISTED_KEYS = new Set([
    'password', 'pass', 'pwd', 'token', 'auth_token', 'accessToken',
    'prescriptionImage', 'rawOcr', 'raw_ocr', 'patientPhoto', 'symptomDetailsRaw',
    'medicalHistoryRaw', 'aadhaar', 'ssn', 'creditCard', 'cardNumber', 'cvv'
  ]);

  /**
   * Scrub text string of any PII
   */
  function maskPII(value) {
    if (typeof value !== 'string') return value;
    return value
      .replace(PII_PATTERNS.EMAIL, '[EMAIL_REDACTED]')
      .replace(PII_PATTERNS.PHONE, '[PHONE_REDACTED]')
      .replace(PII_PATTERNS.AADHAAR_ID, '[ID_REDACTED]')
      .replace(PII_PATTERNS.TOKEN, '[TOKEN_REDACTED]');
  }

  /**
   * Deeply sanitize metadata objects before sending to analytics
   */
  function sanitizeMetadata(obj, depth) {
    depth = depth || 0;
    if (!obj || typeof obj !== 'object' || depth > 4) return obj;
    if (Array.isArray(obj)) {
      return obj.map(function(item) {
        return typeof item === 'object' ? sanitizeMetadata(item, depth + 1) : maskPII(item);
      });
    }
    const clean = {};
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (BLACKLISTED_KEYS.has(key)) {
        clean[key] = '[PROTECTED_HEALTH_DATA]';
        continue;
      }
      if (typeof val === 'string') {
        clean[key] = maskPII(val);
      } else if (typeof val === 'object' && val !== null) {
        clean[key] = sanitizeMetadata(val, depth + 1);
      } else {
        clean[key] = val;
      }
    }
    return clean;
  }

  /**
   * Check if Do Not Track (DNT) is enabled in user's browser
   */
  function isDNTEnabled() {
    try {
      if (typeof navigator !== 'undefined') {
        return navigator.doNotTrack === '1' || (typeof window !== 'undefined' && window.doNotTrack === '1') || navigator.msDoNotTrack === '1';
      }
    } catch (e) {}
    return false;
  }

  /**
   * Get user analytics consent status ('granted', 'denied', or 'default')
   */
  function getConsentStatus() {
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_KEY_CONSENT);
        if (stored) return stored;
      }
    } catch (e) {}
    return isDNTEnabled() ? 'denied' : 'granted';
  }

  /**
   * Set user analytics consent
   */
  function setConsent(granted) {
    const status = granted ? 'granted' : 'denied';
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_CONSENT, status);
      }
    } catch (e) {}

    // Update GA4 consent mode if available
    if (typeof global.gtag === 'function') {
      try {
        global.gtag('consent', 'update', {
          analytics_storage: status
        });
      } catch (e) {}
    }
    return status;
  }

  // ─────────────────────────────────────────────────────────────
  // 2. GA4 DYNAMIC SCRIPT LOADER & INITIALIZER
  // ─────────────────────────────────────────────────────────────

  function initGA4() {
    // Only load in browser environments
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    // Respect strict DNT / explicit denial
    const consent = getConsentStatus();
    
    // Setup dataLayer & gtag
    window.dataLayer = window.dataLayer || [];
    if (!window.gtag) {
      window.gtag = function () {
        window.dataLayer.push(arguments);
      };
    }

    // Default consent configuration
    window.gtag('consent', 'default', {
      analytics_storage: consent === 'denied' ? 'denied' : 'granted',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      wait_for_update: 500
    });

    window.gtag('js', new Date());
    window.gtag('config', GA4_MEASUREMENT_ID, {
      anonymize_ip: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      restricted_data_processing: true,
      send_page_view: false // Managed explicitly by trackPageView to prevent double-counting
    });

    // Inject Google Tag Manager Script if not already in document
    const scriptId = 'ga4-gtag-script';
    if (!document.getElementById(scriptId)) {
      try {
        const script = document.createElement('script');
        script.id = scriptId;
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`;
        (document.head || document.documentElement).appendChild(script);
      } catch (e) {
        // Safe catch for CSP or adblockers
      }
    }
  }

  // Auto-init GA4 non-blockingly
  try {
    if (typeof window !== 'undefined') {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initGA4);
      } else {
        initGA4();
      }
    }
  } catch (e) {}

  // ─────────────────────────────────────────────────────────────
  // 3. VISITOR SESSIONS & LOCAL STORAGE ENGINE
  // ─────────────────────────────────────────────────────────────

  function getVisitorSessionId() {
    try {
      if (typeof localStorage !== 'undefined') {
        let sid = localStorage.getItem(STORAGE_KEY_SESSION);
        if (!sid) {
          sid = 'v_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
          localStorage.setItem(STORAGE_KEY_SESSION, sid);
        }
        return sid;
      }
    } catch (e) {}
    return 'v_temp_' + Date.now();
  }

  function getStoredEvents() {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(STORAGE_KEY_EVENTS);
        return raw ? JSON.parse(raw) : [];
      }
    } catch (e) {}
    return [];
  }

  function saveEvent(ev) {
    try {
      if (typeof localStorage !== 'undefined') {
        const events = getStoredEvents();
        events.unshift(ev);
        if (events.length > 1000) events.length = 1000;
        localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(events));
      }
    } catch (e) {
      console.warn('[Analytics] Local storage quota exceeded', e);
    }
  }

  function getCurrentUserInfo() {
    let userId = 'anonymous';
    let userRole = 'VISITOR';
    try {
      if (typeof localStorage !== 'undefined') {
        const authUser = localStorage.getItem('mv_auth_user') || localStorage.getItem('miv_user');
        if (authUser) {
          const u = JSON.parse(authUser);
          // Never log raw email as user id if email format; anonymize with user-ID or pseudonymous token
          if (u.uid) {
            userId = u.uid;
          } else if (u.email) {
            userId = 'u_' + Math.abs(u.email.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0)).toString(36);
          } else {
            userId = 'user';
          }
          userRole = u.role || 'USER';
        }
      }
    } catch (e) {}
    return { userId, userRole };
  }

  // ─────────────────────────────────────────────────────────────
  // 4. DISPATCH ENGINE (Local + GA4 + Firestore)
  // ─────────────────────────────────────────────────────────────

  function trackEvent(eventName, rawMetadata) {
    const cleanMeta = sanitizeMetadata(rawMetadata || {});
    const sessionId = getVisitorSessionId();
    const { userId, userRole } = getCurrentUserInfo();
    
    const pathname = typeof window !== 'undefined' && window.location ? window.location.pathname : (global.location ? global.location.pathname : '/');
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    const browser = userAgent.includes('Chrome') ? 'Chrome' : userAgent.includes('Firefox') ? 'Firefox' : userAgent.includes('Safari') ? 'Safari' : 'Other';

    const eventObj = {
      id: 'ev_' + Math.random().toString(36).substring(2, 9),
      eventName: eventName,
      sessionId: sessionId,
      userId: userId,
      userRole: userRole,
      timestamp: new Date().toISOString(),
      dateStr: new Date().toISOString().split('T')[0],
      page: pathname,
      browser: browser,
      metadata: cleanMeta
    };

    // 1. Save locally for instant offline admin metrics
    saveEvent(eventObj);

    // 2. Dispatch to GA4 via gtag if consent is active
    if (getConsentStatus() !== 'denied' && typeof global.gtag === 'function') {
      try {
        const gaPayload = Object.assign({
          session_id: sessionId,
          user_role: userRole,
          page_path: pathname
        }, cleanMeta);
        global.gtag('event', eventName, gaPayload);
      } catch (err) {
        // Non-blocking catch
      }
    }

    // 3. Sync to Firestore if initialized
    if (typeof window !== 'undefined' && window.db && window.db.collection) {
      try {
        window.db.collection('analytics_events').add(eventObj).catch(function () {});
      } catch (e) {}
    }

    return eventObj;
  }

  // ─────────────────────────────────────────────────────────────
  // 5. SPECIALIZED EVENT HELPERS (GA4 Standard & Healthcare)
  // ─────────────────────────────────────────────────────────────

  function trackPageView(pagePath, pageTitle) {
    const path = pagePath || (typeof window !== 'undefined' && window.location ? window.location.pathname : '/');
    const title = pageTitle || (typeof document !== 'undefined' ? document.title : 'MedInVedic');
    
    return trackEvent(EVENTS.PAGE_VIEW, {
      page_location: typeof window !== 'undefined' && window.location ? window.location.href : path,
      page_path: path,
      page_title: title,
      path: path,
      title: title
    });
  }

  function trackAddToCart(product) {
    if (!product) return;
    const item = {
      item_id: String(product.id || product.name),
      item_name: product.name,
      item_category: product.category || (product.tag === 'ayur' ? 'Ayurvedic' : 'Modern'),
      price: Number(product.price || 0),
      quantity: Number(product.qty || 1)
    };

    return trackEvent(EVENTS.ADD_TO_CART, {
      currency: 'INR',
      value: item.price * item.quantity,
      items: [item],
      product_id: item.item_id,
      product_name: item.item_name,
      category: item.item_category,
      price: item.price,
      quantity: item.quantity
    });
  }

  function trackRemoveFromCart(product) {
    if (!product) return;
    const item = {
      item_id: String(product.id || product.name),
      item_name: product.name,
      item_category: product.category || 'Healthcare',
      price: Number(product.price || 0),
      quantity: Number(product.qty || 1)
    };

    return trackEvent(EVENTS.REMOVE_FROM_CART, {
      currency: 'INR',
      value: item.price * item.quantity,
      items: [item],
      product_id: item.item_id,
      product_name: item.item_name,
      price: item.price
    });
  }

  function trackBeginCheckout(cartItems, totalAmount) {
    const items = (cartItems || []).map(function (p) {
      return {
        item_id: String(p.id || p.name),
        item_name: p.name,
        item_category: p.category || 'General',
        price: Number(p.price || 0),
        quantity: Number(p.qty || 1)
      };
    });

    return trackEvent(EVENTS.BEGIN_CHECKOUT, {
      currency: 'INR',
      value: Number(totalAmount || 0),
      total_amount: Number(totalAmount || 0),
      items: items,
      item_count: items.length
    });
  }

  function trackPurchase(order) {
    if (!order) return;
    const items = (order.items || []).map(function (p) {
      return {
        item_id: String(p.id || p.name),
        item_name: p.name,
        item_category: p.category || 'Medicine',
        price: Number(p.price || 0),
        quantity: Number(p.qty || 1)
      };
    });

    const transactionId = order.id || 'ord_' + Math.random().toString(36).substring(2, 9);
    const value = Number(order.totalAmount || order.total || 0);

    return trackEvent(EVENTS.PURCHASE, {
      transaction_id: transactionId,
      value: value,
      currency: 'INR',
      payment_type: order.paymentMethod || 'Razorpay/UPI',
      items: items,
      items_count: items.length
    });
  }

  function trackRAGQuery(info) {
    const queryData = info || {};
    const cleanQuery = typeof queryData === 'string' ? queryData : (queryData.query || 'Medical inquiry');
    return trackEvent(EVENTS.RAG_QUERY, {
      query: cleanQuery.substring(0, 100),
      category: queryData.category || 'General Health',
      source_count: queryData.sourceCount || 0,
      grounded: !!queryData.grounded,
      evidence_tier: queryData.tier || 'Tier 1'
    });
  }

  function trackAIConsultation(details) {
    const info = details || {};
    return trackEvent(EVENTS.AI_CONSULTATION, {
      specialty: info.specialty || 'Vedic & Modern',
      mode: info.mode || 'Chat',
      language: info.language || 'English',
      tokens_used: info.tokens || 0
    });
  }

  function trackDoctorBooking(doctor, appointment) {
    const doc = doctor || {};
    const appt = appointment || {};
    return trackEvent(EVENTS.DOCTOR_CONSULTATION_BOOKED, {
      doctor_id: doc.id || 'doc_unknown',
      specialty: doc.specialty || doc.specialization || 'General Practitioner',
      fee: Number(doc.fee || appt.fee || 0),
      appointment_type: appt.type || 'Video Consultation'
    });
  }

  function trackDoctorSearch(specialty, location) {
    return trackEvent(EVENTS.DOCTOR_SEARCH, {
      specialty: specialty || 'all',
      location: location || 'all'
    });
  }

  function trackPrakritiAssessment(result) {
    const res = result || {};
    return trackEvent(EVENTS.PRAKRITI_ASSESSMENT_COMPLETED, {
      dominant_dosha: res.dominantDosha || res.dosha || 'Vata-Pitta',
      vata_score: res.vata || 0,
      pitta_score: res.pitta || 0,
      kapha_score: res.kapha || 0
    });
  }

  function trackVedicMindQuiz(quiz) {
    const q = quiz || {};
    return trackEvent(EVENTS.VEDICMIND_QUIZ_COMPLETED, {
      quiz_category: q.category || 'Mental Wellness',
      score_bracket: q.scoreBracket || 'Balanced',
      points: q.score || 0
    });
  }

  function trackPrescriptionDecoded(info) {
    const rx = info || {};
    return trackEvent(EVENTS.PRESCRIPTION_DECODED, {
      medicine_count: rx.medicineCount || 0,
      verification_status: rx.status || 'Verified',
      ocr_confidence: rx.confidence || 'High'
    });
  }

  function trackSOSEmergency(info) {
    const sos = info || {};
    return trackEvent(EVENTS.SOS_EMERGENCY_TRIGGERED, {
      emergency_type: sos.type || 'SOS Alert',
      hospital_found: !!sos.hospitalFound,
      source_page: typeof window !== 'undefined' && window.location ? window.location.pathname : 'dashboard'
    });
  }

  function trackHealingHubAction(actionName, details) {
    const meta = Object.assign({ action: actionName }, details || {});
    return trackEvent(EVENTS.HEALING_HUB_ACTION, meta);
  }

  function trackLanguageChange(previousLang, newLang) {
    return trackEvent(EVENTS.LANGUAGE_CHANGED, {
      from: previousLang,
      to: newLang
    });
  }

  function trackAuth(action, method) {
    const authMethod = method || 'email';
    const eventName = action === 'login' ? EVENTS.LOGIN_SUCCESS :
                      action === 'signup' ? EVENTS.REGISTRATION_COMPLETED :
                      action === 'logout' ? EVENTS.LOGOUT : EVENTS.SIGN_IN_CLICKED;
    return trackEvent(eventName, { method: authMethod });
  }

  // ─────────────────────────────────────────────────────────────
  // 6. ANALYTICS AGGREGATOR (Admin Control Center Reporting)
  // ─────────────────────────────────────────────────────────────

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
    let ecommerceRevenue = 0;
    let totalPurchases = 0;
    let sosCount = 0;

    const featureUsage = {};
    const popularSearches = {};
    const languageStats = {};

    events.forEach(function (ev) {
      if (ev.sessionId) uniqueSessions.add(ev.sessionId);
      if (ev.userId && ev.userId !== 'anonymous') registeredUsers.add(ev.userId);

      if (ev.dateStr === todayStr) todayVisitors++;
      if (ev.dateStr === yesterdayStr) yesterdayVisitors++;

      if (ev.eventName === EVENTS.DEMO_VIEW) demoViews++;
      if (ev.eventName === EVENTS.DEMO_START) demoStarts++;
      if (ev.eventName === EVENTS.DEMO_COMPLETE) demoCompletes++;

      if (ev.eventName === EVENTS.AI_QUESTION || ev.eventName === EVENTS.RAG_QUERY || ev.eventName === EVENTS.AI_CONSULTATION) {
        aiQueries++;
      }

      if (ev.eventName === EVENTS.SOS_EMERGENCY_TRIGGERED) {
        sosCount++;
      }

      if (ev.eventName === EVENTS.PURCHASE && ev.metadata && ev.metadata.value) {
        ecommerceRevenue += Number(ev.metadata.value) || 0;
        totalPurchases++;
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
      todayVisitors: todayVisitors,
      yesterdayVisitors: yesterdayVisitors,
      demoViews: demoViews,
      demoStarts: demoStarts,
      demoCompletes: demoCompletes,
      demoCompletionRate: demoStarts > 0 ? Math.round((demoCompletes / demoStarts) * 100) : 0,
      aiQueries: aiQueries,
      ecommerceRevenue: ecommerceRevenue,
      totalPurchases: totalPurchases,
      sosCount: sosCount,
      featureUsage: featureUsage,
      popularSearches: popularSearches,
      languageStats: languageStats,
      recentEvents: events.slice(0, 50)
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 7. EXPORT & PUBLIC API
  // ─────────────────────────────────────────────────────────────

  const AnalyticsEngine = {
    EVENTS: EVENTS,
    GA4_MEASUREMENT_ID: GA4_MEASUREMENT_ID,
    // Core APIs
    getVisitorSessionId: getVisitorSessionId,
    trackEvent: trackEvent,
    trackPageView: trackPageView,
    getAnalyticsSummary: getAnalyticsSummary,
    getStoredEvents: getStoredEvents,
    // Privacy & Compliance
    maskPII: maskPII,
    sanitizeMetadata: sanitizeMetadata,
    setConsent: setConsent,
    getConsentStatus: getConsentStatus,
    isDNTEnabled: isDNTEnabled,
    // E-Commerce
    trackAddToCart: trackAddToCart,
    trackRemoveFromCart: trackRemoveFromCart,
    trackBeginCheckout: trackBeginCheckout,
    trackPurchase: trackPurchase,
    // Healthcare & AI Helpers
    trackRAGQuery: trackRAGQuery,
    trackAIConsultation: trackAIConsultation,
    trackDoctorBooking: trackDoctorBooking,
    trackDoctorSearch: trackDoctorSearch,
    trackPrakritiAssessment: trackPrakritiAssessment,
    trackVedicMindQuiz: trackVedicMindQuiz,
    trackPrescriptionDecoded: trackPrescriptionDecoded,
    trackSOSEmergency: trackSOSEmergency,
    trackHealingHubAction: trackHealingHubAction,
    trackLanguageChange: trackLanguageChange,
    trackAuth: trackAuth
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnalyticsEngine;
  }
  global.AnalyticsEngine = AnalyticsEngine;

  // Auto-track landing / page views on load in browser
  try {
    if (typeof document !== 'undefined') {
      const autoTrack = function () {
        const path = (typeof window !== 'undefined' && window.location) ? window.location.pathname : '';
        const pageName = path.includes('landing') ? EVENTS.LANDING_VIEW : EVENTS.PAGE_VIEW;
        AnalyticsEngine.trackEvent(pageName, { title: document.title || 'MedInVedic' });
      };

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', autoTrack);
      } else {
        autoTrack();
      }
    }
  } catch (e) {}

})(typeof window !== 'undefined' ? window : global);

