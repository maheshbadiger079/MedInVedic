/**
 * i18n.js — MedInVedic Multilanguage System
 * Supports: English (en), Hindi (hi), Kannada (kn)
 * Usage:
 *   data-i18n="key"         → translates text content
 *   data-i18n-placeholder="key" → translates placeholder attribute
 *   window.I18n.t('key')    → returns translated string
 *   window.I18n.setLang('hi') → switches language globally
 */
(function () {

  // ── TRANSLATION DICTIONARY ──────────────────────────────────────
  const TRANSLATIONS = {

    // ── ENGLISH ──────────────────────────────────────────────────
    en: {
      // NAV
      'nav.home':        'Home',
      'nav.categories':  'Categories',
      'nav.consult':     'Consult',
      'nav.nearby':      'Nearby',
      'nav.healthhub':   'Hub',
      'nav.dashboard':   'Dashboard',
      'nav.admin':       'Admin',
      'nav.cart':        'Cart',
      'nav.hello':       'Hello, sign in',
      'nav.accounts':    'My Profile',
      'nav.orders':      '& Orders',
      'nav.location.lbl':'Deliver to',
      'nav.location.def':'Select Location',
      'loc.modal.title': 'Choose your location',
      'loc.modal.subtitle':'Delivery options and delivery speeds may vary for different locations.',
      'loc.enter_pincode':'Enter an Indian pincode',
      'loc.btn.apply':   'Apply',
      'loc.or':          '— or —',
      'loc.btn.gps':     'Use current location',
      'nav.search.ph':   'Search medicines, herbs…',

      // HERO
      'hero.badge':      "India's #1 Dual Healthcare Marketplace",
      'hero.title':      'Where Modern Medicine<br>Meets Ancient Ayurveda',
      'hero.subtitle':   'Discover the perfect balance of science and nature. Search health conditions to get dual recommendations — modern pharmaceuticals and Ayurvedic remedies.',
      'hero.search.ph':  'Search: cold, headache, stress, digestion, diabetes…',
      'hero.search.btn': 'Search',
      'hero.upload.rx':  'Upload Prescription',
      'hero.consult':    'Consult Doctor',
      'hero.ai':         'AI Health Assistant',

      // SECTIONS
      'section.modern':      'Modern Medicines',
      'section.modern.sub':  'Pharmaceutical grade',
      'section.ayur':        'Ayurvedic Wellness',
      'section.ayur.sub':    'Natural healing',
      'section.goals':       'Health Goals',
      'section.goals.sub':   'Find products by condition',
      'section.trending':    'Trending Products',
      'section.trending.sub':'Most purchased this week',
      'section.doctors':     'Top Doctors Online',
      'section.doctors.sub': 'Consult from home',
      'section.articles':    'Health Knowledge Hub',
      'section.articles.sub':'Evidence-based articles on Ayurveda, medicines & lifestyle',
      'section.homeremedies': 'Ancient Home Remedies',
      'section.homeremedies.sub': 'Natural healing from your kitchen',

      // HEALTH GOALS
      'goal.immunity':   'Immunity Boost',
      'goal.immunity.d': 'Strengthen defenses',
      'goal.stress':     'Stress Relief',
      'goal.stress.d':   'Calm mind & body',
      'goal.digestion':  'Digestion Care',
      'goal.digestion.d':'Healthy gut',
      'goal.skin':       'Skin Care',
      'goal.skin.d':     'Glow naturally',
      'goal.fever':      'Fever Care',
      'goal.fever.d':    'Quick relief',
      'goal.cold':       'Cold & Flu',
      'goal.cold.d':     'Dual remedies',

      // FILTER TABS
      'tab.all':        'All',
      'tab.fever':      'Fever',
      'tab.cold':       'Cold',
      'tab.digestion':  'Digestion',
      'tab.immunity':   'Immunity',
      'tab.stress':     'Stress',
      'tab.skin':       'Skin',

      // FEATURED BANNER
      'banner.title':   'Ayurvedic Wisdom + Modern Science',
      'banner.text':    'Our unique dual-recommendation system compares pharmaceutical and herbal solutions for every condition.',
      'banner.btn':     'Explore Now →',

      // PRODUCT CARD
      'product.addcart':   'Add to Cart',
      'product.rx.needed': 'Rx Required',
      'product.view':      'View Details',
      'product.reviews':   'reviews',
      'product.instock':   'In Stock',
      'product.outstock':  'Out of Stock',

      // SEARCH
      'search.modern.title':  'Modern Medicine Solutions',
      'search.ayur.title':    'Ayurvedic Natural Remedies',
      'search.results':       'Search Results',
      'search.subtitle':      'Showing both modern medicine and Ayurvedic recommendations',

      // CART
      'cart.title':      'Your Cart',
      'cart.empty':      'Your cart is empty',
      'cart.total':      'Total',
      'cart.checkout':   'Checkout',
      'cart.remove':     'Remove',
      'pay.title':       'Confirm & Pay',
      'pay.subtitle':    'Complete your payment using UPI QR below',
      'pay.total':       'Total Amount Paid:',

      // PRESCRIPTION MODAL
      'rx.title':        'Upload Prescription',
      'rx.subtitle':     "Upload your doctor's prescription to order prescription-only medicines.",
      'rx.upload.text':  'Drag & drop or click to upload',
      'rx.upload.sub':   'Supports JPG, PNG, PDF • Max 10 MB',
      'rx.browse':       'Browse Files',
      'rx.camera':       'Camera',

      // CHATBOT
      'chat.title':      'MedInVedic AI',
      'chat.status':     '● Online — Ask me anything',
      'chat.ph':         'Describe your symptoms…',
      'chat.greeting':   "Hi! I'm your AI Health Assistant.<br><br>Describe your symptoms and I'll recommend <strong>both modern medicines and Ayurvedic remedies</strong>!<br><br>Try: <em>headache, cold, stress, digestion</em>",

      // STATS
      'stat.products':    'Products',
      'stat.doctors':     'Doctors',
      'stat.patients':    'Happy Patients',
      'stat.genuine':     'Genuine Products',

      // FOOTER
      'footer.tagline':   "India's first dual healthcare marketplace combining modern pharmaceuticals and Ayurvedic wisdom for complete wellness.",
      'footer.products':  'Products',
      'footer.services':  'Services',
      'footer.support':   'Support',
      'footer.medicines': 'Medicines',
      'footer.ayurvedic': 'Ayurvedic',
      'footer.devices':   'Healthcare Devices',
      'footer.supplements':'Supplements',
      'footer.consult':   'Doctor Consult',
      'footer.rx':        'Upload Prescription',
      'footer.hub':       'Health Hub',

      'footer.helpcenter':'Help Center',
      'footer.contact':   'Contact Us',
      'footer.copy':      '© 2026 MedInVedic. All rights reserved.',
      'footer.secure':    'Secure & HIPAA Compliant Platform',

      // ADMIN LOGIN
      'admin.login.title':    'Welcome back',
      'admin.login.subtitle': 'Sign in with your admin credentials to access the control panel.',
      'admin.login.email.lbl':'Admin Email',
      'admin.login.email.ph': 'admin@medinvedic.com',
      'admin.login.pwd.lbl':  'Password',
      'admin.login.pwd.ph':   'Enter your password',
      'admin.login.btn':      'Sign In to Admin Panel',
      'admin.login.back':     '← Back to MedInVedic Store',
      'admin.login.security': 'This area is restricted to authorized administrators only.',

      // DASHBOARD
      'dash.welcome':     'Welcome back',
      'dash.member.since':'Member since',
      'dash.orders':      'My Orders',
      'dash.rx':          'Prescriptions',
      'dash.consults':    'Consultations',
      'dash.profile':     'Profile',

      // MOBILE NAV
      'mob.home':      'Home',
      'mob.cats':      'Categories',
      'mob.consult':   'Consult',
      'mob.cart':      'Cart',
      'mob.profile':   'Profile',

      // DOCTORS
      'doc.consult.btn':  'Consult',
      'doc.viewall':      'View All Doctors →',
      'doc.available':    'Available Now',
      'doc.rating':       'Rating',

      // EXPLORE
      'explore.all.articles': 'Explore All Articles →',

      // NEARBY
      'near.title':      'Nearby Doctors & Clinics',
      'near.sub':        'Find certified medical experts in your vicinity',

      // RAG HEALTH INTELLIGENCE ENGINE
      'rag.badge':            'CLINICAL ENGINE',
      'rag.title':            'Health Intelligence AI',
      'rag.subtitle':         'Evidence-grounded answers from WHO, CDC, NHS, MoHFW clinical guidelines.<br><strong>Not a diagnostic tool</strong> — for informational purposes only.',
      'rag.chip.fever':       '🌡️ High Fever',
      'rag.chip.stomach':     '🫃 Stomach Pain',
      'rag.chip.back':        '🦴 Back Pain',
      'rag.chip.headache':    '🧠 Headache',
      'rag.chip.throat':      '🗣️ Sore Throat',
      'rag.chip.dengue':      '🦟 Dengue Scan',
      'rag.input.ph':         'Ask about symptoms, medicines, or remedies...',
      'rag.btn.pdf':          'Download Verified PDF Report',
      'rag.btn.listen':       'Listen',
      'rag.btn.stop':         'Stop',
      'rag.btn.copy':         'Copy for Doctor',
      'rag.btn.share':        'Share',
      'rag.sec.direct':       'Direct Answer',
      'rag.sec.causes':       'Common Possibilities',
      'rag.sec.warning':      'Warning Signs — Seek Medical Care',
      'rag.sec.modern':       'Modern Medicines (Allopathic / Pharmaceutical)',
      'rag.sec.ayur':         'Ayurvedic Remedies (Herbal / Traditional)',
      'rag.sec.home':         'Home Remedies (Household & Supportive Care)',
      'rag.sec.questions':    'Suggested Questions for Your Doctor',
      'rag.notice':           '⚕️ For emergencies call 112. This assistant answers only from verified medical sources. Always consult a licensed healthcare provider for diagnosis and treatment.'
    },

    // ── HINDI ────────────────────────────────────────────────────
    hi: {
      // NAV
      'nav.home':        'होम',
      'nav.categories':  'श्रेणियाँ',
      'nav.consult':     'परामर्श',
      'nav.nearby':      'पास में',
      'nav.healthhub':   'हब',
      'nav.dashboard':   'डैशबोर्ड',
      'nav.admin':       'एडमिन',
      'nav.cart':        'कार्ट',
      'nav.hello':       'नमस्ते, साइन इन करें',
      'nav.accounts':    'मेरी प्रोफ़ाइल',
      'nav.orders':      'और ऑर्डर',
      'nav.location.lbl':'डिलीवरी का स्थान',
      'nav.location.def':'स्थान चुनें',
      'loc.modal.title': 'अपना स्थान चुनें',
      'loc.modal.subtitle':'विभिन्न स्थानों के लिए डिलीवरी विकल्प और गति भिन्न हो सकती है।',
      'loc.enter_pincode':'भारतीय पिनकोड दर्ज करें',
      'loc.btn.apply':   'लागू करें',
      'loc.or':          '— या —',
      'loc.btn.gps':     '📍 वर्तमान स्थान का उपयोग करें',
      'nav.search.ph':   'दवाइयाँ, जड़ी-बूटियाँ खोजें…',

      // HERO
      'hero.badge':      "भारत का #1 दोहरा स्वास्थ्य बाज़ार",
      'hero.title':      'जहाँ आधुनिक चिकित्सा<br>प्राचीन आयुर्वेद से मिलती है',
      'hero.subtitle':   'विज्ञान और प्रकृति का सही संतुलन खोजें। स्वास्थ्य स्थितियाँ खोजें और दोनों — आधुनिक दवाइयाँ और आयुर्वेदिक उपचार — की सिफारिश पाएं।',
      'hero.search.ph':  'खोजें: सर्दी, सिरदर्द, तनाव, पाचन, मधुमेह…',
      'hero.search.btn': 'खोजें',
      'hero.upload.rx':  'पर्चा अपलोड करें',
      'hero.consult':    'डॉक्टर से परामर्श',
      'hero.ai':         'AI स्वास्थ्य सहायक',

      // SECTIONS
      'section.modern':      'आधुनिक दवाइयाँ',
      'section.modern.sub':  'फार्ಮಾಸ್ಯುಟಿಕಲ್ ಗ್ರೇಡ್',
      'section.ayur':        'आयुर्वेदिक उत्पाद',
      'section.ayur.sub':    'प्राकृतिक उपचार',
      'section.goals':       'स्वास्थ्य लक्ष्य',
      'section.goals.sub':   'स्थिति के अनुसार उत्पाद खोजें',
      'section.trending':    'ट्रेंडिंग उत्पाद',
      'section.trending.sub':'इस सप्ताह सबसे अधिक खरीदे गए',
      'section.doctors':     'शीर्ष डॉक्टर ऑनलाइन',
      'section.doctors.sub': 'घर से परामर्श करें',
      'section.articles':    'स्वास्थ्य ज्ञान केंद्र',
      'section.articles.sub':'आयुर्वेद, दवाइयों और जीवनशैली पर साक्ष्य-आधारित लेख',
      'section.homeremedies': 'प्राचीन घरेलू उपचार',
      'section.homeremedies.sub': 'आपकी रसोई से प्राकृतिक चिकित्सा',

      // HEALTH GOALS
      'goal.immunity':   'रोग प्रतिरोधक क्षमता',
      'goal.immunity.d': 'सुरक्षा मजबूत करें',
      'goal.stress':     'तनाव से राहत',
      'goal.stress.d':   'मन और शरीर शांत करें',
      'goal.digestion':  'पाचन देखभाल',
      'goal.digestion.d':'स्वस्थ आंत',
      'goal.skin':       'त्वचा की देखभाल',
      'goal.skin.d':     'प्राकृतिक चमक',
      'goal.fever':      'बुखार की देखभाल',
      'goal.fever.d':    'त्वरित राहत',
      'goal.cold':       'सर्दी और फ्लू',
      'goal.cold.d':     'दोहरे उपचार',

      // FILTER TABS
      'tab.all':        'सभी',
      'tab.fever':      'बुखार',
      'tab.cold':       'सर्दी',
      'tab.digestion':  'पाचन',
      'tab.immunity':   'प्रतिरक्षा',
      'tab.stress':     'तनाव',
      'tab.skin':       'त्वचा',

      // FEATURED BANNER
      'banner.title':   '🌿 आयुर्वेदिक ज्ञान + आधुनिक विज्ञान',
      'banner.text':    'हमारी अनूठी दोहरी अनुशंसा प्रणाली हर स्थिति के लिए फार्मास्युटिकल और हर्बल समाधानों की तुलना करती है।',
      'banner.btn':     'अभी एक्सप्लोर करें →',

      // PRODUCT CARD
      'product.addcart':   'कार्ट में जोड़ें',
      'product.rx.needed': '📋 पर्चा आवश्यक',
      'product.view':      'विवरण देखें',
      'product.reviews':   'समीक्षाएं',
      'product.instock':   'स्टॉक में',
      'product.outstock':  'स्टॉक में नहीं',

      // SEARCH
      'search.modern.title':  '💊 आधुनिक चिकित्सा समाधान',
      'search.ayur.title':    '🌿 आयुर्वेदिक प्राकृतिक उपचार',
      'search.results':       'खोज परिणाम',
      'search.subtitle':      'आधुनिक और आयुर्वेदिक दोनों सिफारिशें दिखाई जा रही हैं',

      // CART
      'cart.title':      '🛒 आपकी कार्ट',
      'cart.empty':      'आपकी कार्ट खाली है',
      'cart.total':      'कुल',
      'cart.checkout':   '💳 चेकआउट',
      'cart.remove':     'हटाएं',
      'pay.title':       '💳 भुगतान और पुष्टि',
      'pay.subtitle':    'नीचे दिए गए UPI QR का उपयोग करके भुगतान पूरा करें',
      'pay.total':       'कुल भुगतान राशि:',

      // PRESCRIPTION MODAL
      'rx.title':        '📄 पर्चा अपलोड करें',
      'rx.subtitle':     'पर्चे वाली दवाइयाँ ऑर्डर करने के लिए डॉक्टर का पर्चा अपलोड करें।',
      'rx.upload.text':  'ड्रैग करें या क्लिक करें',
      'rx.upload.sub':   'JPG, PNG, PDF • अधिकतम 10 MB',
      'rx.browse':       '📁 फाइल चुनें',
      'rx.camera':       '📷 कैमरा',

      // CHATBOT
      'chat.title':      'MedInVedic AI',
      'chat.status':     '● ऑनलाइन — कुछ भी पूछें',
      'chat.ph':         'अपने लक्षण बताएं…',
      'chat.greeting':   "👋 नमस्ते! मैं आपका AI स्वास्थ्य सहायक हूँ।<br><br>अपने लक्षण बताएं और मैं <strong>आधुनिक और आयुर्वेदिक दोनों</strong> उपचार सुझाऊंगा!<br><br>कोशिश करें: <em>सिरदर्द, सर्दी, तनाव, पाचन</em>",

      // STATS
      'stat.products':    'उत्पाद',
      'stat.doctors':     'डॉक्टर',
      'stat.patients':    'संतुष्ट मरीज',
      'stat.genuine':     'असली उत्पाद',

      // FOOTER
      'footer.tagline':   'भारत का पहला दोहरा स्वास्थ्य बाज़ार — आधुनिक फार्मास्युटिकल और आयुर्वेदिक ज्ञान का संयोजन।',
      'footer.products':  'उत्पाद',
      'footer.services':  'सेवाएं',
      'footer.support':   'सहायता',
      'footer.medicines': 'दवाइयाँ',
      'footer.ayurvedic': 'आयुर्वेदिक',
      'footer.devices':   'स्वास्थ्य उपकरण',
      'footer.supplements':'सप्लीमेंट',
      'footer.consult':   'डॉक्टर परामर्श',
      'footer.rx':        'पर्चा अपलोड',
      'footer.hub':       'स्वास्थ्य केंद्र',

      'footer.helpcenter':'सहायता केंद्र',
      'footer.contact':   'संपर्क करें',
      'footer.copy':      '© 2026 MedInVedic. सर्वाधिकार सुरक्षित।',
      'footer.secure':    '🔒 सुरक्षित और HIPAA अनुपालन प्लेटफॉर्म',

      // ADMIN LOGIN
      'admin.login.title':    'वापस स्वागत है',
      'admin.login.subtitle': 'कंट्रोल पैनल एक्सेस करने के लिए एडमिन क्रेडेंशियल से साइन इन करें।',
      'admin.login.email.lbl':'एडमिन ईमेल',
      'admin.login.email.ph': 'admin@medinvedic.com',
      'admin.login.pwd.lbl':  'पासवर्ड',
      'admin.login.pwd.ph':   'पासवर्ड दर्ज करें',
      'admin.login.btn':      'एडमिन पैनल में साइन इन करें',
      'admin.login.back':     '← MedInVedic स्टोर पर वापस जाएं',
      'admin.login.security': '🔐 यह क्षेत्र केवल अधिकृत एडमिन के लिए है।',

      // DASHBOARD
      'dash.welcome':     'वापस स्वागत है',
      'dash.member.since':'सदस्य बने',
      'dash.orders':      'मेरे ऑर्डर',
      'dash.rx':          'पर्चे',
      'dash.consults':    'परामर्श',
      'dash.profile':     'प्रोफाइल',

      // MOBILE NAV
      'mob.home':      'होम',
      'mob.cats':      'श्रेणियाँ',
      'mob.consult':   'परामर्श',
      'mob.cart':      'कार्ट',
      'mob.profile':   'प्रोफाइल',

      // DOCTORS
      'doc.consult.btn':  'परामर्श',
      'doc.viewall':      'सभी डॉक्टर देखें →',
      'doc.available':    '✅ अभी उपलब्ध',
      'doc.rating':       'रेटिंग',

      // EXPLORE
      'explore.all.articles': 'सभी लेख देखें →',

      // NEARBY
      'near.title':      'पास के डॉक्टर और क्लीनिक',
      'near.sub':        'अपने आसपास के प्रमाणित चिकित्सा विशेषज्ञों को खोजें',

      // RAG HEALTH INTELLIGENCE ENGINE
      'rag.badge':            'क्लिनिकल इंजन',
      'rag.title':            'हेल्थ इंटेलिजेंस AI',
      'rag.subtitle':         'WHO, CDC, NHS, MoHFW दिशानिर्देशों पर आधारित साक्ष्य-सत्यापित स्वास्थ्य जानकारी।<br><strong>यह नैदानिक उपकरण नहीं है</strong> — केवल सूचनात्मक उपयोग के लिए।',
      'rag.chip.fever':       '🌡️ तेज़ बुखार',
      'rag.chip.stomach':     '🫃 पेट दर्द',
      'rag.chip.back':        '🦴 पीठ दर्द',
      'rag.chip.headache':    '🧠 सिरदर्द',
      'rag.chip.throat':      '🗣️ गले में खराश',
      'rag.chip.dengue':      '🦟 डेंगू स्कैन',
      'rag.input.ph':         'लक्षणों, दवाओं या घरेलू उपचारों के बारे में पूछें...',
      'rag.btn.pdf':          'सत्यापित PDF रिपोर्ट डाउनलोड करें',
      'rag.btn.listen':       'सुनें',
      'rag.btn.stop':         'रोकें',
      'rag.btn.copy':         'डॉक्टर के लिए कॉपी करें',
      'rag.btn.share':        'शेयर करें',
      'rag.sec.direct':       'प्रत्यक्ष उत्तर',
      'rag.sec.causes':       'सामान्य संभावनाएं',
      'rag.sec.warning':      'चेतावनी संकेत — तुरंत डॉक्टर से मिलें',
      'rag.sec.modern':       'आधुनिक दवाइयाँ (एलोपैथिक / फार्मास्युटिकल)',
      'rag.sec.ayur':         'आयुर्वेदिक उपचार (हर्बल / पारंपरिक)',
      'rag.sec.home':         'घरेलू उपचार (प्राकृतिक व सुरक्षित देखभाल)',
      'rag.sec.questions':    'अपने डॉक्टर से पूछने योग्य प्रश्न',
      'rag.notice':           '⚕️ आपातकाल के लिए 112 पर कॉल करें। यह सहायक केवल सत्यापित स्रोतों से उत्तर देता है। निदान और उपचार के लिए हमेशा लाइसेंस प्राप्त चिकित्सक से परामर्श करें.'
    },

    // ── KANNADA ──────────────────────────────────────────────────
    kn: {
      // NAV
      'nav.home':        'ಮುಖಪುಟ',
      'nav.categories':  'ವಿಭಾಗಗಳು',
      'nav.consult':     'ಸಮಾಲೋಚನೆ',
      'nav.nearby':      'ಸಮೀಪದ',
      'nav.healthhub':   'ಹಬ್',
      'nav.dashboard':   'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
      'nav.admin':       'ನಿರ್ವಾಹಕ',
      'nav.cart':        'ಕಾರ್ಟ್',
      'nav.hello':       'ನಮಸ್ಕಾರ, ಸೈನ್ ಇನ್ ಮಾಡಿ',
      'nav.accounts':    'ನನ್ನ ಪ್ರೊಫೈಲ್',
      'nav.orders':      'ಮತ್ತು ಆರ್ಡರ್‌ಗಳು',
      'nav.location.lbl':'ವಿತರಣೆಯ ಸ್ಥಳ',
      'nav.location.def':'ಸ್ಥಳ ಆಯ್ಕೆಮಾಡಿ',
      'loc.modal.title': 'ನಿಮ್ಮ ಸ್ಥಳವನ್ನು ಆರಿಸಿ',
      'loc.modal.subtitle':'ವಿವಿಧ ಸ್ಥಳಗಳಿಗೆ ವಿತರಣಾ ಆಯ್ಕೆಗಳು ಮತ್ತು ವೇಗ ಭಿನ್ನವಾಗಿರಬಹುದು.',
      'loc.enter_pincode':'ಭಾರತೀಯ ಪಿನ್‌ಕೋಡ್ ನಮೂದಿಸಿ',
      'loc.btn.apply':   'ಅನ್ವಯಿಸಿ',
      'loc.or':          '— ಅಥವಾ —',
      'loc.btn.gps':     '📍 ಪ್ರಸ್ತುತ ಸ್ಥಳವನ್ನು ಬಳಸಿ',
      'nav.search.ph':   'ಔಷಧಗಳು, ಗಿಡಮೂಲಿಕೆಗಳು ಹುಡುಕಿ…',

      // HERO
      'hero.badge':      "ಭಾರತದ #1 ದ್ವಿ ಆರೋಗ್ಯ ಮಾರುಕಟ್ಟೆ",
      'hero.title':      'ಆಧುನಿಕ ವೈದ್ಯಕೀಯ<br>ಪ್ರಾಚೀನ ಆಯುರ್ವೇದವನ್ನು ಭೇಟಿಯಾಗುವಲ್ಲಿ',
      'hero.subtitle':   'ವಿಜ್ಞಾನ ಮತ್ತು ಪ್ರಕೃತಿಯ ಸಂಪೂರ್ಣ ಸಮತೋಲನ ಕಂಡುಕೊಳ್ಳಿ. ಆರೋಗ್ಯ ಸ್ಥಿತಿಗಳನ್ನು ಹುಡುಕಿ ದ್ವಿ ಶಿಫಾರಸ್ಸುಗಳನ್ನು ಪಡೆಯಿರಿ.',
      'hero.search.ph':  'ಹುಡುಕಿ: ಶೀತ, ತಲೆನೋವು, ಒತ್ತಡ, ಜೀರ್ಣಕ್ರಿಯೆ…',
      'hero.search.btn': 'ಹುಡುಕಿ',
      'hero.upload.rx':  'ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ಅಪ್ಲೋಡ್',
      'hero.consult':    'ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ',
      'hero.ai':         'AI ಆರೋಗ್ಯ ಸಹಾಯಕ',

      // SECTIONS
      'section.modern':      'ಆಧುನಿಕ ಔಷಧಗಳು',
      'section.modern.sub':  'ಔಷಧೀಯ ದರ್ಜೆ',
      'section.ayur':        'ಆಯುರ್ವೇದ ಉತ್ಪನ್ನಗಳು',
      'section.ayur.sub':    'ನೈಸರ್ಗಿಕ ಚಿಕಿತ್ಸೆ',
      'section.goals':       'ಆರೋಗ್ಯ ಗುರಿಗಳು',
      'section.goals.sub':   'ಸ್ಥಿತಿಯ ಪ್ರಕಾರ ಉತ್ಪನ್ನಗಳನ್ನು ಹುಡುಕಿ',
      'section.trending':    'ಟ್ರೆಂಡಿಂಗ್ ಉತ್ಪನ್ನಗಳು',
      'section.trending.sub':'ಈ ವಾರ ಅತ್ಯಧಿಕ ಖರೀದಿ',
      'section.doctors':     'ಅಗ್ರ ವೈದ್ಯರು ಆನ್ಲೈನ್',
      'section.doctors.sub': 'ಮನೆಯಿಂದ ಸಮಾಲೋಚನೆ',
      'section.articles':    'ಆರೋಗ್ಯ ಜ್ಞಾನ ಕೇಂದ್ರ',
      'section.articles.sub':'ಆಯುರ್ವೇದ, ಔಷಧಗಳು ಮತ್ತು ಜೀವನಶೈಲಿಯ ಕುರಿತು ಲೇಖನಗಳು',
      'section.homeremedies': 'ಪ್ರಾಚೀನ ಮನೆಮದ್ದುಗಳು',
      'section.homeremedies.sub': 'ನಿಮ್ಮ ಅಡುಗೆಮನೆಯಿಂದ ನೈಸರ್ಗಿಕ ಚಿಕಿತ್ಸೆ',

      // HEALTH GOALS
      'goal.immunity':   'ರೋಗ ನಿರೋಧಕ ಶಕ್ತಿ',
      'goal.immunity.d': 'ರಕ್ಷಣೆ ಬಲಗೊಳಿಸಿ',
      'goal.stress':     'ಒತ್ತಡ ನಿವಾರಣೆ',
      'goal.stress.d':   'ಮನಸ್ಸು ಮತ್ತು ದೇಹ ಶಾಂತ',
      'goal.digestion':  'ಜೀರ್ಣ ಆರೈಕೆ',
      'goal.digestion.d':'ಆರೋಗ್ಯಕರ ಜೀರ್ಣಾಂಗ',
      'goal.skin':       'ಚರ್ಮದ ಆರೈಕೆ',
      'goal.skin.d':     'ನೈಸರ್ಗಿಕ ಹೊಳಪು',
      'goal.fever':      'ಜ್ವರ ಆರೈಕೆ',
      'goal.fever.d':    'ತ್ವರಿತ ಪರಿಹಾರ',
      'goal.cold':       'ಶೀತ ಮತ್ತು ಫ್ಲೂ',
      'goal.cold.d':     'ದ್ವಿ ಪರಿಹಾರಗಳು',

      // FILTER TABS
      'tab.all':        'ಎಲ್ಲಾ',
      'tab.fever':      'ಜ್ವರ',
      'tab.cold':       'ಶೀತ',
      'tab.digestion':  'ಜೀರ್ಣಕ್ರಿಯೆ',
      'tab.immunity':   'ರೋಗನಿರೋಧಕ',
      'tab.stress':     'ಒತ್ತಡ',
      'tab.skin':       'ಚರ್ಮ',

      // FEATURED BANNER
      'banner.title':   '🌿 ಆಯುರ್ವೇದ ಜ್ಞಾನ + ಆಧುನಿಕ ವಿಜ್ಞಾನ',
      'banner.text':    'ನಮ್ಮ ಅನನ್ಯ ದ್ವಿ-ಶಿಫಾರಸ್ ವ್ಯವಸ್ಥೆ ಪ್ರತಿ ಸ್ಥಿತಿಗೆ ಔಷಧೀಯ ಮತ್ತು ಗಿಡಮೂಲಿಕೆ ಪರಿಹಾರಗಳನ್ನು ಹೋಲಿಸುತ್ತದೆ.',
      'banner.btn':     'ಈಗ ಅನ್ವೇಷಿಸಿ →',

      // PRODUCT CARD
      'product.addcart':   'ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಿ',
      'product.rx.needed': '📋 ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ಅಗತ್ಯ',
      'product.view':      'ವಿವರಗಳನ್ನು ನೋಡಿ',
      'product.reviews':   'ಪರಿಶೀಲನೆಗಳು',
      'product.instock':   'ಸ್ಟಾಕ್‌ನಲ್ಲಿದೆ',
      'product.outstock':  'ಸ್ಟಾಕ್ ಇಲ್ಲ',

      // SEARCH
      'search.modern.title':  '💊 ಆಧುನಿಕ ವೈದ್ಯಕೀಯ ಪರಿಹಾರಗಳು',
      'search.ayur.title':    '🌿 ಆಯುರ್ವೇದ ನೈಸರ್ಗಿಕ ಪರಿಹಾರಗಳು',
      'search.results':       'ಹುಡುಕಾಟ ಫಲಿತಾಂಶಗಳು',
      'search.subtitle':      'ಆಧುನಿಕ ಮತ್ತು ಆಯುರ್ವೇದ ಎರಡೂ ಶಿಫಾರಸ್ಸುಗಳು ತೋರಿಸಲಾಗುತ್ತಿದೆ',

      // CART
      'cart.title':      '🛒 ನಿಮ್ಮ ಕಾರ್ಟ್',
      'cart.empty':      'ನಿಮ್ಮ ಕಾರ್ಟ್ ಖಾಲಿಯಾಗಿದೆ',
      'cart.total':      'ಒಟ್ಟು',
      'cart.checkout':   '💳 ಚೆಕ್‌ಔಟ್',
      'cart.remove':     'ತೆಗೆದುಹಾಕಿ',
      'pay.title':       '💳 ಪಾವತಿಸಿ ಮತ್ತು ಖಚಿತಪಡಿಸಿ',
      'pay.subtitle':    'ಕೆಳಗಿನ UPI QR ಬಳಸಿ ನಿಮ್ಮ ಪಾವತಿಯನ್ನು ಪೂರ್ಣಗೊಳಿಸಿ',
      'pay.total':       'ಒಟ್ಟು ಪಾವತಿಸಿದ ಮೊತ್ತ:',

      // PRESCRIPTION MODAL
      'rx.title':        '📄 ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ಅಪ್ಲೋಡ್',
      'rx.subtitle':     'ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ಔಷಧಗಳನ್ನು ಆರ್ಡರ್ ಮಾಡಲು ವೈದ್ಯರ ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ಅಪ್ಲೋಡ್ ಮಾಡಿ.',
      'rx.upload.text':  'ಡ್ರ್ಯಾಗ್ ಮಾಡಿ ಅಥವಾ ಕ್ಲಿಕ್ ಮಾಡಿ',
      'rx.upload.sub':   'JPG, PNG, PDF • ಗರಿಷ್ಠ 10 MB',
      'rx.browse':       '📁 ಫೈಲ್ ಆಯ್ಕೆ',
      'rx.camera':       '📷 ಕ್ಯಾಮೆರಾ',

      // CHATBOT
      'chat.title':      'MedInVedic AI',
      'chat.status':     '● ಆನ್‌ಲೈನ್ — ಏನೂ ಕೇಳಿ',
      'chat.ph':         'ನಿಮ್ಮ ಲಕ್ಷಣಗಳನ್ನು ವಿವರಿಸಿ…',
      'chat.greeting':   "👋 ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ AI ಆರೋಗ್ಯ ಸಹಾಯಕ.<br><br>ನಿಮ್ಮ ಲಕ್ಷಣಗಳನ್ನು ವಿವರಿಸಿ ಮತ್ತು ನಾನು <strong>ಆಧುನಿಕ ಮತ್ತು ಆಯುರ್ವೇದ ಎರಡೂ</strong> ಚಿಕಿತ್ಸೆಗಳನ್ನು ಸೂಚಿಸುತ್ತೇನೆ!<br><br>ಪ್ರಯತ್ನಿಸಿ: <em>ತಲೆನೋವು, ಶೀತ, ಒತ್ತಡ</em>",

      // STATS
      'stat.products':    'ಉತ್ಪನ್ನಗಳು',
      'stat.doctors':     'ವೈದ್ಯರು',
      'stat.patients':    'ಸಂತೃಪ್ತ ರೋಗಿಗಳು',
      'stat.genuine':     'ನಿಜವಾದ ಉತ್ಪನ್ನಗಳು',

      // FOOTER
      'footer.tagline':   'ಭಾರತದ ಮೊದಲ ದ್ವಿ ಆರೋಗ್ಯ ಮಾರುಕಟ್ಟೆ — ಆಧುನಿಕ ಔಷಧ ಮತ್ತು ಆಯುರ್ವೇದ ಜ್ಞಾನದ ಸಂಯೋಜನೆ.',
      'footer.products':  'ಉತ್ಪನ್ನಗಳು',
      'footer.services':  'ಸೇವೆಗಳು',
      'footer.support':   'ಸಹಾಯ',
      'footer.medicines': 'ಔಷಧಗಳು',
      'footer.ayurvedic': 'ಆಯುರ್ವೇದ',
      'footer.devices':   'ಆರೋಗ್ಯ ಉಪಕರಣಗಳು',
      'footer.supplements':'ಸಪ್ಲಿಮೆಂಟ್‌ಗಳು',
      'footer.consult':   'ವೈದ್ಯರ ಸಮಾಲೋಚನೆ',
      'footer.rx':        'ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ಅಪ್ಲೋಡ್',
      'footer.hub':       'ಆರೋಗ್ಯ ಕೇಂದ್ರ',

      'footer.helpcenter':'ಸಹಾಯ ಕೇಂದ್ರ',
      'footer.contact':   'ಸಂಪರ್ಕಿಸಿ',
      'footer.copy':      '© 2026 MedInVedic. ಎಲ್ಲ ಹಕ್ಕುಗಳು ಕಾಯ್ದಿರಿಸಿವೆ.',
      'footer.secure':    '🔒 ಸುರಕ್ಷಿತ ಮತ್ತು HIPAA ಅನುಸರಣೆ ವೇದಿಕೆ',

      // ADMIN LOGIN
      'admin.login.title':    'ಮರಳಿ ಸ್ವಾಗತ',
      'admin.login.subtitle': 'ನಿಯಂತ್ರಣ ಫಲಕ ಪ್ರವೇಶಿಸಲು ನಿರ್ವಾಹಕ ರುಜುವಾತುಗಳೊಂದಿಗೆ ಸೈನ್ ಇನ್ ಮಾಡಿ.',
      'admin.login.email.lbl':'ನಿರ್ವಾಹಕ ಇಮೇಲ್',
      'admin.login.email.ph': 'admin@medinvedic.com',
      'admin.login.pwd.lbl':  'ಪಾಸ್‌ವರ್ಡ್',
      'admin.login.pwd.ph':   'ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ',
      'admin.login.btn':      'ನಿರ್ವಾಹಕ ಪ್ಯಾನೆಲ್‌ಗೆ ಸೈನ್ ಇನ್',
      'admin.login.back':     '← MedInVedic ಅಂಗಡಿಗೆ ಹಿಂತಿರುಗಿ',
      'admin.login.security': '🔐 ಈ ಪ್ರದೇಶ ಅಧಿಕೃತ ನಿರ್ವಾಹಕರಿಗೆ ಮಾತ್ರ.',

      // DASHBOARD
      'dash.welcome':     'ಮರಳಿ ಸ್ವಾಗತ',
      'dash.member.since':'ಸದಸ್ಯರಾದ',
      'dash.orders':      'ನನ್ನ ಆರ್ಡರ್‌ಗಳು',
      'dash.rx':          'ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್‌ಗಳು',
      'dash.consults':    'ಸಮಾಲೋಚನೆಗಳು',
      'dash.profile':     'ಪ್ರೊಫೈಲ್',

      // MOBILE NAV
      'mob.home':      'ಮುಖಪುಟ',
      'mob.cats':      'ವಿಭಾಗಗಳು',
      'mob.consult':   'ಸಮಾಲೋಚನೆ',
      'mob.cart':      'ಕಾರ್ಟ್',
      'mob.profile':   'ಪ್ರೊಫೈಲ್',

      // DOCTORS
      'doc.consult.btn':  'ಸಮಾಲೋಚನೆ',
      'doc.viewall':      'ಎಲ್ಲ ವೈದ್ಯರನ್ನು ನೋಡಿ →',
      'doc.available':    '✅ ಈಗ ಲಭ್ಯ',
      'doc.rating':       'ರೇಟಿಂಗ್',

      // EXPLORE
      'explore.all.articles': 'ಎಲ್ಲ ಲೇಖನಗಳನ್ನು ಅನ್ವೇಷಿಸಿ →',

      // NEARBY
      'near.title':      'ಸಮೀಪದ ವೈದ್ಯರು ಮತ್ತು ಚಿಕಿತ್ಸಾಲಯಗಳು',

      // RAG HEALTH INTELLIGENCE ENGINE
      'rag.badge':            'ಕ್ಲಿನಿಕಲ್ ಎಂಜಿನ್',
      'rag.title':            'ಹೆಲ್ತ್ ಇಂಟೆಲಿಜೆನ್ಸ್ AI',
      'rag.subtitle':         'WHO, CDC, NHS, MoHFW ಮಾರ್ಗಸೂಚಿಗಳ ಆಧಾರದ ಮೇಲೆ ಪುರಾವೆ ಆಧಾರಿತ ಆರೋಗ್ಯ ಮಾಹಿತಿ.<br><strong>ಇದು ರೋಗನಿರ್ಣಯ ಸಾಧನವಲ್ಲ</strong> — ಕೇವಲ ಮಾಹಿತಿಗಾಗಿ.',
      'rag.chip.fever':       '🌡️ ತೀವ್ರ ಜ್ವರ',
      'rag.chip.stomach':     '🫃 ಹೊಟ್ಟೆ ನೋವು',
      'rag.chip.back':        '🦴 ಬೆನ್ನು ನೋವು',
      'rag.chip.headache':    '🧠 ತಲೆನೋವು',
      'rag.chip.throat':      '🗣️ ಗಂಟಲು ನೋವು',
      'rag.chip.dengue':      '🦟 ಡೆಂಗ್ಯೂ ಸ್ಕ್ಯಾನ್',
      'rag.input.ph':         'ಲಕ್ಷಣಗಳು, ಔಷಧಿಗಳು ಅಥವಾ ಮನೆಮದ್ದುಗಳ ಬಗ್ಗೆ ಕೇಳಿ...',
      'rag.btn.pdf':          'ದೃಢೀಕೃತ PDF ವರದಿ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ',
      'rag.btn.listen':       'ಕೇಳಿ',
      'rag.btn.stop':         'ನಿಲ್ಲಿಸಿ',
      'rag.btn.copy':         'ವೈದ್ಯರಿಗಾಗಿ ನಕಲಿಸಿ',
      'rag.btn.share':        'ಹಂಚಿಕೊಳ್ಳಿ',
      'rag.sec.direct':       'ನೇರ ಉತ್ತರ',
      'rag.sec.causes':       'ಸಾಮಾನ್ಯ ಸಾಧ್ಯತೆಗಳು',
      'rag.sec.warning':      'ಎಚ್ಚರಿಕೆ ಚಿಹ್ನೆಗಳು — ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ',
      'rag.sec.modern':       'ಆಧುನಿಕ ಔಷಧಿಗಳು (ಅಲೋಪತಿಕ್ / ಫಾರ್ಮಾಸ್ಯುಟಿಕಲ್)',
      'rag.sec.ayur':         'ಆಯುರ್ವೇದ ಚಿಕಿತ್ಸೆಗಳು (ಗಿಡಮೂಲಿಕೆ / ಸಾಂಪ್ರದಾಯಿಕ)',
      'rag.sec.home':         'ಮನೆಮದ್ದುಗಳು (ಮನೆಯ ಆರೈಕೆ)',
      'rag.sec.questions':    'ನಿಮ್ಮ ವೈದ್ಯರಿಗೆ ಕೇಳಬೇಕಾದ ಪ್ರಶ್ನೆಗಳು',
      'rag.notice':           '⚕️ ತುರ್ತು ಪರಿಸ್ಥಿತಿಗಾಗಿ 112 ಗೆ ಕರೆ ಮಾಡಿ. ಈ ಸಹಾಯಕ ಪರಿಶೀಲಿಸಿದ ವೈದ್ಯಕೀಯ ಮೂಲಗಳಿಂದ ಮಾತ್ರ ಉತ್ತರಿಸುತ್ತದೆ. ರೋಗನಿರ್ಣಯ ಮತ್ತು ಚಿಕಿತ್ಸೆಗಾಗಿ ಯಾವಾಗಲೂ ಪರವಾನಗಿ ಪಡೆದ ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ.'
    },
    // Placholders for newly added languages to fall back to English
    bn: {}, te: {}, ta: {}, mr: {},
    as: {}, gu: {}, ml: {}, or: {}, pa: {}, sa: {}, sd: {}, ur: {}, mai: {}, kok: {},
    brx: {}, sat: {}, ks: {}, ne: {}, doi: {}, es: {}, fr: {}, de: {}, it: {}, pt: {},
    ru: {}, zh: {}, ja: {}, ko: {}, ar: {}, tr: {}, vi: {}, th: {}, id: {}, ms: {},
    nl: {}, pl: {}, sv: {}, da: {}, no: {}, fi: {}, el: {}, he: {}, sw: {}, am: {},
    yo: {}, ig: {}, zu: {}, hu: {}, cs: {}, ro: {}, bg: {}, uk: {}, fa: {}, tl: {}
  };

  // ── CORE ENGINE ─────────────────────────────────────────────────
  const STORAGE_KEY = 'mv_lang';
  const SUPPORTED   = {
    en: 'English', hi: 'हिंदी', kn: 'ಕನ್ನಡ', bn: 'বাংলা', te: 'తెలుగు', ta: 'தமிழ்', mr: 'मराठी',
    as:'অসমীয়া', gu:'ગુજરાતી', ml:'മലയാളം', or:'ଓଡ଼ିଆ', pa:'ਪੰਜਾਬੀ', sa:'संस्कृतम्', sd:'سنڌي', ur:'اردو', mai:'मैथिली', kok:'कोंकणी',
    brx:'बड़ो', sat:'ᱥᱟᱱᱛᱟᱲᱤ', ks:'कॉशुर', ne:'नेपाली', doi:'डोगरी', es:'Español', fr:'Français', de:'Deutsch', it:'Italiano', pt:'Português',
    ru:'Русский', zh:'中文', ja:'日本語', ko:'한국어', ar:'العربية', tr:'Türkçe', vi:'Tiếng Việt', th:'ไทย', id:'Bahasa Indonesia',
    ms:'Bahasa Melayu', nl:'Nederlands', pl:'Polski', sv:'Svenska', da:'Dansk', no:'Norsk', fi:'Suomi', el:'Ελληνικά', he:'עברית',
    sw:'Kiswahili', am:'አማርኛ', yo:'Yorùbá', ig:'Igbo', zu:'isiZulu', hu:'Magyar', cs:'Čeština', ro:'Română', bg:'Български',
    uk:'Українська', fa:'فارسی', tl:'Tagalog'
  };
  const LANG_FLAGS  = {};

  let currentLang = localStorage.getItem(STORAGE_KEY) || detectBrowserLang();

  function detectBrowserLang() {
    const b = (navigator.language || 'en').toLowerCase();
    if (b.startsWith('kn')) return 'kn';
    if (b.startsWith('hi')) return 'hi';
    return 'en';
  }

  function t(key) {
    return (TRANSLATIONS[currentLang] && TRANSLATIONS[currentLang][key])
      || TRANSLATIONS.en[key]
      || key;
  }

  function triggerGoogleTranslate(langCode) {
    const gtMap = { 'zh': 'zh-CN', 'sv': 'sv', 'el': 'el', 'he': 'iw' }; // Handle some gt edge cases
    const targetLang = gtMap[langCode] || langCode;
    const select = document.querySelector('.goog-te-combo');
    if (select) {
        select.value = targetLang;
        select.dispatchEvent(new Event('change'));
    } else {
        setTimeout(() => triggerGoogleTranslate(langCode), 500);
    }
  }

  function setLang(lang) {
    if (!SUPPORTED[lang]) return;
    
    const isCurrentlyGTranslate = currentLang && Object.keys(TRANSLATIONS[currentLang] || {}).length === 0;
    const isNewNative = Object.keys(TRANSLATIONS[lang] || {}).length > 0;
    
    currentLang = lang;
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
    
    if (isNewNative) {
        // If switching from Google Translate back to native English/Hindi/Kannada, safely reload to restore original DOM fully
        if (isCurrentlyGTranslate && document.querySelector('.goog-te-combo')) {
            window.location.reload();
            return;
        }
        applyTranslations();
    } else {
        triggerGoogleTranslate(lang);
    }
    
    updateSwitcher();
    // Fire event so external scripts can react
    document.dispatchEvent(new CustomEvent('langChanged', { detail: { lang } }));
  }

  function applyTranslations() {
    // Text content
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const val = t(key);
      if (val.includes('<')) el.innerHTML = val;
      else el.textContent = val;
    });

    // Placeholder attributes
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
      el.placeholder = t(el.getAttribute('data-i18n-ph'));
    });

    // Title attribute (tooltips)
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      el.title = t(el.getAttribute('data-i18n-title'));
    });

    // aria-label attributes
    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
      el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria')));
    });
  }

  function updateSwitcher() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === currentLang);
    });
    const label = document.querySelector('.lang-current');
    if (label) label.textContent = SUPPORTED[currentLang];
  }

  // ── Inject Language Switcher into every navbar ─────────────────
  function injectSwitcher() {
    // Remove any existing switcher
    document.querySelectorAll('.lang-switcher').forEach(e => e.remove());

    const switcher = document.createElement('div');
    switcher.className = 'lang-switcher';
    switcher.setAttribute('role', 'group');
    switcher.setAttribute('aria-label', 'Language selector');
    switcher.innerHTML = `
      <div class="lang-globe" style="display:none;">🌐</div>
      ${Object.entries(SUPPORTED).map(([code, name]) => `
        <button class="lang-btn ${code === currentLang ? 'active' : ''}"
          data-lang="${code}"
          onclick="I18n.setLang('${code}')"
          title="${name}"
          aria-pressed="${code === currentLang}">
          ${code === 'en' ? 'EN' : code === 'hi' ? 'हि' : 'ಕ'}
        </button>
      `).join('')}
    `;

    // Insert before cart/last nav-links item
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
      navLinks.insertBefore(switcher, navLinks.firstChild);
    } else {
      // Fallback: append to navbar
      const nav = document.querySelector('.navbar, nav');
      if (nav) nav.appendChild(switcher);
    }
  }

  // ── Inject switcher CSS ────────────────────────────────────────
  function injectStyles() {
    if (document.getElementById('i18n-styles')) return;
    const style = document.createElement('style');
    style.id = 'i18n-styles';
    style.textContent = `
      .lang-switcher {
        display: flex;
        align-items: center;
        gap: 4px;
        background: rgba(255,255,255,0.08);
        border: 1.5px solid rgba(255,255,255,0.15);
        border-radius: 50px;
        padding: 4px 8px;
        backdrop-filter: blur(8px);
      }
      .lang-globe {
        font-size: 14px;
        margin-right: 2px;
        opacity: 0.7;
      }
      .lang-btn {
        background: none;
        border: none;
        color: var(--gray-400, #9ca3af);
        font-family: var(--font, 'Inter', sans-serif);
        font-size: 11px;
        font-weight: 700;
        padding: 4px 9px;
        border-radius: 50px;
        cursor: pointer;
        transition: all 0.2s;
        letter-spacing: 0.5px;
        white-space: nowrap;
      }
      .lang-btn:hover {
        background: rgba(255,255,255,0.12);
        color: white;
      }
      .lang-btn.active {
        background: linear-gradient(135deg, #2F80ED, #27AE60);
        color: white !important;
        box-shadow: 0 2px 8px rgba(47,128,237,0.4);
      }

      /* Hindi/Kannada font support */
      [lang="hi"], [lang="kn"] {
        font-family: 'Noto Sans', 'Noto Sans Devanagari', 'Noto Sans Kannada', var(--font, 'Inter'), sans-serif;
      }

      /* Toast for language switch */
      .lang-toast {
        position: fixed;
        bottom: 90px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(39,174,96,0.95);
        color: white;
        padding: 10px 20px;
        border-radius: 50px;
        font-size: 13px;
        font-weight: 600;
        z-index: 9999;
        pointer-events: none;
        animation: langToastAnim 2s ease forwards;
      }
      @keyframes langToastAnim {
        0%   { opacity: 0; transform: translateX(-50%) translateY(10px); }
        15%  { opacity: 1; transform: translateX(-50%) translateY(0); }
        70%  { opacity: 1; }
        100% { opacity: 0; transform: translateX(-50%) translateY(-5px); }
      }
    `;
    document.head.appendChild(style);
  }

  // ── Show language change toast ─────────────────────────────────
  function showLangToast(lang) {
    const msgs = { en: 'English', hi: 'हिंदी में बदला गया', kn: 'ಕನ್ನಡಕ್ಕೆ ಬದಲಾಯಿಸಲಾಗಿದೆ', bn: 'বাংলায় পরিবর্তিত', te: 'తెలుగుకి మార్చబడింది', ta: 'தமிழுக்கு மாற்றப்பட்டது', mr: 'मराठीत बदलले' };
    const toast = document.createElement('div');
    toast.className = 'lang-toast';
    toast.textContent = "Language updated to " + (SUPPORTED[lang] || lang);
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2100);
  }

  // ── Public API ─────────────────────────────────────────────────
  window.I18n = {
    t,
    setLang(lang) {
      setLang(lang);
      showLangToast(lang);
    },
    getLang: () => currentLang,
    getSupportedLangs: () => SUPPORTED,
  };

  // ── Auto-initialize ────────────────────────────────────────────
  function initGoogleTranslate() {
    if (document.getElementById('google-translate-script')) return;

    const gtDiv = document.createElement('div');
    gtDiv.id = 'google_translate_element';
    gtDiv.style.display = 'none';
    document.body.appendChild(gtDiv);

    window.googleTranslateElementInit = function() {
      new google.translate.TranslateElement({pageLanguage: 'en', autoDisplay: false}, 'google_translate_element');
      // If initialized on a language without native dictionary, start translating immediately
      if (currentLang && Object.keys(TRANSLATIONS[currentLang] || {}).length === 0) {
        setTimeout(() => triggerGoogleTranslate(currentLang), 1000);
      }
    };

    const script = document.createElement('script');
    script.id = 'google-translate-script';
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    document.head.appendChild(script);

    const style = document.createElement('style');
    style.textContent = `
      .goog-te-banner-frame.skiptranslate, .goog-te-gadget-icon { display: none !important; }
      body { top: 0px !important; }
      .goog-tooltip { display: none !important; box-shadow: none !important; }
      .goog-tooltip:hover { display: none !important; box-shadow: none !important; }
      #goog-gt-tt { display: none !important; box-shadow: none !important; }
    `;
    document.head.appendChild(style);
  }

  function init() {
    injectStyles();

    // Load Noto Sans for Indic scripts
    if (!document.querySelector('link[href*="Noto+Sans"]')) {
      const link = document.createElement('link');
      link.rel  = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700&family=Noto+Sans+Kannada:wght@400;600;700&display=swap';
      document.head.appendChild(link);
    }

    if (Object.keys(TRANSLATIONS[currentLang] || {}).length > 0) {
        applyTranslations();
    }
    
    initGoogleTranslate();
    document.documentElement.lang = currentLang;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
