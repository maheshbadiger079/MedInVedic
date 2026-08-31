/**
 * vani-language-registry.js — Vani Vaidya 50+ Language Registry
 * ══════════════════════════════════════════════════════════════════
 * Comprehensive language metadata supporting 23 Indian languages + 27 International languages
 * with Web Speech recognition codes, SpeechSynthesis voice matching, native scripts,
 * and dialect/code-switching aliases.
 */

(function (root, factory) {
  const result = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = result;
  }
  if (typeof root !== 'undefined') {
    root.VANI_LANGUAGES = result;
  }
  if (typeof global !== 'undefined') {
    global.VANI_LANGUAGES = result;
  }
  if (typeof window !== 'undefined') {
    window.VANI_LANGUAGES = result;
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // 23 Official & Major Indian Languages
  const INDIAN_LANGUAGES = [
    {
      id: 'en',
      code: 'en-IN',
      name: 'English (India)',
      nativeName: 'English (India)',
      script: 'Latin',
      region: 'India / Global',
      flag: '🇮🇳',
      speechRecognition: true,
      textGeneration: true,
      textToSpeech: true,
      rtl: false,
      voiceNames: ['Google UK English Female', 'Microsoft Heera - English (India)', 'en-IN', 'en_IN', 'English India'],
      sampleQuery: 'I have had a fever and sore throat for two days.',
      welcomeGreeting: 'Hello! I am Vani Vaidya, your AI Health Assistant. How can I help you today?'
    },
    {
      id: 'hi',
      code: 'hi-IN',
      name: 'Hindi',
      nativeName: 'हिन्दी',
      script: 'Devanagari',
      region: 'North & Central India',
      flag: '🇮🇳',
      speechRecognition: true,
      textGeneration: true,
      textToSpeech: true,
      rtl: false,
      voiceNames: ['Google हिन्दी', 'Microsoft Hemant - Hindi (India)', 'Microsoft Kalpana - Hindi (India)', 'hi-IN', 'hi_IN'],
      sampleQuery: 'मुझे दो दिन से बहुत तेज़ बुखार और सिरदर्द है।',
      welcomeGreeting: 'नमस्ते! मैं वाणी वैद्य हूँ, आपकी AI स्वास्थ्य सहायक। मैं आपकी क्या मदद कर सकती हूँ?'
    },
    {
      id: 'kn',
      code: 'kn-IN',
      name: 'Kannada',
      nativeName: 'ಕನ್ನಡ',
      script: 'Kannada',
      region: 'Karnataka, India',
      flag: '🇮🇳',
      speechRecognition: true,
      textGeneration: true,
      textToSpeech: true,
      rtl: false,
      voiceNames: ['Google ಕನ್ನಡ', 'Microsoft Sapna - Kannada (India)', 'kn-IN', 'kn_IN', 'Kannada'],
      sampleQuery: 'ನನಗೆ ಎರಡು ದಿನಗಳಿಂದ ಜ್ವರ ಮತ್ತು ಗಂಟಲು ನೋವು ಇದೆ.',
      welcomeGreeting: 'ನಮಸ್ಕಾರ! ನಾನು ವಾಣಿ ವೈದ್ಯ, ನಿಮ್ಮ AI ಆರೋಗ್ಯ ಸಹಾಯಕ. ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?'
    },
    {
      id: 'te',
      code: 'te-IN',
      name: 'Telugu',
      nativeName: 'తెలుగు',
      script: 'Telugu',
      region: 'Andhra Pradesh & Telangana, India',
      flag: '🇮🇳',
      speechRecognition: true,
      textGeneration: true,
      textToSpeech: true,
      rtl: false,
      voiceNames: ['Google తెలుగు', 'Microsoft Shruti - Telugu (India)', 'te-IN', 'te_IN', 'Telugu'],
      sampleQuery: 'నాకు రెండు రోజులుగా తీవ్రమైన జ్వరం మరియు దగ్గు ఉంది.',
      welcomeGreeting: 'నమస్కారం! నేను వాణి వైద్య, మీ AI ఆరోగ్య సహాయకురాలిని. మీకు ఎలా సహాయపడగలను?'
    },
    {
      id: 'ta',
      code: 'ta-IN',
      name: 'Tamil',
      nativeName: 'தமிழ்',
      script: 'Tamil',
      region: 'Tamil Nadu & Puducherry, India',
      flag: '🇮🇳',
      speechRecognition: true,
      textGeneration: true,
      textToSpeech: true,
      rtl: false,
      voiceNames: ['Google தமிழ்', 'Microsoft Valluvar - Tamil (India)', 'ta-IN', 'ta_IN', 'Tamil'],
      sampleQuery: 'எனக்கு இரண்டு நாட்களாக கடுமையான காய்ச்சல் மற்றும் தலைவலி உள்ளது.',
      welcomeGreeting: 'வணக்கம்! நான் வாணி வைத்யா, உங்கள் AI சுகாதார உதவியாளர். உங்களுக்கு எப்படி உதவ முடியும்?'
    },
    {
      id: 'ml',
      code: 'ml-IN',
      name: 'Malayalam',
      nativeName: 'മലയാളം',
      script: 'Malayalam',
      region: 'Kerala, India',
      flag: '🇮🇳',
      speechRecognition: true,
      textGeneration: true,
      textToSpeech: true,
      rtl: false,
      voiceNames: ['Google മലയാളം', 'Microsoft Midhun - Malayalam (India)', 'ml-IN', 'ml_IN', 'Malayalam'],
      sampleQuery: 'എനിക്ക് രണ്ട് ദിവസമായി പനിയും തൊണ്ടവേദനയും ഉണ്ട്.',
      welcomeGreeting: 'നമസ്കാരം! ഞാൻ വാണി വൈദ്യ, നിങ്ങളുടെ AI ആരോഗ്യ സഹായി. ഞാൻ നിങ്ങളെ എങ്ങനെ സഹായിക്കണം?'
    },
    {
      id: 'mr',
      code: 'mr-IN',
      name: 'Marathi',
      nativeName: 'मराठी',
      script: 'Devanagari',
      region: 'Maharashtra, India',
      flag: '🇮🇳',
      speechRecognition: true,
      textGeneration: true,
      textToSpeech: true,
      rtl: false,
      voiceNames: ['Google मराठी', 'Microsoft Aarohi - Marathi (India)', 'mr-IN', 'mr_IN', 'Marathi'],
      sampleQuery: 'मला दोन दिवसांपासून खूप ताप आणि डोकेदुखी आहे.',
      welcomeGreeting: 'नमस्कार! मी वाणी वैद्य, तुमची AI आरोग्य सहाय्यक. मी आपल्याला कशी मदत करू शकते?'
    },
    {
      id: 'bn',
      code: 'bn-IN',
      name: 'Bengali',
      nativeName: 'বাংলা',
      script: 'Bengali',
      region: 'West Bengal & Tripura, India',
      flag: '🇮🇳',
      speechRecognition: true,
      textGeneration: true,
      textToSpeech: true,
      rtl: false,
      voiceNames: ['Google বাংলা', 'Microsoft Bashkar - Bengali (India)', 'bn-IN', 'bn_IN', 'Bengali'],
      sampleQuery: 'আমার দুদিন ধরে জ্বর এবং গলা ব্যথা করছে।',
      welcomeGreeting: 'নমস্কার! আমি বাণী বৈদ্য, আপনার AI স্বাস্থ্য সহকারী। আমি আপনাকে কীভাবে সাহায্য করতে পারি?'
    },
    {
      id: 'gu',
      code: 'gu-IN',
      name: 'Gujarati',
      nativeName: 'ગુજરાતી',
      script: 'Gujarati',
      region: 'Gujarat, India',
      flag: '🇮🇳',
      speechRecognition: true,
      textGeneration: true,
      textToSpeech: true,
      rtl: false,
      voiceNames: ['Google ગુજરાતી', 'Microsoft Dhwani - Gujarati (India)', 'gu-IN', 'gu_IN', 'Gujarati'],
      sampleQuery: 'મને બે દિવસથી તાવ અને માથાનો દુખાવો છે.',
      welcomeGreeting: 'નમસ્તે! હું વાણી વૈદ્ય છું, તમારી AI આરોગ્ય સહાયક. હું તમારી કેવી રીતે મદદ કરી શકું?'
    },
    {
      id: 'pa',
      code: 'pa-IN',
      name: 'Punjabi',
      nativeName: 'ਪੰਜਾਬੀ',
      script: 'Gurmukhi',
      region: 'Punjab, India',
      flag: '🇮🇳',
      speechRecognition: true,
      textGeneration: true,
      textToSpeech: true,
      rtl: false,
      voiceNames: ['Google ਪੰਜਾਬੀ', 'Microsoft Ojas - Punjabi (India)', 'pa-IN', 'pa_IN', 'Punjabi'],
      sampleQuery: 'ਮੈਨੂੰ ਦੋ ਦਿਨਾਂ ਤੋਂ ਬੁਖਾਰ ਅਤੇ ਗਲੇ ਵਿੱਚ ਦਰਦ ਹੈ।',
      welcomeGreeting: 'ਸਤਿ ਸ਼੍ਰੀ ਅਕਾਲ! ਮੈਂ ਵਾਣੀ ਵੈਦ ਹਾਂ, ਤੁਹਾਡੀ AI ਸਿਹਤ ਸਹਾਇਕ। ਮੈਂ ਤੁਹਾਡੀ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦੀ ਹਾਂ?'
    },
    {
      id: 'or',
      code: 'or-IN',
      name: 'Odia',
      nativeName: 'ଓଡ଼ିଆ',
      script: 'Odia',
      region: 'Odisha, India',
      flag: '🇮🇳',
      speechRecognition: true,
      textGeneration: true,
      textToSpeech: true,
      rtl: false,
      voiceNames: ['or-IN', 'Odia'],
      sampleQuery: 'ମୋତେ ଦୁଇ ଦିନ ହେବ ଜ୍ୱର ଏବଂ ଗଳା ଯନ୍ତ୍ରଣା ହେଉଛି।',
      welcomeGreeting: 'ନମସ୍କାର! ମୁଁ ବାଣୀ ବୈଦ୍ୟ, ଆପଣଙ୍କ AI ସ୍ୱାସ୍ଥ୍ୟ ସହାୟିକା। ମୁଁ ଆପଣଙ୍କୁ କିପରି ସାହାଯ୍ୟ କରିପାରିବି?'
    },
    {
      id: 'as',
      code: 'as-IN',
      name: 'Assamese',
      nativeName: 'অসমীয়া',
      script: 'Bengali-Assamese',
      region: 'Assam, India',
      flag: '🇮🇳',
      speechRecognition: true,
      textGeneration: true,
      textToSpeech: true,
      rtl: false,
      voiceNames: ['as-IN', 'Assamese'],
      sampleQuery: 'মোৰ দুদিন ধৰি জ্বৰ আৰু ডিঙিৰ বিষ হৈ আছে।',
      welcomeGreeting: 'নমস্কাৰ! মই বাণী বৈদ্য, আপোনাৰ AI স্বাস্থ্য সহায়ক। মই আপোনাক কেনেকৈ সহায় কৰিব পাৰো?'
    },
    {
      id: 'ur',
      code: 'ur-IN',
      name: 'Urdu',
      nativeName: 'اردو',
      script: 'Perso-Arabic',
      region: 'India & South Asia',
      flag: '🇮🇳',
      speechRecognition: true,
      textGeneration: true,
      textToSpeech: true,
      rtl: true,
      voiceNames: ['Google اردو', 'Microsoft Salman - Urdu (India)', 'ur-IN', 'ur_IN', 'Urdu'],
      sampleQuery: 'مجھے دو دن سے بخار اور گلے میں درد ہے۔',
      welcomeGreeting: 'السلام علیکم! میں وانی ویدیہ ہوں، آپ کی AI صحت معاون۔ میں آپ کی کیا مدد کر سکتی ہوں؟'
    },
    {
      id: 'sa',
      code: 'sa-IN',
      name: 'Sanskrit',
      nativeName: 'संस्कृतम्',
      script: 'Devanagari',
      region: 'Classical India',
      flag: '🇮🇳',
      speechRecognition: true,
      textGeneration: true,
      textToSpeech: true,
      rtl: false,
      voiceNames: ['sa-IN', 'Sanskrit'],
      sampleQuery: 'मम दिनद्वयात् ज्वरः कण्ठवेदना च वर्तते।',
      welcomeGreeting: 'नमस्ते! अहम् वाणी वैद्यः, भवतः AI स्वास्थ्य सहायकः। अहम् कथम् साहाय्यम् कुर्याम्?'
    },
    {
      id: 'kok',
      code: 'kok-IN',
      name: 'Konkani',
      nativeName: 'कोंकणी',
      script: 'Devanagari',
      region: 'Goa & Coastal Karnataka, India',
      flag: '🇮🇳',
      speechRecognition: true,
      textGeneration: true,
      textToSpeech: true,
      rtl: false,
      voiceNames: ['kok-IN', 'Konkani'],
      sampleQuery: 'म्हाका दोन दिसांसाकून जोर आनी तकली दुखता.',
      welcomeGreeting: 'नमस्कार! हांव वाणी वैद्य, तुमची AI भलायकी सहाय्यक.'
    },
    {
      id: 'ne',
      code: 'ne-NP',
      name: 'Nepali',
      nativeName: 'नेपाली',
      script: 'Devanagari',
      region: 'Sikkim, North Bengal & Nepal',
      flag: '🇮🇳',
      speechRecognition: true,
      textGeneration: true,
      textToSpeech: true,
      rtl: false,
      voiceNames: ['ne-NP', 'Nepali'],
      sampleQuery: 'मलाई दुई दिनदेखि ज्वरो र टाउको दुखेको छ।',
      welcomeGreeting: 'नमस्ते! म वाणी वैद्य हुँ, तपाईंको AI स्वास्थ्य सहायक।'
    },
    {
      id: 'mai',
      code: 'mai-IN',
      name: 'Maithili',
      nativeName: 'मैथिली',
      script: 'Devanagari',
      region: 'Bihar & Jharkhand, India',
      flag: '🇮🇳',
      speechRecognition: true,
      textGeneration: true,
      textToSpeech: true,
      rtl: false,
      voiceNames: ['mai-IN', 'Maithili'],
      sampleQuery: 'हमरा दु दिन सँ बुखार आ माथ दरद अछि।',
      welcomeGreeting: 'प्रणाम! हम वाणी वैद्य छी, अहाँक AI स्वास्थ्य सहायक।'
    },
    {
      id: 'ks',
      code: 'ks-IN',
      name: 'Kashmiri',
      nativeName: 'कॉशुर',
      script: 'Perso-Arabic / Devanagari',
      region: 'Jammu & Kashmir, India',
      flag: '🇮🇳',
      speechRecognition: true,
      textGeneration: true,
      textToSpeech: true,
      rtl: true,
      voiceNames: ['ks-IN', 'Kashmiri'],
      sampleQuery: 'मे छु द्वन दोहन प्यठे तब ति कलदद।',
      welcomeGreeting: 'आदाब! ब छु वाणी वैद्य, तुहुन्द AI सेहथ मददगार।'
    },
    {
      id: 'sd',
      code: 'sd-IN',
      name: 'Sindhi',
      nativeName: 'سنڌي',
      script: 'Perso-Arabic',
      region: 'India',
      flag: '🇮🇳',
      speechRecognition: true,
      textGeneration: true,
      textToSpeech: true,
      rtl: true,
      voiceNames: ['sd-IN', 'Sindhi'],
      sampleQuery: 'مون کي ٻن ڏينهن کان بخار آهي.',
      welcomeGreeting: 'سلام! مان واڻي ويد آهيان، توهان جي AI صحت مددگار.'
    },
    {
      id: 'doi',
      code: 'doi-IN',
      name: 'Dogri',
      nativeName: 'डोगरी',
      script: 'Devanagari',
      region: 'Jammu, India',
      flag: '🇮🇳',
      speechRecognition: true,
      textGeneration: true,
      textToSpeech: true,
      rtl: false,
      voiceNames: ['doi-IN', 'Dogri'],
      sampleQuery: 'मिगी दो दिनें थमां बुखार ऐ।',
      welcomeGreeting: 'नमस्ते! मैं वाणी वैद्य आं, तुंदी AI सेहत मददगार।'
    },
    {
      id: 'mni',
      code: 'mni-IN',
      name: 'Manipuri (Meitei)',
      nativeName: 'ꯃꯤꯇꯩꯂꯣꯟ',
      script: 'Meitei Mayek',
      region: 'Manipur, India',
      flag: '🇮🇳',
      speechRecognition: true,
      textGeneration: true,
      textToSpeech: true,
      rtl: false,
      voiceNames: ['mni-IN', 'Manipuri'],
      sampleQuery: 'ꯑꯩꯉꯣꯟꯗ ꯅꯨꯃꯤꯠ ꯑꯅꯤꯅꯤ ꯑꯁꯥꯕ ꯂꯩꯔꯦ.',
      welcomeGreeting: 'ꯈꯨꯔꯨꯝꯖꯔꯤ! ꯑꯩꯍꯥꯛ ꯋꯥꯅꯤ ꯋꯩꯗ꯭ꯌꯅꯤ.'
    },
    {
      id: 'brx',
      code: 'brx-IN',
      name: 'Bodo',
      nativeName: 'बड़ो',
      script: 'Devanagari',
      region: 'Assam, India',
      flag: '🇮🇳',
      speechRecognition: true,
      textGeneration: true,
      textToSpeech: true,
      rtl: false,
      voiceNames: ['brx-IN', 'Bodo'],
      sampleQuery: 'आंनाव साननैसोनिफ्राय बेराम दं.',
      welcomeGreeting: 'खुलुमबाय! आं वानी वैद्य, नोंथांनि AI देहा सावस्रि हेफाजाबगिरि.'
    },
    {
      id: 'sat',
      code: 'sat-IN',
      name: 'Santali',
      nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ',
      script: 'Ol Chiki',
      region: 'Jharkhand, Odisha & West Bengal, India',
      flag: '🇮🇳',
      speechRecognition: true,
      textGeneration: true,
      textToSpeech: true,
      rtl: false,
      voiceNames: ['sat-IN', 'Santali'],
      sampleQuery: 'ᱤᱧᱟᱜ ᱵᱟᱨ ᱢᱟᱦᱟ ᱠᱷᱚᱱ ᱨᱩᱣᱟᱹ ᱢᱮᱱᱟᱜᱼᱟ.',
      welcomeGreeting: 'ᱡᱚᱦᱟᱨ! ᱤᱧ ᱫᱚ ᱵᱟᱬᱤ ᱵᱚᱭᱫᱚ.'
    }
  ];

  // 27 Major International Languages
  const INTERNATIONAL_LANGUAGES = [
    { id: 'es', code: 'es-ES', name: 'Spanish', nativeName: 'Español', script: 'Latin', region: 'Spain / Americas', flag: '🇪🇸', speechRecognition: true, textGeneration: true, textToSpeech: true, rtl: false, sampleQuery: 'Tengo fiebre y dolor de garganta desde hace dos días.' },
    { id: 'fr', code: 'fr-FR', name: 'French', nativeName: 'Français', script: 'Latin', region: 'France / Global', flag: '🇫🇷', speechRecognition: true, textGeneration: true, textToSpeech: true, rtl: false, sampleQuery: "J'ai de la fièvre et mal à la gorge depuis deux jours." },
    { id: 'de', code: 'de-DE', name: 'German', nativeName: 'Deutsch', script: 'Latin', region: 'Germany / Austria / Swiss', flag: '🇩🇪', speechRecognition: true, textGeneration: true, textToSpeech: true, rtl: false, sampleQuery: 'Ich habe seit zwei Tagen Fieber und Halsschmerzen.' },
    { id: 'it', code: 'it-IT', name: 'Italian', nativeName: 'Italiano', script: 'Latin', region: 'Italy', flag: '🇮🇹', speechRecognition: true, textGeneration: true, textToSpeech: true, rtl: false, sampleQuery: 'Ho febbre e mal di gola da due giorni.' },
    { id: 'pt', code: 'pt-BR', name: 'Portuguese', nativeName: 'Português', script: 'Latin', region: 'Brazil / Portugal', flag: '🇧🇷', speechRecognition: true, textGeneration: true, textToSpeech: true, rtl: false, sampleQuery: 'Estou com febre e dor de garganta há dois dias.' },
    { id: 'nl', code: 'nl-NL', name: 'Dutch', nativeName: 'Nederlands', script: 'Latin', region: 'Netherlands', flag: '🇳🇱', speechRecognition: true, textGeneration: true, textToSpeech: true, rtl: false, sampleQuery: 'Ik heb al twee dagen koorts en keelpijn.' },
    { id: 'ru', code: 'ru-RU', name: 'Russian', nativeName: 'Русский', script: 'Cyrillic', region: 'Russia / CIS', flag: '🇷🇺', speechRecognition: true, textGeneration: true, textToSpeech: true, rtl: false, sampleQuery: 'У меня высокая температура и боль в горле два дня.' },
    { id: 'ar', code: 'ar-SA', name: 'Arabic', nativeName: 'العربية', script: 'Arabic', region: 'Middle East & North Africa', flag: '🇸🇦', speechRecognition: true, textGeneration: true, textToSpeech: true, rtl: true, sampleQuery: 'عندي حمى والتهاب في الحلق منذ يومين.' },
    { id: 'tr', code: 'tr-TR', name: 'Turkish', nativeName: 'Türkçe', script: 'Latin', region: 'Turkey', flag: '🇹🇷', speechRecognition: true, textGeneration: true, textToSpeech: true, rtl: false, sampleQuery: 'İki gündür ateşim ve boğaz ağrım var.' },
    { id: 'zh', code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '中文 (简体)', script: 'Han', region: 'China / East Asia', flag: '🇨🇳', speechRecognition: true, textGeneration: true, textToSpeech: true, rtl: false, sampleQuery: '我已经发烧和喉咙痛两天了。' },
    { id: 'ja', code: 'ja-JP', name: 'Japanese', nativeName: '日本語', script: 'Kanji/Kana', region: 'Japan', flag: '🇯🇵', speechRecognition: true, textGeneration: true, textToSpeech: true, rtl: false, sampleQuery: '2日前から熱と喉の痛みがあります。' },
    { id: 'ko', code: 'ko-KR', name: 'Korean', nativeName: '한국어', script: 'Hangul', region: 'South Korea', flag: '🇰🇷', speechRecognition: true, textGeneration: true, textToSpeech: true, rtl: false, sampleQuery: '이틀 전부터 열이 나고 목이 아픕니다.' },
    { id: 'vi', code: 'vi-VN', name: 'Vietnamese', nativeName: 'Tiếng Việt', script: 'Latin', region: 'Vietnam', flag: '🇻🇳', speechRecognition: true, textGeneration: true, textToSpeech: true, rtl: false, sampleQuery: 'Tôi bị sốt và đau họng hai ngày nay.' },
    { id: 'th', code: 'th-TH', name: 'Thai', nativeName: 'ไทย', script: 'Thai', region: 'Thailand', flag: '🇹🇭', speechRecognition: true, textGeneration: true, textToSpeech: true, rtl: false, sampleQuery: 'ฉันมีไข้และเจ็บคอมาสองวันแล้ว' },
    { id: 'id', code: 'id-ID', name: 'Indonesian', nativeName: 'Bahasa Indonesia', script: 'Latin', region: 'Indonesia', flag: '🇮🇩', speechRecognition: true, textGeneration: true, textToSpeech: true, rtl: false, sampleQuery: 'Saya mengalami demam dan sakit tenggorokan selama dua hari.' },
    { id: 'ms', code: 'ms-MY', name: 'Malay', nativeName: 'Bahasa Melayu', script: 'Latin', region: 'Malaysia', flag: '🇲🇾', speechRecognition: true, textGeneration: true, textToSpeech: true, rtl: false, sampleQuery: 'Saya mengalami demam dan sakit tekak selama dua hari.' },
    { id: 'fil', code: 'fil-PH', name: 'Filipino', nativeName: 'Filipino', script: 'Latin', region: 'Philippines', flag: '🇵🇭', speechRecognition: true, textGeneration: true, textToSpeech: true, rtl: false, sampleQuery: 'Mayroon akong lagnat at masakit ang lalamunan sa loob ng dalawang araw.' },
    { id: 'sw', code: 'sw-KE', name: 'Swahili', nativeName: 'Kiswahili', script: 'Latin', region: 'East Africa', flag: '🇰🇪', speechRecognition: true, textGeneration: true, textToSpeech: true, rtl: false, sampleQuery: 'Nina homa na maumivu ya koo kwa siku mbili.' },
    { id: 'pl', code: 'pl-PL', name: 'Polish', nativeName: 'Polski', script: 'Latin', region: 'Poland', flag: '🇵🇱', speechRecognition: true, textGeneration: true, textToSpeech: true, rtl: false, sampleQuery: 'Mam gorączkę i ból gardła od dwóch dni.' },
    { id: 'uk', code: 'uk-UA', name: 'Ukrainian', nativeName: 'Українська', script: 'Cyrillic', region: 'Ukraine', flag: '🇺🇦', speechRecognition: true, textGeneration: true, textToSpeech: true, rtl: false, sampleQuery: 'У мене лихоманка та біль у горлі вже два дні.' },
    { id: 'ro', code: 'ro-RO', name: 'Romanian', nativeName: 'Română', script: 'Latin', region: 'Romania', flag: '🇷🇴', speechRecognition: true, textGeneration: true, textToSpeech: true, rtl: false, sampleQuery: 'Am febră și mă doare gâtul de două zile.' },
    { id: 'el', code: 'el-GR', name: 'Greek', nativeName: 'Ελληνικά', script: 'Greek', region: 'Greece', flag: '🇬🇷', speechRecognition: true, textGeneration: true, textToSpeech: true, rtl: false, sampleQuery: 'Έχω πυρετό και πονόλαιμο εδώ και δύο μέρες.' },
    { id: 'he', code: 'he-IL', name: 'Hebrew', nativeName: 'עברית', script: 'Hebrew', region: 'Israel', flag: '🇮🇱', speechRecognition: true, textGeneration: true, textToSpeech: true, rtl: true, sampleQuery: 'יש לי חום וכאב גרון כבר יומיים.' },
    { id: 'fa', code: 'fa-IR', name: 'Persian (Farsi)', nativeName: 'فارسی', script: 'Perso-Arabic', region: 'Iran', flag: '🇮🇷', speechRecognition: true, textGeneration: true, textToSpeech: true, rtl: true, sampleQuery: 'من دو روز است که تب و گلودرد دارم.' },
    { id: 'cs', code: 'cs-CZ', name: 'Czech', nativeName: 'Čeština', script: 'Latin', region: 'Czech Republic', flag: '🇨🇿', speechRecognition: true, textGeneration: true, textToSpeech: true, rtl: false, sampleQuery: 'Mám horečku a bolí mě v krku už dva dny.' },
    { id: 'sv', code: 'sv-SE', name: 'Swedish', nativeName: 'Svenska', script: 'Latin', region: 'Sweden', flag: '🇸🇪', speechRecognition: true, textGeneration: true, textToSpeech: true, rtl: false, sampleQuery: 'Jag har haft feber och halsont i två dagar.' },
    { id: 'da', code: 'da-DK', name: 'Danish', nativeName: 'Dansk', script: 'Latin', region: 'Denmark', flag: '🇩🇰', speechRecognition: true, textGeneration: true, textToSpeech: true, rtl: false, sampleQuery: 'Jeg har haft feber og ondt i halsen i to dage.' }
  ];

  // Combine into Master Registry
  const ALL_LANGUAGES = [...INDIAN_LANGUAGES, ...INTERNATIONAL_LANGUAGES];
  const LANG_MAP_BY_ID = new Map(ALL_LANGUAGES.map(l => [l.id, l]));
  const LANG_MAP_BY_CODE = new Map(ALL_LANGUAGES.map(l => [l.code.toLowerCase(), l]));

  // Code-switching normalizer map for Indian multilingual phrases
  const INDIAN_CODESWITCH_ALIASES = [
    // Hinglish
    { pattern: /\b(mujhe|mere ko|hmko)\s+fever\s+(hai|ho raha hai|aa raha hai)\b/gi, canonical: 'fever' },
    { pattern: /\b(chest|chhati)\s+(mein|me)\s+(pain|dard)\b/gi, canonical: 'chest pain' },
    { pattern: /\b(headache|sar dard|sir dard|sar me dard)\b/gi, canonical: 'headache' },
    { pattern: /\b(pet|stomach)\s+(me|mein)\s+(dard|pain)\b/gi, canonical: 'abdominal pain' },
    { pattern: /\b(gale|gala|throat)\s+(me|mein)\s+(kharash|dard|pain)\b/gi, canonical: 'sore throat' },
    { pattern: /\b(kamar|back)\s+(dard|pain)\b/gi, canonical: 'back pain' },
    { pattern: /\b(khansi|cough)\s+(hai|aa rahi hai)\b/gi, canonical: 'cough' },
    { pattern: /\b(dengue|dengu)\s+(ke lakshan|symptoms)\b/gi, canonical: 'dengue' },

    // Kanglish (Kannada + English)
    { pattern: /\b(nange|nanage|namage)\s+(fever|jvara|jwara)\s+(ide|bandide|aagide)\b/gi, canonical: 'fever' },
    { pattern: /\b(throat|gantalu)\s+(pain|novu)\s+(ide|agthide)\b/gi, canonical: 'sore throat' },
    { pattern: /\b(stomach|hotte)\s+(pain|novu)\s+(ide|agthide)\b/gi, canonical: 'abdominal pain' },
    { pattern: /\b(head|tale|thale)\s+(pain|novu|heavy)\b/gi, canonical: 'headache' },
    { pattern: /\b(back|bennu)\s+(pain|novu)\b/gi, canonical: 'back pain' },
    { pattern: /\b(chest|ede)\s+(pain|novu|bharavagide)\b/gi, canonical: 'chest pain' },
    { pattern: /\b(kemmu|cough)\s+(ide|bartha ide)\b/gi, canonical: 'cough' },
    { pattern: /\b(dengue|dengyu)\s+(lakshanagalu|symptoms)\b/gi, canonical: 'dengue' },

    // Tanglish (Tamil + English)
    { pattern: /\b(enakku|enaku)\s+(fever|kaichal)\s+(irukku|iruku)\b/gi, canonical: 'fever' },
    { pattern: /\b(thalaivali|headache)\s+(irukku|iruku)\b/gi, canonical: 'headache' },
    { pattern: /\b(vayiru|stomach)\s+(vali|pain)\b/gi, canonical: 'abdominal pain' },
    { pattern: /\b(thondai|throat)\s+(vali|pain)\b/gi, canonical: 'sore throat' },

    // Telugu-English
    { pattern: /\b(naaku|naku)\s+(fever|jwaram)\s+(undi|vastondi)\b/gi, canonical: 'fever' },
    { pattern: /\b(talanoppi|headache)\s+(undi|vastundi)\b/gi, canonical: 'headache' },
    { pattern: /\b(kadupu|stomach)\s+(noppi|pain)\b/gi, canonical: 'abdominal pain' }
  ];

  return {
    indianLanguages: INDIAN_LANGUAGES,
    internationalLanguages: INTERNATIONAL_LANGUAGES,
    allLanguages: ALL_LANGUAGES,
    totalCount: ALL_LANGUAGES.length,

    getById(id) {
      if (!id) return INDIAN_LANGUAGES[0];
      return LANG_MAP_BY_ID.get(id.toLowerCase()) || INDIAN_LANGUAGES[0];
    },

    getByCode(code) {
      if (!code) return INDIAN_LANGUAGES[0];
      return LANG_MAP_BY_CODE.get(code.toLowerCase()) || INDIAN_LANGUAGES[0];
    },

    search(query) {
      if (!query || !query.trim()) return ALL_LANGUAGES;
      const q = query.trim().toLowerCase();
      return ALL_LANGUAGES.filter(l =>
        l.name.toLowerCase().includes(q) ||
        l.nativeName.toLowerCase().includes(q) ||
        l.id.toLowerCase().includes(q) ||
        l.region.toLowerCase().includes(q)
      );
    },

    normalizeCodeSwitching(text) {
      if (!text || typeof text !== 'string') return text || '';
      let normalized = text;
      for (const rule of INDIAN_CODESWITCH_ALIASES) {
        if (rule.pattern.test(normalized)) {
          normalized = normalized.replace(rule.pattern, rule.canonical);
        }
      }
      return normalized;
    }
  };
}));
