/**
 * voice.js — MedInVedic Global Voice Logic
 * This file now only provides the underlying SpeechRecognition/Synthesis utilities.
 * Global Floating Buttons and Search Mics have been removed for a cleaner UI.
 * Use pages/voice-doctor.html (Vani Vaidya) for full voice interactions.
 */

(function () {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const SpeechSynthesis = window.speechSynthesis;
  
  if (!SpeechRecognition) return;

  const recognition = new SpeechRecognition();
  recognition.interimResults = true;
  recognition.continuous = false;

  const langMap = {
    en: 'en-IN', hi: 'hi-IN', kn: 'kn-IN', ta: 'ta-IN'
  };

  function speak(txt, langCode = 'en') {
    if (!SpeechSynthesis) return;
    SpeechSynthesis.cancel();
    const voices = SpeechSynthesis.getVoices();
    const lMatch = langMap[langCode] || 'en-IN';
    let v = voices.find(v => v.lang.toLowerCase() === lMatch.toLowerCase() || v.lang.toLowerCase().includes(langCode));
    
    const u = new SpeechSynthesisUtterance(txt);
    if (v) u.voice = v;
    u.lang = lMatch;
    u.volume = 1.0; u.rate = 1.0;
    SpeechSynthesis.speak(u);
  }

  // Export minimal utilities if needed, but remove all DOM injection
  window.MedInVedicVoice = { speak };
  
  // Listen for global language changes
  document.addEventListener('langChanged', e => {
      // Sync logic could go here if needed
  });
})();
