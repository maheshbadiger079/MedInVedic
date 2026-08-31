/**
 * rag-engine.js — MedInVedic RAG Orchestrator
 * ════════════════════════════════════════════
 * Connects: Safety → Retrieval → Generation → UI
 * Handles: Chat history, Voice STT, Quick questions,
 *          Multi-state UI transitions, Feedback
 */

const RAG_ENGINE = (function () {

  let _chatHistory = [];
  let _isProcessing = false;
  let _speechRecognition = null;
  let _voiceActive = false;

  // ────────────────────────────────────────────────────
  // MAIN QUERY HANDLER
  // ────────────────────────────────────────────────────

  async function ask(query) {
    if (!query || typeof query !== "string" || query.trim().length === 0) return;
    if (_isProcessing) return;

    query = query.trim();
    _isProcessing = true;

    // Clear input
    const inputEl = document.getElementById("ragChatInput");
    if (inputEl) inputEl.value = "";

    // Add user message to chat
    appendUserMessage(query);
    _chatHistory.push({ role: "user", content: query, timestamp: Date.now() });

    // Show thinking state
    const thinkingId = appendThinkingCard();
    const animInterval = RAG_GENERATOR.animateThinkingSteps();

    try {
      await new Promise(resolve => setTimeout(resolve, 400)); // Allow DOM update

      // Step 1: Safety & Triage
      const triage = RAG_SAFETY.assess(query);

      // Step 2: Retrieve evidence
      await new Promise(resolve => setTimeout(resolve, 500));
      const rawResults = RAG_RETRIEVER.search(query, 5);
      const contextDocs = RAG_RETRIEVER.formatContext(rawResults);

      // Step 3: Synthesize response
      await new Promise(resolve => setTimeout(resolve, 400));
      clearInterval(animInterval);

      let responseData;
      if (!RAG_RETRIEVER.hasAdequateEvidence(rawResults)) {
        responseData = RAG_GENERATOR.buildInsufficientEvidenceResponse(query);
      } else {
        responseData = RAG_GENERATOR.buildStructuredResponse(query, triage, contextDocs);
      }

      // If emergency detected, prepend emergency data to response
      if (triage.emergency && triage.emergency.detected) {
        responseData.emergency = triage.emergency;
      }

      // Step 4: Render response
      removeThinkingCard(thinkingId);
      const html = RAG_GENERATOR.renderResponseCard(responseData);
      appendAssistantMessage(html);

      // Save to history
      _chatHistory.push({
        role: "assistant",
        content: query,
        response: responseData,
        timestamp: Date.now()
      });

    } catch (err) {
      clearInterval(animInterval);
      removeThinkingCard(thinkingId);
      appendAssistantMessage(`
        <div class="rag-error-card">
          <strong>⚠️ An error occurred while processing your query.</strong><br>
          Please try again. If this persists, consult a healthcare provider directly.
        </div>
      `);
      console.error("[RAG_ENGINE] Error:", err);
    } finally {
      _isProcessing = false;
    }
  }

  // ────────────────────────────────────────────────────
  // CHAT UI HELPERS
  // ────────────────────────────────────────────────────

  function appendUserMessage(query) {
    const container = document.getElementById("ragChatContainer");
    if (!container) return;

    const msg = document.createElement("div");
    msg.className = "rag-message rag-user";
    msg.innerHTML = `
      <div class="rag-user-bubble">
        <div class="rag-user-icon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        </div>
        <div class="rag-user-text">${escapeHtml(query)}</div>
      </div>
    `;
    container.appendChild(msg);
    scrollToBottom(container);
  }

  function appendAssistantMessage(html) {
    const container = document.getElementById("ragChatContainer");
    if (!container) return;

    // Remove welcome state if present
    const welcome = container.querySelector(".rag-welcome");
    if (welcome) welcome.remove();

    const msg = document.createElement("div");
    msg.className = "rag-message rag-assistant";
    msg.innerHTML = html;
    container.appendChild(msg);

    // Animate in
    requestAnimationFrame(() => msg.classList.add("visible"));
    scrollToBottom(container);
  }

  function appendThinkingCard() {
    const container = document.getElementById("ragChatContainer");
    if (!container) return null;

    const id = "thinking-" + Date.now();
    const msg = document.createElement("div");
    msg.id = id;
    msg.className = "rag-message rag-assistant";
    msg.innerHTML = RAG_GENERATOR.renderThinkingState();
    container.appendChild(msg);
    requestAnimationFrame(() => msg.classList.add("visible"));
    scrollToBottom(container);
    return id;
  }

  function removeThinkingCard(id) {
    if (!id) return;
    const el = document.getElementById(id);
    if (el) el.remove();
  }

  function scrollToBottom(container) {
    container.scrollTop = container.scrollHeight;
  }

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
  }

  // ────────────────────────────────────────────────────
  // VOICE SPEECH-TO-TEXT (Web Speech API)
  // ────────────────────────────────────────────────────

  function initVoice() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return false;

    _speechRecognition = new SpeechRecognition();
    _speechRecognition.lang = "en-IN";
    _speechRecognition.continuous = false;
    _speechRecognition.interimResults = true;
    _speechRecognition.maxAlternatives = 1;

    _speechRecognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(r => r[0].transcript)
        .join("");
      const inputEl = document.getElementById("ragChatInput");
      if (inputEl) inputEl.value = transcript;

      if (event.results[0].isFinal) {
        stopVoice();
        ask(transcript);
      }
    };

    _speechRecognition.onend = () => {
      _voiceActive = false;
      updateVoiceButton(false);
    };

    _speechRecognition.onerror = (event) => {
      _voiceActive = false;
      updateVoiceButton(false);
      if (event.error !== "no-speech") {
        console.warn("[RAG Voice] Error:", event.error);
      }
    };

    return true;
  }

  function toggleVoice() {
    if (_voiceActive) {
      stopVoice();
    } else {
      startVoice();
    }
  }

  function startVoice() {
    if (!_speechRecognition && !initVoice()) {
      showToast && showToast("Voice input not supported in this browser.", "info");
      return;
    }
    try {
      _speechRecognition.start();
      _voiceActive = true;
      updateVoiceButton(true);
      const inputEl = document.getElementById("ragChatInput");
      if (inputEl) {
        inputEl.placeholder = "🎙️ Listening... speak now";
        inputEl.value = "";
      }
    } catch (e) {
      console.warn("[RAG Voice] Could not start:", e);
    }
  }

  function stopVoice() {
    if (_speechRecognition && _voiceActive) {
      _speechRecognition.stop();
    }
    _voiceActive = false;
    updateVoiceButton(false);
    const inputEl = document.getElementById("ragChatInput");
    if (inputEl) inputEl.placeholder = "Ask about symptoms, medicines, or remedies...";
  }

  function updateVoiceButton(active) {
    const btn = document.getElementById("ragVoiceBtn");
    if (!btn) return;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-label", active ? "Stop voice input" : "Start voice input");
    btn.title = active ? "Stop listening" : "Voice input";
  }

  // ────────────────────────────────────────────────────
  // QUICK QUESTION CHIPS
  // ────────────────────────────────────────────────────

  function quickAsk(query) {
    const inputEl = document.getElementById("ragChatInput");
    if (inputEl) inputEl.value = query;
    ask(query);
  }

  // ────────────────────────────────────────────────────
  // CLEAR CHAT
  // ────────────────────────────────────────────────────

  function clearChat() {
    _chatHistory = [];
    const container = document.getElementById("ragChatContainer");
    if (container) {
      container.innerHTML = renderWelcomeState();
    }
  }

  function renderWelcomeState() {
    return `
      <div class="rag-welcome" aria-live="polite">
        <div class="rag-welcome-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
          </svg>
        </div>
        <div class="rag-welcome-title">Health Intelligence AI</div>
        <div class="rag-welcome-subtitle">
          Evidence-grounded health information from WHO, CDC, NHS, and clinical guidelines.<br>
          This is an informational assistant — not a replacement for professional medical advice.
        </div>
        <div class="rag-welcome-disclaimer">
          <strong>⚕️ Important:</strong> This AI only answers from verified medical sources. For questions outside its knowledge base, it will say "Insufficient evidence" rather than guessing.
        </div>
      </div>
    `;
  }

  // ────────────────────────────────────────────────────
  // INIT
  // ────────────────────────────────────────────────────

  function init() {
    // Try to init voice
    initVoice();

    // Keyboard shortcut on input
    const inputEl = document.getElementById("ragChatInput");
    if (inputEl) {
      inputEl.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          ask(inputEl.value);
        }
      });
    }

    // Init welcome state
    const container = document.getElementById("ragChatContainer");
    if (container && container.children.length === 0) {
      container.innerHTML = renderWelcomeState();
    }
  }

  return {
    ask,
    quickAsk,
    clearChat,
    toggleVoice,
    init,
    renderWelcomeState
  };
})();

// Global convenience wrappers (called from HTML onclick)
window.RAG_ENGINE = RAG_ENGINE;
window.handleRagMessage = () => RAG_ENGINE.ask(document.getElementById("ragChatInput")?.value);
window.handleRagQuickAsk = (q) => RAG_ENGINE.quickAsk(q);
window.ragVoiceToggle = () => RAG_ENGINE.toggleVoice();
window.clearRagChat = () => RAG_ENGINE.clearChat();

// ──────────────────────────────────────────────────────────────────
// MULTILANGUAGE CLINICAL ENGINE — Language Switcher
// Supports: EN, HI, KN, TE, TA, MR, BN
// ──────────────────────────────────────────────────────────────────

const RAG_LANG_LABELS = {
  en: {
    badge: "CLINICAL ENGINE",
    title: "Health Intelligence AI",
    subtitle: "Evidence-grounded answers from WHO, CDC, NHS, MoHFW clinical guidelines. <strong>Not a diagnostic tool</strong> — for informational purposes only.",
    chips: ["🌡️ High Fever", "🫃 Stomach Pain", "🦴 Back Pain", "🧠 Headache", "🗣️ Sore Throat", "🦟 Dengue Scan"],
    chipQueries: [
      "I have a high fever, what should I do?",
      "I have abdominal pain and stomach ache",
      "I have lower back pain",
      "I have a severe headache",
      "I have a sore throat and throat pain",
      "I have dengue symptoms — fever, joint pain, rash"
    ],
    placeholder: "Ask about symptoms, medicines, or remedies...",
    notice: "⚕️ For emergencies call <strong>112</strong>. This assistant answers only from verified medical sources. Always consult a licensed healthcare provider.",
    welcome_title: "Health Intelligence AI",
    welcome_sub: "Evidence-grounded health information from WHO, CDC, NHS, and clinical guidelines. This is an informational assistant — not a replacement for professional medical advice.",
    pdf_btn: "📥 Download Verified PDF Report",
    listen_btn: "🔊 Listen",
    copy_btn: "📋 Copy for Doctor",
    share_btn: "📱 Share"
  },
  hi: {
    badge: "क्लिनिकल इंजन",
    title: "हेल्थ इंटेलिजेंस AI",
    subtitle: "WHO, CDC, NHS, MoHFW दिशानिर्देशों पर आधारित साक्ष्य-सत्यापित जानकारी। <strong>यह नैदानिक उपकरण नहीं है</strong> — केवल सूचनात्मक उपयोग के लिए।",
    chips: ["🌡️ तेज़ बुखार", "🫃 पेट दर्द", "🦴 पीठ दर्द", "🧠 सिरदर्द", "🗣️ गले में खराश", "🦟 डेंगू स्कैन"],
    chipQueries: [
      "मुझे बहुत तेज़ बुखार है, क्या करना चाहिए?",
      "मेरे पेट में बहुत दर्द हो रहा है",
      "मुझे पीठ और कमर में दर्द है",
      "मेरे सिर में बहुत तेज़ दर्द हो रहा है",
      "मेरे गले में खराश और दर्द है",
      "मुझे डेंगू के लक्षण हैं — बुखार, जोड़ों में दर्द, चकत्ते"
    ],
    placeholder: "लक्षण, दवाओं या उपचारों के बारे में पूछें...",
    notice: "⚕️ आपातकाल के लिए <strong>112</strong> पर कॉल करें। यह सहायक केवल सत्यापित स्रोतों से उत्तर देता है। निदान के लिए डॉक्टर से मिलें।",
    welcome_title: "हेल्थ इंटेलिजेंस AI",
    welcome_sub: "WHO, CDC, NHS और क्लिनिकल दिशानिर्देशों पर आधारित स्वास्थ्य जानकारी। यह एक सूचनात्मक सहायक है — डॉक्टर का विकल्प नहीं।",
    pdf_btn: "📥 सत्यापित PDF रिपोर्ट डाउनलोड करें",
    listen_btn: "🔊 सुनें",
    copy_btn: "📋 डॉक्टर के लिए कॉपी करें",
    share_btn: "📱 शेयर करें"
  },
  kn: {
    badge: "ಕ್ಲಿನಿಕಲ್ ಎಂಜಿನ್",
    title: "ಹೆಲ್ತ್ ಇಂಟೆಲಿಜೆನ್ಸ್ AI",
    subtitle: "WHO, CDC, NHS, MoHFW ಮಾರ್ಗಸೂಚಿಗಳ ಆಧಾರದ ಪುರಾವೆ ಆಧಾರಿತ ಮಾಹಿತಿ. <strong>ಇದು ರೋಗನಿರ್ಣಯ ಸಾಧನವಲ್ಲ</strong> — ಕೇವಲ ಮಾಹಿತಿಗಾಗಿ.",
    chips: ["🌡️ ತೀವ್ರ ಜ್ವರ", "🫃 ಹೊಟ್ಟೆ ನೋವು", "🦴 ಬೆನ್ನು ನೋವು", "🧠 ತಲೆನೋವು", "🗣️ ಗಂಟಲು ನೋವು", "🦟 ಡೆಂಗ್ಯೂ ಸ್ಕ್ಯಾನ್"],
    chipQueries: [
      "ನನಗೆ ತೀವ್ರ ಜ್ವರ ಇದೆ, ಏನು ಮಾಡಬೇಕು?",
      "ನನಗೆ ತೀವ್ರ ಹೊಟ್ಟೆ ನೋವು ಇದೆ",
      "ನನ್ನ ಬೆನ್ನಿನಲ್ಲಿ ನೋವು ಇದೆ",
      "ನನಗೆ ತೀವ್ರ ತಲೆನೋವು ಇದೆ",
      "ನನ್ನ ಗಂಟಲಿನಲ್ಲಿ ನೋವು ಇದೆ",
      "ನನಗೆ ಡೆಂಗ್ಯೂ ಲಕ್ಷಣಗಳಿವೆ — ಜ್ವರ, ಕೀಲು ನೋವು, ದದ್ದು"
    ],
    placeholder: "ಲಕ್ಷಣಗಳು, ಔಷಧಿಗಳು ಅಥವಾ ಮನೆಮದ್ದುಗಳ ಬಗ್ಗೆ ಕೇಳಿ...",
    notice: "⚕️ ತುರ್ತು ಪರಿಸ್ಥಿತಿಗಾಗಿ <strong>112</strong> ಗೆ ಕರೆ ಮಾಡಿ. ಈ ಸಹಾಯಕ ಪರಿಶೀಲಿಸಿದ ಮೂಲಗಳಿಂದ ಮಾತ್ರ ಉತ್ತರಿಸುತ್ತದೆ.",
    welcome_title: "ಹೆಲ್ತ್ ಇಂಟೆಲಿಜೆನ್ಸ್ AI",
    welcome_sub: "WHO, CDC, NHS ಮತ್ತು ಕ್ಲಿನಿಕಲ್ ಮಾರ್ಗಸೂಚಿಗಳ ಆಧಾರದ ಆರೋಗ್ಯ ಮಾಹಿತಿ. ಇದು ಮಾಹಿತಿ ಸಹಾಯಕ — ವೈದ್ಯರ ಬದಲಾಗಿ ಅಲ್ಲ.",
    pdf_btn: "📥 ದೃಢೀಕೃತ PDF ವರದಿ ಡೌನ್‌ಲೋಡ್",
    listen_btn: "🔊 ಕೇಳಿ",
    copy_btn: "📋 ವೈದ್ಯರಿಗಾಗಿ ನಕಲಿಸಿ",
    share_btn: "📱 ಹಂಚಿಕೊಳ್ಳಿ"
  },
  te: {
    badge: "క్లినికల్ ఇంజన్",
    title: "హెల్త్ ఇంటెలిజెన్స్ AI",
    subtitle: "WHO, CDC, NHS, MoHFW మార్గదర్శకాల ఆధారంగా సాక్ష్యాధార ఆరోగ్య సమాచారం. <strong>ఇది రోగనిర్ధారణ సాధనం కాదు</strong> — సమాచార అవసరాలకు మాత్రమే.",
    chips: ["🌡️ తీవ్ర జ్వరం", "🫃 కడుపు నొప్పి", "🦴 వెన్నునొప్పి", "🧠 తలనొప్పి", "🗣️ గొంతు నొప్పి", "🦟 డెంగ్యూ స్కాన్"],
    chipQueries: [
      "నాకు తీవ్రమైన జ్వరం వచ్చింది, ఏమి చేయాలి?",
      "నా కడుపులో నొప్పిగా ఉంది",
      "నా వెన్నులో నొప్పిగా ఉంది",
      "నాకు తీవ్రమైన తలనొప్పిగా ఉంది",
      "నా గొంతులో నొప్పిగా ఉంది",
      "నాకు డెంగ్యూ లక్షణాలు ఉన్నాయి"
    ],
    placeholder: "లక్షణాలు, మందులు లేదా నివారణల గురించి అడగండి...",
    notice: "⚕️ అత్యవసర పరిస్థితుల్లో <strong>112</strong> కి కాల్ చేయండి.",
    welcome_title: "హెల్త్ ఇంటెలిజెన్స్ AI",
    welcome_sub: "WHO, CDC, NHS మార్గదర్శకాల ఆధారంగా ఆరోగ్య సమాచారం. ఇది సమాచార సహాయకుడు — డాక్టర్ ప్రత్యామ్నాయం కాదు.",
    pdf_btn: "📥 ధృవీకరించిన PDF నివేదిక డౌన్‌లోడ్",
    listen_btn: "🔊 వినండి",
    copy_btn: "📋 డాక్టర్ కోసం కాపీ",
    share_btn: "📱 షేర్"
  },
  ta: {
    badge: "மருத்துவ இயந்திரம்",
    title: "உடல்நலன் நுண்ணறிவு AI",
    subtitle: "WHO, CDC, NHS, MoHFW வழிகாட்டுதல்களின் அடிப்படையில் சான்றாதார ஆரோக்கிய தகவல். <strong>இது நோய் கண்டறிதல் கருவி அல்ல</strong> — தகவல் நோக்கங்களுக்கு மட்டும்.",
    chips: ["🌡️ கடுமையான காய்ச்சல்", "🫃 வயிற்று வலி", "🦴 முதுகு வலி", "🧠 தலைவலி", "🗣️ தொண்டை வலி", "🦟 டெங்கு ஸ்கேன்"],
    chipQueries: [
      "எனக்கு கடுமையான காய்ச்சல் வந்துள்ளது, என்ன செய்யணும்?",
      "எனக்கு வயிற்று வலி இருக்கிறது",
      "எனக்கு முதுகு வலி இருக்கிறது",
      "எனக்கு கடுமையான தலைவலி இருக்கிறது",
      "எனக்கு தொண்டை வலி இருக்கிறது",
      "எனக்கு டெங்கு அறிகுறிகள் உள்ளன"
    ],
    placeholder: "அறிகுறிகள், மருந்துகள் அல்லது நிவாரணங்களைப் பற்றி கேளுங்கள்...",
    notice: "⚕️ அவசரகாலத்தில் <strong>112</strong> அழைக்கவும். இந்த உதவியாளர் சரிபார்க்கப்பட்ட மூலங்களில் இருந்து மட்டுமே பதிலளிக்கிறது.",
    welcome_title: "உடல்நலன் நுண்ணறிவு AI",
    welcome_sub: "WHO, CDC, NHS வழிகாட்டுதல்களின் அடிப்படையில் ஆரோக்கிய தகவல். இது ஒரு தகவல் உதவியாளர் — மருத்துவரின் மாற்று அல்ல.",
    pdf_btn: "📥 சரிபார்க்கப்பட்ட PDF அறிக்கை பதிவிறக்கம்",
    listen_btn: "🔊 கேளுங்கள்",
    copy_btn: "📋 மருத்துவருக்காக நகலெடு",
    share_btn: "📱 பகிர்"
  },
  mr: {
    badge: "क्लिनिकल इंजिन",
    title: "हेल्थ इंटेलिजन्स AI",
    subtitle: "WHO, CDC, NHS, MoHFW मार्गदर्शक तत्त्वांवर आधारित पुरावा-आधारित आरोग्य माहिती. <strong>हे निदान साधन नाही</strong> — केवळ माहितीच्या उद्देशांसाठी.",
    chips: ["🌡️ तीव्र ताप", "🫃 पोटदुखी", "🦴 पाठदुखी", "🧠 डोकेदुखी", "🗣️ घसादुखी", "🦟 डेंग्यू स्कॅन"],
    chipQueries: [
      "मला खूप ताप आहे, काय करावे?",
      "मला पोटात खूप दुखत आहे",
      "मला पाठदुखी आहे",
      "मला खूप डोकेदुखी आहे",
      "मला घसादुखी आहे",
      "मला डेंग्यूची लक्षणे आहेत"
    ],
    placeholder: "लक्षणे, औषधे किंवा उपायांबद्दल विचारा...",
    notice: "⚕️ आणीबाणीसाठी <strong>112</strong> वर कॉल करा. हा सहाय्यक फक्त सत्यापित स्रोतांकडून उत्तर देतो.",
    welcome_title: "हेल्थ इंटेलिजन्स AI",
    welcome_sub: "WHO, CDC, NHS मार्गदर्शक तत्त्वांवर आधारित आरोग्य माहिती. हा एक माहिती सहाय्यक आहे — डॉक्टरचा पर्याय नाही.",
    pdf_btn: "📥 सत्यापित PDF अहवाल डाउनलोड करा",
    listen_btn: "🔊 ऐका",
    copy_btn: "📋 डॉक्टरसाठी कॉपी करा",
    share_btn: "📱 शेअर करा"
  },
  bn: {
    badge: "ক্লিনিক্যাল ইঞ্জিন",
    title: "হেলথ ইন্টেলিজেন্স AI",
    subtitle: "WHO, CDC, NHS, MoHFW নির্দেশিকার উপর ভিত্তি করে প্রমাণ-ভিত্তিক স্বাস্থ্য তথ্য। <strong>এটি রোগ নির্ণয়ের হাতিয়ার নয়</strong> — শুধুমাত্র তথ্যের জন্য।",
    chips: ["🌡️ তীব্র জ্বর", "🫃 পেটের ব্যথা", "🦴 পিঠের ব্যথা", "🧠 মাথাব্যথা", "🗣️ গলা ব্যথা", "🦟 ডেঙ্গু স্ক্যান"],
    chipQueries: [
      "আমার প্রচণ্ড জ্বর হয়েছে, কী করব?",
      "আমার পেটে খুব ব্যথা করছে",
      "আমার পিঠে ব্যথা আছে",
      "আমার প্রচণ্ড মাথাব্যথা হচ্ছে",
      "আমার গলায় ব্যথা আছে",
      "আমার ডেঙ্গুর লক্ষণ রয়েছে"
    ],
    placeholder: "লক্ষণ, ওষুধ বা প্রতিকার সম্পর্কে জিজ্ঞাসা করুন...",
    notice: "⚕️ জরুরি অবস্থায় <strong>112</strong> নম্বরে কল করুন। এই সহকারী শুধুমাত্র যাচাইকৃত উৎস থেকে উত্তর দেয়।",
    welcome_title: "হেলথ ইন্টেলিজেন্স AI",
    welcome_sub: "WHO, CDC, NHS নির্দেশিকার উপর ভিত্তি করে স্বাস্থ্য তথ্য। এটি একটি তথ্য সহকারী — ডাক্তারের বিকল্প নয়।",
    pdf_btn: "📥 যাচাইকৃত PDF রিপোর্ট ডাউনলোড",
    listen_btn: "🔊 শুনুন",
    copy_btn: "📋 ডাক্তারের জন্য কপি",
    share_btn: "📱 শেয়ার"
  }
};

// Track current RAG language
window._ragCurrentLang = localStorage.getItem('mv_rag_lang') || 'en';

function ragSetLanguage(lang) {
  window._ragCurrentLang = lang;
  localStorage.setItem('mv_rag_lang', lang);

  const labels = RAG_LANG_LABELS[lang] || RAG_LANG_LABELS.en;

  // Update active button state
  document.querySelectorAll('.rag-lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  // Update badge
  const badgeEl = document.querySelector('.rag-engine-badge span[data-i18n]');
  if (badgeEl) badgeEl.textContent = labels.badge;

  // Update title
  const titleEl = document.querySelector('.rag-engine-title');
  if (titleEl) titleEl.textContent = labels.title;

  // Update subtitle
  const subtitleEl = document.querySelector('.rag-engine-subtitle');
  if (subtitleEl) subtitleEl.innerHTML = labels.subtitle;

  // Update quick chips
  const chips = document.querySelectorAll('#ragChipsRow .rag-chip');
  chips.forEach((chip, i) => {
    if (labels.chips[i]) {
      chip.textContent = labels.chips[i];
      chip.onclick = () => handleRagQuickAsk(labels.chipQueries[i]);
    }
  });

  // Update input placeholder
  const inputEl = document.getElementById('ragChatInput');
  if (inputEl) inputEl.placeholder = labels.placeholder;

  // Update bottom notice
  const noticeEl = document.querySelector('.rag-bottom-notice');
  if (noticeEl) noticeEl.innerHTML = labels.notice;

  // Also switch TTS speech language for voice readout
  window._ragTtsLang = (lang === 'hi') ? 'hi-IN' : (lang === 'kn') ? 'kn-IN' : (lang === 'te') ? 'te-IN' : (lang === 'ta') ? 'ta-IN' : (lang === 'mr') ? 'mr-IN' : (lang === 'bn') ? 'bn-IN' : 'en-IN';

  // Also switch I18n if available
  if (window.I18n && typeof window.I18n.setLang === 'function') {
    window.I18n.setLang(lang);
  }

  console.log(`[RAG] Language switched to: ${lang}`);
}

// Apply saved language on page load
document.addEventListener('DOMContentLoaded', () => {
  const savedLang = localStorage.getItem('mv_rag_lang') || 'en';
  setTimeout(() => ragSetLanguage(savedLang), 300);
});

window.ragSetLanguage = ragSetLanguage;

// Auto-init after DOM ready
document.addEventListener("DOMContentLoaded", () => {
  if (typeof RAG_SAFETY !== "undefined" && typeof RAG_RETRIEVER !== "undefined" && typeof RAG_GENERATOR !== "undefined") {
    RAG_ENGINE.init();
  }
});
