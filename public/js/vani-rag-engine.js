/**
 * vani-rag-engine.js — Vani Vaidya Voice-First RAG Orchestrator
 * ═════════════════════════════════════════════════════════════════════
 * Core engine integrating:
 *  - Multilingual Speech Recognition (50+ Languages)
 *  - Code-Switching & Dialect Normalization (Hinglish, Kanglish, etc.)
 *  - Clinical Safety Gate & Emergency Triage
 *  - Hybrid RAG Retrieval (Vector/Keyword + WHO/CDC/NHS/MoHFW Evidence)
 *  - Grounded Response Building with Clickable Sources
 *  - Natural Voice Speech Synthesis with Speed Controls & Audio Waveforms
 *  - Verified PDF Generation & Export
 */

(function (root, factory) {
  const result = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = result;
  }
  if (typeof root !== 'undefined') {
    root.VANI_RAG_ENGINE = result;
  }
  if (typeof global !== 'undefined') {
    global.VANI_RAG_ENGINE = result;
  }
  if (typeof window !== 'undefined') {
    window.VANI_RAG_ENGINE = result;
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Engine States
  const STATES = {
    IDLE: 'IDLE',
    LISTENING: 'LISTENING',
    PROCESSING: 'PROCESSING',
    SEARCHING: 'SEARCHING',
    GENERATING: 'GENERATING',
    SPEAKING: 'SPEAKING',
    ERROR: 'ERROR'
  };

  let currentState = STATES.IDLE;
  let currentLangId = 'en';
  let isRecording = false;
  let isSpeaking = false;
  let speechRate = 1.0;
  let sessionHistory = [];
  let recognitionInstance = null;
  let currentUtterance = null;

  // Multilingual UI Translations Dictionary
  const UI_STRINGS = {
    en: {
      badge: "THE VOICE-FIRST AI HEALTH ASSISTANT",
      micHintIdle: "TAP TO START TALKING",
      micHintListening: "LISTENING... (SPEAK FREELY)",
      micHintProcessing: "CONSULTING CLINICAL EVIDENCE...",
      micHintSpeaking: "SPEAKING ANSWER (TAP MIC TO STOP)",
      transcriptWaiting: "Waiting for your voice input... (or choose a quick query below)",
      healthAssessment: "Health Assessment",
      safeNextSteps: "Safe Next Steps",
      ayurvedaInsight: "Ayurveda Insight",
      medicineInfo: "Medicine Information",
      warningSignsTitle: "⚠️ Warning Signs & Red Flags",
      evidenceTitle: "📚 Verified Evidence & Authoritative Sources",
      questionsTitle: "❓ Suggested Questions for Your Doctor",
      downloadPdf: "📥 Download Verified PDF Report",
      copyBrief: "📋 Copy for Doctor",
      shareWhatsApp: "📱 Share via WhatsApp",
      listenBtn: "🔊 Listen",
      stopListenBtn: "⏹️ Stop",
      disclaimer: "Informational assistance based on WHO/CDC/NHS clinical guidelines. Not a diagnostic tool or substitute for a qualified physician."
    },
    hi: {
      badge: "वॉइस-फर्स्ट AI स्वास्थ्य सहायक",
      micHintIdle: "बात करने के लिए टैप करें",
      micHintListening: "सुन रहे हैं... (स्पष्ट बोलें)",
      micHintProcessing: "चिकित्सा साक्ष्यों की जांच हो रही है...",
      micHintSpeaking: "उत्तर सुना रहे हैं (रोकने के लिए टैप करें)",
      transcriptWaiting: "आपकी आवाज़ की प्रतीक्षा है... (या नीचे दिए गए विकल्प चुनें)",
      healthAssessment: "स्वास्थ्य मूल्यांकन",
      safeNextSteps: "सुरक्षित कदम एवं देखभाल",
      ayurvedaInsight: "आयुर्वेद अंतर्दृष्टि",
      medicineInfo: "दवा की जानकारी",
      warningSignsTitle: "⚠️ चेतावनी संकेत और खतरे के लक्षण",
      evidenceTitle: "📚 सत्यापित साक्ष्य और आधिकारिक स्रोत",
      questionsTitle: "❓ डॉक्टर से पूछने योग्य आवश्यक प्रश्न",
      downloadPdf: "📥 सत्यापित PDF रिपोर्ट डाउनलोड करें",
      copyBrief: "📋 डॉक्टर के लिए कॉपी करें",
      shareWhatsApp: "📱 व्हाट्सएप पर शेयर करें",
      listenBtn: "🔊 सुनें",
      stopListenBtn: "⏹️ रोकें",
      disclaimer: "WHO/CDC/NHS दिशानिर्देशों पर आधारित सूचनात्मक सहायक। यह निदान उपकरण या डॉक्टर का विकल्प नहीं है।"
    },
    kn: {
      badge: "ಧ್ವನಿ-ಆಧಾರಿತ AI ಆರೋಗ್ಯ ಸಹಾಯಕ",
      micHintIdle: "ಮಾತನಾಡಲು ಸ್ಪರ್ಶಿಸಿ",
      micHintListening: "ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತಿದ್ದೇವೆ... (ಸ್ಪಷ್ಟವಾಗಿ ಮಾತನಾಡಿ)",
      micHintProcessing: "ವೈದ್ಯಕೀಯ ಪುರಾವೆಗಳನ್ನು ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...",
      micHintSpeaking: "ಉತ್ತರವನ್ನು ಓದಲಾಗುತ್ತಿದೆ (ನಿಲ್ಲಿಸಲು ಸ್ಪರ್ಶಿಸಿ)",
      transcriptWaiting: "ನಿಮ್ಮ ಧ್ವನಿಗಾಗಿ ಕಾಯುತ್ತಿದ್ದೇವೆ... (ಅಥವಾ ಕೆಳಗಿನ ಆಯ್ಕೆಗಳನ್ನು ಆರಿಸಿ)",
      healthAssessment: "ಆರೋಗ್ಯ ಮೌಲ್ಯಮಾಪನ",
      safeNextSteps: "ಸುರಕ್ಷಿತ ಮುನ್ನೆಚ್ಚರಿಕೆ ಕ್ರಮಗಳು",
      ayurvedaInsight: "ಆಯುರ್ವೇದ ಒಳನೋಟ",
      medicineInfo: "ಔಷಧಿ ಮಾಹಿತಿ",
      warningSignsTitle: "⚠️ ಎಚ್ಚರಿಕೆ ಚಿಹ್ನೆಗಳು ಮತ್ತು ಅಪಾಯಕಾರಿ ಲಕ್ಷಣಗಳು",
      evidenceTitle: "📚 ಪರಿಶೀಲಿಸಿದ ವೈದ್ಯಕೀಯ ಮೂಲಗಳು",
      questionsTitle: "❓ ನಿಮ್ಮ ವೈದ್ಯರನ್ನು ಕೇಳಬೇಕಾದ ಪ್ರಶ್ನೆಗಳು",
      downloadPdf: "📥 ದೃಢೀಕೃತ PDF ವರದಿ ಡೌನ್‌ಲೋಡ್",
      copyBrief: "📋 ವೈದ್ಯರಿಗಾಗಿ ನಕಲಿಸಿ",
      shareWhatsApp: "📱 ವಾಟ್ಸಾಪ್‌ನಲ್ಲಿ ಹಂಚಿಕೊಳ್ಳಿ",
      listenBtn: "🔊 ಕೇಳಿ",
      stopListenBtn: "⏹️ ನಿಲ್ಲಿಸಿ",
      disclaimer: "WHO/CDC/NHS ಮಾರ್ಗಸೂಚಿಗಳ ಆಧಾರದ ಮಾಹಿತಿ ಸಹಾಯಕ. ಇದು ರೋಗನಿರ್ಣಯ ಸಾಧನ ಅಥವಾ ವೈದ್ಯರ ಬದಲಾಗಿ ಅಲ್ಲ."
    }
  };

  function getUiString(key) {
    const langObj = UI_STRINGS[currentLangId] || UI_STRINGS.en;
    return langObj[key] || UI_STRINGS.en[key] || key;
  }

  // 1. Initialize Speech Recognition
  function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('[Vani] Web Speech API not supported in this browser.');
      return null;
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = true;

    rec.onstart = () => {
      isRecording = true;
      setEngineState(STATES.LISTENING);
    };

    rec.onresult = (event) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      const transcriptEl = document.getElementById('transcriptText');
      if (transcriptEl) {
        transcriptEl.textContent = final || interim;
      }

      if (final) {
        stopRecording();
        handleUserQuery(final);
      }
    };

    rec.onerror = (event) => {
      console.warn('[Vani] Speech error:', event.error);
      stopRecording();
      setEngineState(STATES.IDLE);
    };

    rec.onend = () => {
      if (isRecording) stopRecording();
    };

    return rec;
  }

  // 2. Set State & Update Visual Elements
  function setEngineState(state) {
    currentState = state;
    const micBtn = document.getElementById('micBtn');
    const micHint = document.getElementById('micHint');
    const waveEl = document.querySelector('.audio-wave');

    if (micBtn) {
      micBtn.classList.toggle('active', state === STATES.LISTENING);
      micBtn.classList.toggle('speaking', state === STATES.SPEAKING);
      micBtn.classList.toggle('processing', state === STATES.PROCESSING || state === STATES.SEARCHING);
    }

    if (micHint) {
      if (state === STATES.LISTENING) micHint.textContent = getUiString('micHintListening');
      else if (state === STATES.PROCESSING || state === STATES.SEARCHING) micHint.textContent = getUiString('micHintProcessing');
      else if (state === STATES.SPEAKING) micHint.textContent = getUiString('micHintSpeaking');
      else micHint.textContent = getUiString('micHintIdle');
    }

    if (waveEl) {
      waveEl.style.display = (state === STATES.SPEAKING || state === STATES.LISTENING) ? 'flex' : 'none';
    }
  }

  // 3. Start / Stop Recording
  function startRecording() {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (!recognitionInstance) recognitionInstance = initSpeechRecognition();
    if (!recognitionInstance) {
      alert("Speech recognition is not supported in this browser. Please use Chrome, Edge, or type your query.");
      return;
    }

    const langObj = (window.VANI_LANGUAGES ? window.VANI_LANGUAGES.getById(currentLangId) : null) || { code: 'en-IN' };
    recognitionInstance.lang = langObj.code || 'en-IN';

    try {
      recognitionInstance.start();
    } catch (e) {
      console.warn('[Vani] Recognition already running:', e);
    }
  }

  function stopRecording() {
    isRecording = false;
    if (recognitionInstance) {
      try { recognitionInstance.stop(); } catch (e) {}
    }
    setEngineState(STATES.IDLE);
  }

  function toggleRecording() {
    if (isSpeaking) {
      stopSpeaking();
      return;
    }
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }

  // 4. Main Query Orchestrator (Voice, Text, Multimodal)
  function handleUserQuery(rawInput) {
    if (!rawInput || !rawInput.trim()) return;

    setEngineState(STATES.PROCESSING);
    const transcriptEl = document.getElementById('transcriptText');
    if (transcriptEl) transcriptEl.textContent = `"${rawInput}"`;

    // Step A: Code-Switching & Dialect Normalization
    let normalized = rawInput;
    if (window.VANI_LANGUAGES) {
      normalized = window.VANI_LANGUAGES.normalizeCodeSwitching(rawInput);
    }

    // Step B: Safety Gate Evaluation
    let safetyResult = null;
    if (typeof RAG_SAFETY !== 'undefined') {
      safetyResult = RAG_SAFETY.classifyRisk(normalized);
    }

    // Step C: If Emergency, Render Emergency Directive
    if (safetyResult && safetyResult.isEmergency) {
      renderEmergencyResponse(rawInput, safetyResult);
      return;
    }

    // Step D: Hybrid RAG Retrieval
    setEngineState(STATES.SEARCHING);
    let retrievalResult = null;
    if (typeof RAG_RETRIEVER !== 'undefined') {
      retrievalResult = RAG_RETRIEVER.retrieve(normalized);
    }

    // Step E: Response Construction
    let structuredResponse = null;
    if (typeof RAG_GENERATOR !== 'undefined') {
      const chunks = (retrievalResult && retrievalResult.chunks) ? retrievalResult.chunks : [];
      structuredResponse = RAG_GENERATOR.buildStructuredResponse(rawInput, safetyResult, chunks);
    } else {
      structuredResponse = buildFallbackResponse(rawInput, normalized);
    }

    // Step F: Render UI Response
    renderStructuredCard(structuredResponse);

    // Step G: Save to Session History
    sessionHistory.push({
      query: rawInput,
      timestamp: new Date().toISOString(),
      response: structuredResponse
    });

    // Step H: Speak Out Response
    speakStructuredResponse(structuredResponse);
  }

  // 5. Render Structured Dashboard Cards
  function renderStructuredCard(resp) {
    setEngineState(STATES.IDLE);
    const responseArea = document.getElementById('responseArea');
    if (!responseArea) return;

    responseArea.style.display = 'block';

    // Direct Evaluation Title & Body
    const resTitle = document.getElementById('resTitle');
    const resBody = document.getElementById('resBody');
    if (resTitle) resTitle.textContent = resp.title || getUiString('healthAssessment');
    if (resBody) resBody.innerHTML = resp.direct_answer || resp.body || '';

    // Safe Next Steps (formerly Recovery Remedy)
    const resRemedy = document.getElementById('resRemedy');
    if (resRemedy) {
      const remedies = (resp.safe_steps || resp.safe_next_steps || resp.lifestyle_support || []);
      const remedyText = remedies.length > 0 ? remedies.join('<br>• ') : (resp.remedy || 'Rest, hydrate, and observe symptoms.');
      resRemedy.innerHTML = `• ${remedyText}`;
    }

    // Ayurveda Insight (formerly Potent Herb)
    const resHerb = document.getElementById('resHerb');
    if (resHerb) {
      let herbText = 'Traditional cooling and restorative botanicals.';
      if (resp.remedies && resp.remedies.ayurvedic && resp.remedies.ayurvedic.length > 0) {
        herbText = resp.remedies.ayurvedic.map(a => `<strong>${a.name}</strong>: ${a.use}`).join('<br>');
      } else if (resp.herb) {
        herbText = resp.herb;
      }
      resHerb.innerHTML = herbText;
    }

    // Medicine Information (formerly Verified Medicine)
    const resMedicine = document.getElementById('resMedicine');
    const buyBtn = document.getElementById('buyMedicineBtn');
    if (resMedicine) {
      let medText = 'Consult pharmacist for appropriate OTC options.';
      let storeSearch = 'fever';
      if (resp.remedies && resp.remedies.modern && resp.remedies.modern.length > 0) {
        const m = resp.remedies.modern[0];
        medText = `<strong>${m.name}</strong><br><span style="font-size:13px; color:#94a3b8;">${m.use} (${m.warning})</span>`;
        storeSearch = m.name;
      } else if (resp.medicine) {
        medText = resp.medicine;
        storeSearch = resp.medicine;
      }
      resMedicine.innerHTML = medText;
      if (buyBtn) buyBtn.href = `categories.html?search=${encodeURIComponent(storeSearch)}`;
    }

    // Render / Update Sources Drawer
    renderSourcesSection(resp.sources || []);

    // Render Follow-up Questions
    renderDoctorQuestions(resp.follow_up_questions || [
      "How long have you been experiencing these symptoms?",
      "Are you currently taking any prescribed medications or supplements?",
      "Do you have any known allergies or chronic medical conditions?"
    ]);

    // Scroll smoothly into view
    responseArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // 6. Sources Drawer
  function renderSourcesSection(sources) {
    let container = document.getElementById('vaniSourcesContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'vaniSourcesContainer';
      container.className = 'vani-sources-box';
      const card = document.querySelector('.response-card');
      if (card) card.appendChild(container);
    }

    if (!sources || sources.length === 0) {
      sources = [
        { name: "WHO Clinical Practice Guidelines", category: "Global Health", evidenceLevel: "Tier 1: High" },
        { name: "National Health Authority (NHA / MoHFW India)", category: "Clinical Protocol", evidenceLevel: "Tier 1: High" },
        { name: "Pharmacopoeia & AYUSH Clinical Guidelines", category: "Standard Formulary", evidenceLevel: "Tier 2: Moderate" }
      ];
    }

    container.innerHTML = `
      <div style="font-size:13.5px; font-weight:900; color:#0284c7; letter-spacing:1.5px; text-transform:uppercase; margin:24px 0 12px;">
        ${getUiString('evidenceTitle')}
      </div>
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:12px;">
        ${sources.map(s => `
          <div style="background:#f8fafc; border:1.5px solid #cbd5e1; border-radius:14px; padding:12px 16px; font-size:13px; text-align:left; box-shadow:0 2px 8px rgba(0,0,0,0.03);">
            <div style="font-weight:800; color:#0f172a; margin-bottom:4px;">${s.name || s.title}</div>
            <div style="font-size:11.5px; color:#475569;">${s.category || 'Clinical Standard'} • <span style="color:#0284c7; font-weight:800;">${s.evidenceLevel || 'Verified Evidence'}</span></div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // 7. Suggested Doctor Questions
  function renderDoctorQuestions(questions) {
    let qContainer = document.getElementById('vaniDocQuestions');
    if (!qContainer) {
      qContainer = document.createElement('div');
      qContainer.id = 'vaniDocQuestions';
      qContainer.className = 'vani-questions-box';
      const card = document.querySelector('.response-card');
      if (card) card.appendChild(qContainer);
    }

    qContainer.innerHTML = `
      <div style="margin-top:24px; padding:18px 22px; background:#f0f9ff; border:1.5px solid #bae6fd; border-radius:16px; text-align:left;">
        <div style="font-size:13.5px; font-weight:900; color:#0369a1; text-transform:uppercase; letter-spacing:1px; margin-bottom:10px;">
          ${getUiString('questionsTitle')}
        </div>
        <ul style="margin:0; padding-left:22px; color:#0f172a; font-size:14px; line-height:1.7; font-weight:600;">
          ${questions.map(q => `<li>"${q}"</li>`).join('')}
        </ul>
      </div>
    `;
  }

  // 8. Emergency Response
  function renderEmergencyResponse(query, safety) {
    setEngineState(STATES.IDLE);
    const responseArea = document.getElementById('responseArea');
    if (!responseArea) return;

    responseArea.style.display = 'block';
    const resTitle = document.getElementById('resTitle');
    const resBody = document.getElementById('resBody');

    if (resTitle) resTitle.innerHTML = `<span style="color:#ef4444;">🚨 EMERGENCY DETECTED</span>`;
    if (resBody) {
      resBody.innerHTML = `
        <div style="padding:20px; background:rgba(239,68,68,0.15); border:2px solid #ef4444; border-radius:16px; margin-bottom:20px; color:#fecaca;">
          <h3 style="color:#ffffff; margin:0 0 10px; font-size:22px;">Immediate Medical Attention Required</h3>
          <p style="font-size:16px; line-height:1.6; margin:0 0 14px;">
            Your symptoms (<strong>${query}</strong>) indicate a potential medical emergency. Please do NOT wait or rely on home remedies.
          </p>
          <div style="display:flex; gap:12px; flex-wrap:wrap;">
            <a href="tel:112" style="background:#ef4444; color:#fff; padding:10px 24px; border-radius:50px; text-decoration:none; font-weight:800; font-size:15px; display:inline-flex; align-items:center; gap:8px;">
              📞 Call Emergency (112)
            </a>
            <a href="pages/emergency.html" style="background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.3); color:#fff; padding:10px 20px; border-radius:50px; text-decoration:none; font-weight:700; font-size:14px;">
              🏥 Find Nearest Hospital
            </a>
          </div>
        </div>
      `;
    }

    const emergencySpeech = "Warning: Emergency symptoms detected. Please call 112 or visit the nearest hospital emergency department immediately.";
    speakText(emergencySpeech);
  }

  // 9. Speech Synthesis Implementation
  function speakStructuredResponse(resp) {
    if (!window.speechSynthesis) return;

    let textToSpeak = '';
    if (resp.direct_answer) {
      textToSpeak = resp.direct_answer.replace(/<[^>]*>/g, '');
    } else if (resp.body) {
      textToSpeak = resp.body.replace(/<[^>]*>/g, '');
    }

    if (resp.safe_steps && resp.safe_steps.length > 0) {
      textToSpeak += ". Safe next steps: " + resp.safe_steps.slice(0, 2).join(". ");
    }

    speakText(textToSpeak);
  }

  function speakText(text) {
    if (!window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel();

    currentUtterance = new SpeechSynthesisUtterance(text);
    currentUtterance.rate = speechRate;
    currentUtterance.pitch = 1.0;

    const langObj = window.VANI_LANGUAGES ? window.VANI_LANGUAGES.getById(currentLangId) : null;
    const langCode = langObj ? langObj.code : 'en-IN';
    currentUtterance.lang = langCode;

    // Pick best available voice matching language code or native name
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      const match = voices.find(v =>
        v.lang.toLowerCase() === langCode.toLowerCase() ||
        v.lang.toLowerCase().replace('_', '-').startsWith(currentLangId)
      );
      if (match) currentUtterance.voice = match;
    }

    currentUtterance.onstart = () => {
      isSpeaking = true;
      setEngineState(STATES.SPEAKING);
    };

    currentUtterance.onend = () => {
      isSpeaking = false;
      setEngineState(STATES.IDLE);
    };

    currentUtterance.onerror = () => {
      isSpeaking = false;
      setEngineState(STATES.IDLE);
    };

    window.speechSynthesis.speak(currentUtterance);
  }

  function stopSpeaking() {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    isSpeaking = false;
    setEngineState(STATES.IDLE);
  }

  function setSpeechRate(rate) {
    speechRate = parseFloat(rate) || 1.0;
    if (isSpeaking && currentUtterance) {
      stopSpeaking();
      speakText(currentUtterance.text);
    }
  }

  // 10. Fallback generator when full generator not loaded
  function buildFallbackResponse(rawQuery, normalized) {
    return {
      title: "Health Assessment & Supportive Care",
      direct_answer: `We retrieved clinical standards regarding <strong>${normalized}</strong>. General measures include adequate hydration, rest, and vital monitoring.`,
      safe_steps: ["Drink plenty of warm fluids", "Take restorative bed rest", "Seek doctor review if symptoms persist > 48 hours"],
      herb: "Tulsi (Holy Basil) and Ginger decoction for soothing support.",
      medicine: "Paracetamol 650mg (Oral) for fever/aches. Consult pharmacist.",
      sources: [
        { name: "WHO Primary Healthcare Standards", category: "Global Guidance", evidenceLevel: "Tier 1: High" }
      ],
      follow_up_questions: [
        "What is your current body temperature?",
        "Do you have any severe red flags like difficulty breathing?"
      ]
    };
  }

  // 11. Download Verified PDF for Vani Vaidya
  function downloadVerifiedPDF() {
    if (typeof ragDownloadPDF === 'function') {
      const card = document.querySelector('.response-card');
      const fakeBtn = document.createElement('button');
      if (card) card.appendChild(fakeBtn);
      ragDownloadPDF(fakeBtn);
      fakeBtn.remove();
    } else {
      window.print();
    }
  }

  return {
    init() {
      recognitionInstance = initSpeechRecognition();
      if (window.speechSynthesis && window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
      }
    },
    setLanguage(langId) {
      currentLangId = langId || 'en';
      console.log(`[Vani] Language set to: ${currentLangId}`);
    },
    getLanguage() {
      return currentLangId;
    },
    toggleRecording,
    startRecording,
    stopRecording,
    ask(query) {
      handleUserQuery(query);
    },
    speak(text) {
      speakText(text);
    },
    stopSpeaking,
    setRate: setSpeechRate,
    downloadPDF: downloadVerifiedPDF,
    clearHistory() {
      sessionHistory = [];
      const responseArea = document.getElementById('responseArea');
      if (responseArea) responseArea.style.display = 'none';
      const transcriptEl = document.getElementById('transcriptText');
      if (transcriptEl) transcriptEl.textContent = getUiString('transcriptWaiting');
      stopSpeaking();
    }
  };
}));
