// ═══════════════════════════════════
//  MedInVedic — Main Application JS
// ═══════════════════════════════════

// ── PRODUCT DATA ──────────────────
let MODERN_MEDICINES = [
  { id: 'm1', name: 'Paracetamol 500mg', category: 'Fever & Pain', price: 32, mrp: 45, tag: 'otc', rating: 4.5, reviews: 2341, benefits: 'Fast-acting fever & pain relief. Works within 30 minutes.', ingredients: 'Paracetamol IP 500mg, Starch, Magnesium Stearate', dosage: '1–2 tablets every 4–6 hours. Max 8 tablets/day.', desc: 'Effective for fever, headache & mild pain', keywords: ['fever', 'headache', 'pain', 'cold', 'dolo', 'crocin'] },
  { id: 'm2', name: 'Cetirizine 10mg', category: 'Cold & Allergy', price: 28, mrp: 40, tag: 'otc', rating: 4.3, reviews: 1876, benefits: 'Relieves allergic rhinitis, sneezing & runny nose.', ingredients: 'Cetirizine HCl IP 10mg, Lactose Monohydrate', dosage: '1 tablet once daily at bedtime.', desc: 'Fast relief from cold & allergy symptoms', keywords: ['cold', 'allergy', 'sneezing', 'runny nose'] },
  { id: 'm3', name: 'Metformin 500mg', category: 'Diabetes Care', price: 65, mrp: 90, tag: 'rx', rating: 4.6, reviews: 3210, benefits: 'Controls blood sugar levels. First-line diabetes treatment.', ingredients: 'Metformin HCl IP 500mg, Povidone, Magnesium Stearate', dosage: 'As prescribed by doctor with meals twice daily.', desc: 'Blood sugar control for Type 2 Diabetes', keywords: ['diabetes', 'blood sugar', 'glucose', 'glucophage'] },
  { id: 'm4', name: 'Atorvastatin 10mg', category: 'Heart Health', price: 85, mrp: 120, tag: 'rx', rating: 4.7, reviews: 2890, benefits: 'Lowers LDL cholesterol. Reduces heart disease risk.', ingredients: 'Atorvastatin Calcium IP 10mg, Microcrystalline Cellulose', dosage: '1 tablet daily in the evening.', desc: 'Cholesterol management for heart health', keywords: ['heart', 'cholesterol', 'cardiac'] },
  { id: 'm5', name: 'Azithromycin 500mg', category: 'Antibiotics', price: 110, mrp: 150, tag: 'rx', rating: 4.4, reviews: 1654, benefits: 'Broad-spectrum antibiotic for bacterial infections.', ingredients: 'Azithromycin IP 500mg, Lactose, Corn Starch', dosage: '1 tablet daily for 3–5 days as prescribed.', desc: 'Treats respiratory and throat infections', keywords: ['infection', 'antibiotic', 'throat', 'cough'] },
  { id: 'm6', name: 'Omeprazole 20mg', category: 'Digestion', price: 48, mrp: 68, tag: 'otc', rating: 4.5, reviews: 2100, benefits: 'Reduces stomach acid. Relieves heartburn & acidity.', ingredients: 'Omeprazole IP 20mg, Mannitol, Sodium Lauryl Sulphate', dosage: '1 capsule before meals once daily.', desc: 'Instant relief from acidity & heartburn', keywords: ['acidity', 'digestion', 'stomach', 'heartburn'] },
  { id: 'm7', name: 'D-Cold Total', category: 'Cold & Cough', price: 55, mrp: 75, tag: 'otc', rating: 4.2, reviews: 980, benefits: 'Multi-symptom cold relief. Reduces fever, congestion.', ingredients: 'Paracetamol 325mg, Phenylephrine 5mg, Cetirizine 5mg', dosage: '1 tablet every 6 hours, max 4 tablets/day.', desc: 'Complete relief from cold symptoms', keywords: ['cold', 'cough', 'fever', 'congestion'] },
  { id: 'm8', name: 'Pantoprazole 40mg', category: 'Digestion', price: 72, mrp: 95, tag: 'rx', rating: 4.6, reviews: 1432, benefits: 'Treats GERD, peptic ulcers. Protects stomach lining.', ingredients: 'Pantoprazole Sodium IP 40mg, Mannitol, Crospovidone', dosage: '1 tablet before breakfast daily as prescribed.', desc: 'Advanced acidity and ulcer treatment', keywords: ['acidity', 'ulcer', 'gerd', 'stomach'] },
  { id: 'm9', name: 'Biotin 10,000mcg', category: 'Hair & Skin', price: 449, mrp: 599, tag: 'otc', rating: 4.7, reviews: 2134, benefits: 'Strengthens hair roots, promotes nail growth & skin health.', ingredients: 'Biotin (Vitamin B7) 10,000mcg, Calcium 100mg', dosage: '1 tablet daily after food.', desc: 'High-potency vitamin for hair health', keywords: ['hair', 'hair fall', 'nails', 'skin', 'biotin'] },
  { id: 'm14', name: 'Zinco-Immune (Zinc + Vit C)', category: 'Immunity', price: 185, mrp: 220, tag: 'otc', rating: 4.8, reviews: 3100, keywords: ['immunity','multivitamin','zinc','vitamin c','resistance'], desc: 'Advanced immunity support with Zinc and Vitamin C.', benefits: 'Supports natural immune defense against viral infections.', ingredients: 'Zinc Sulfate, Vitamin C (Ascorbic Acid), Selenium', dosage: 'One tablet daily after breakfast.' },
  { id: 'm15', name: 'Telmisartan 40mg', category: 'Blood Pressure', price: 140, mrp: 165, tag: 'rx', rating: 4.7, reviews: 1800, keywords: ['bp','hypertension','blood pressure','heart'], desc: 'Standard hypertension management therapy.', benefits: 'Effectively lowers blood pressure and protects kidneys.', ingredients: 'Telmisartan 40mg', dosage: 'One tablet daily as prescribed by doctor.' }
];

let AYURVEDIC_PRODUCTS = [
  { id: 'a1', name: 'Ashwagandha KSM-66', category: 'Stress Relief', price: 349, mrp: 499, tag: 'ayur', rating: 4.8, reviews: 4321, benefits: 'Reduces cortisol levels, boosts stamina & mental clarity. Clinical-grade extract.', ingredients: 'KSM-66 Ashwagandha Root Extract 600mg, Piperine 5mg', dosage: '1 capsule twice daily with warm milk.', desc: 'Premium adaptogen for stress & energy', keywords: ['stress', 'anxiety', 'energy', 'sleep'] },
  { id: 'a2', name: 'Triphala Churna', category: 'Digestion', price: 180, mrp: 250, tag: 'ayur', rating: 4.6, reviews: 3876, benefits: 'Improves digestion, detoxifies body, enhances gut health naturally.', ingredients: 'Amalaki, Bibhitaki, Haritaki (equal parts)', dosage: '1 tsp with warm water at bedtime.', desc: 'Ancient digestive tonic & detox formula', keywords: ['digestion', 'constipation', 'gut', 'detox', 'acidity'] },
  { id: 'a3', name: 'Tulsi Giloy Drops', category: 'Immunity', price: 220, mrp: 320, tag: 'ayur', rating: 4.7, reviews: 5012, benefits: 'Strengthens immune system, fights infections, antioxidant rich.', ingredients: 'Tulsi (Holy Basil) extract, Giloy (Tinospora) extract', dosage: '10 drops in water twice daily before meals.', desc: 'Powerful immunity booster formula', keywords: ['immunity', 'cold', 'fever', 'infection'] },
  { id: 'a4', name: 'Kumkumadi Oil', category: 'Skincare', price: 595, mrp: 799, tag: 'ayur', rating: 4.9, reviews: 2987, benefits: 'Brightens skin, reduces pigmentation, anti-ageing properties.', ingredients: 'Saffron, Sandalwood, Manjistha, Licorice in Sesame base', dosage: 'Apply 2–3 drops at night, massage gently.', desc: 'Luxury skin brightening Ayurvedic oil', keywords: ['skin', 'glow', 'pigmentation', 'face'] },
  { id: 'a5', name: 'Brahmi Memory Boost', category: 'Cognitive Health', price: 299, mrp: 420, tag: 'ayur', rating: 4.5, reviews: 2134, benefits: 'Enhances memory, focus and cognitive function. Reduces brain fog.', ingredients: 'Brahmi extract 500mg, Shankhpushpi 200mg, Jatamansi 100mg', dosage: '1 capsule twice daily with warm water.', desc: 'Natural memory and focus enhancer', keywords: ['memory', 'focus', 'brain', 'stress'] },
  { id: 'a6', name: 'Neem Face Pack', category: 'Skin Care', price: 245, mrp: 350, tag: 'ayur', rating: 4.4, reviews: 1654, benefits: 'Deep cleanses pores, controls acne, purifies skin with neem.', ingredients: 'Neem leaf powder, Coconut shell charcoal, Turmeric extract', dosage: 'Apply paste twice a week, leave 15 mins.', desc: 'Anti-acne natural face treatment', keywords: ['acne', 'skin', 'face', 'pores'] },
  { id: 'a7', name: 'Chyawanprash Premium', category: 'Immunity', price: 420, mrp: 580, tag: 'ayur', rating: 4.8, reviews: 6123, benefits: '40+ herbs for complete immunity, digestion & respiratory health.', ingredients: 'Amla, Ashwagandha, Giloy, Pippali + 36 herbs in honey base', dosage: '1–2 tsp daily with warm milk morning.', desc: 'Classic immunity superfood with 40 herbs', keywords: ['immunity', 'cold', 'cough', 'winter', 'energy'] },
  { id: 'a8', name: 'Haridra (Turmeric)', category: 'Anti-inflammatory', price: 199, mrp: 280, tag: 'ayur', rating: 4.7, reviews: 3456, benefits: 'Powerful anti-inflammatory, antioxidant. Joint & gut health.', ingredients: 'Haridra (Turmeric) extract 95% curcumin, Piperine', dosage: '1 capsule twice daily with meals.', desc: 'High curcumin turmeric for inflammation', keywords: ['pain', 'inflammation', 'joints', 'digestion'] },
  { id: 'a9', name: 'Amalaki Powder', category: 'Immunity', price: 215, mrp: 295, tag: 'ayur', rating: 4.6, reviews: 1800, benefits: 'Richest source of Vitamin C. Improves digestion & skin glow.', ingredients: 'Pure Amalaki (Amla) fruit powder', dosage: '1 tsp twice daily with water or honey.', desc: 'Natural Vitamin C & Digestive support', keywords: ['acidity', 'immunity', 'skin', 'eyes', 'hair', 'hair fall', 'amla'] },
  { id: 'a10', name: 'Shilajit Gold Resin', category: 'Vitality', price: 850, mrp: 1200, tag: 'ayur', rating: 4.9, reviews: 2400, benefits: 'Pure Himalayan Shilajit for stamina, energy and mineral support.', ingredients: 'Purified Shilajit resin, Gold Vark', dosage: 'Pea-sized amount in warm milk daily.', desc: 'Premium Himalayan vital energy booster', keywords: ['vitality', 'energy', 'stamina', 'recovery', 'shilajit'] },
  { id: 'a11', name: 'Karela Jamun Juice', category: 'Diabetes Care', price: 280, mrp: 395, tag: 'ayur', rating: 4.5, reviews: 3100, benefits: 'Natural management of blood sugar levels. Detoxifies blood.', ingredients: 'Karela (Bitter Gourd), Jamun (Indian Blackberry) extract', dosage: '30ml twice daily on empty stomach.', desc: 'Blood sugar & metabolic health support', keywords: ['diabetes', 'sugar', 'blood', 'detox', 'karela'] },
  { id: 'a12', name: 'Bhringraj Hair Oil', category: 'Hair Care', price: 345, mrp: 450, tag: 'ayur', rating: 4.8, reviews: 3210, benefits: 'Ancient formula for hair fall control & baldness prevention.', ingredients: 'Bhringraj, Amla, Sesame oil, Coconut oil base', dosage: 'Warm oil and massage scalp 2-3 times a week.', desc: 'King of herbs oil for intense hair health', keywords: ['hair', 'hair fall', 'alopecia', 'growth', 'bhringraj'] },
  { id: 'a13', name: 'Giloy (Guduchi) Capsules', category: 'Immunity', price: 299, mrp: 350, tag: 'ayur', rating: 4.9, reviews: 4200, keywords: ['giloy','guduchi','immunity','fever','platelets'], desc: 'Potent Ayurvedic immune booster and blood purifier.', benefits: 'Supports healthy immune system and helps manage chronic fevers.', ingredients: 'Giloy (Tinospora Cordifolia) extract', dosage: 'Two capsules daily with warm water.' },
  { id: 'a14', name: 'Shilajit Pure Himalayan Resin', category: 'Vitality', price: 950, mrp: 1200, tag: 'ayur', rating: 4.8, reviews: 2100, keywords: ['shilajit','resin','energy','endurance','recovery'], desc: 'Mineral-rich Himalayan resin for energy and stamina.', benefits: 'Boosts natural energy levels and muscle recovery.', ingredients: 'Pure purified Himalayan Shilajit Resin', dosage: 'Pea-sized amount in warm milk/water.' },
  { id: 'a15', name: 'Amla C+ Vitamin C Powder', category: 'Immunity & Skin', price: 210, mrp: 250, tag: 'ayur', rating: 4.7, reviews: 1540, keywords: ['amla','vitamin c','skin','glow','antioxidant'], desc: 'Natural Vitamin C derived from dried Indian Gooseberries.', benefits: 'Rich antioxidant source for skin health and immunity.', ingredients: '100% Pure Amla (Emblica Officinalis) Powder', dosage: '1 tsp twice daily with water.' }
];

const HEALTH_GOALS = [
  { id: 'immunity', name: 'Immunity Boost', desc: 'Strengthen your defenses', keywords: ['immunity', 'cold', 'infection'] },
  { id: 'stress', name: 'Stress Relief', desc: 'Calm your mind & body', keywords: ['stress', 'anxiety', 'sleep'] },
  { id: 'digestion', name: 'Digestion Care', desc: 'Healthy gut, happy life', keywords: ['digestion', 'acidity', 'gut'] },
  { id: 'skin', name: 'Skin Care', desc: 'Glow naturally', keywords: ['skin', 'acne', 'face'] },
  { id: 'weight', name: 'Weight Management', desc: 'Healthy weight goals', keywords: ['weight', 'metabolism'] }
];

let DOCTORS = [
  { id: 'd1', name: 'Dr. Shailesh Phalle', spec: 'MD - Ayurvedic & Panchakarma', rating: 4.9, reviews: 3240, exp: '18 yrs', fee: 400, clinic: 'Ayusanjivani Clinic, Pune', lat: 18.5152, lng: 73.8577, image: 'doc1.png' },
  { id: 'd2', name: 'Dr. Manoj Deshpande', spec: 'BAMS - Ayurvedic Specialist', rating: 4.8, reviews: 2150, exp: '25 yrs', fee: 500, clinic: 'Kalpataru Ayurved, Pune', lat: 18.5262, lng: 73.8437, image: 'doc2.png' },
  { id: 'd3', name: 'Dr. Dhananjay Kelkar', spec: 'MS - Senior Surgeon & Consultant', rating: 4.9, reviews: 4500, exp: '30 yrs', fee: 800, clinic: 'Deenanath Mangeshkar Hospital', lat: 18.5132, lng: 73.8417, image: 'doc3.png' },
  { id: 'd4', name: 'Dr. Amit Kashid', spec: 'BAMS - Senior Ayurvedic Consultant', rating: 4.7, reviews: 1220, exp: '14 yrs', fee: 300, clinic: 'Ashtang Ayurved Hospital', lat: 18.5352, lng: 73.8777, image: 'doc4.png' },
  { id: 'd5', name: 'Dr. Narendra Shekade', spec: 'Ayurvedic Specialist', rating: 4.6, reviews: 920, exp: '15 yrs', fee: 250, clinic: 'Ayush Ayurved Clinic, Pune', lat: 18.5516, lng: 73.9351, image: 'doc5.png' },
  { id: 'd6', name: 'Dr. Sangeeta Rao', spec: 'Dermatologist', rating: 4.9, reviews: 1540, exp: '12 yrs', fee: 600, clinic: 'SkinHealth Clinic, Pune', lat: 18.5126, lng: 73.8735, image: 'doc6.png' },
  { id: 'd7', name: 'Dr. Vikram Malhotra', spec: 'Cardiologist', rating: 4.9, reviews: 2890, exp: '22 yrs', fee: 900, clinic: 'Cardro Hospital, Pune', lat: 18.5204, lng: 73.8567, image: 'doc7.png' },
  { id: 'd8', name: 'Dr. Anjali Gupta', spec: 'Ayurvedic Vaidya', rating: 4.8, reviews: 2100, exp: '20 yrs', fee: 450, clinic: 'Shanti Ayurveda Center, Pune', lat: 18.5089, lng: 73.8340, image: 'doc8.png' },
  { id: 'd9', name: 'Dr. Rajesh Khanna', spec: 'Pediatrician', rating: 4.7, reviews: 1870, exp: '15 yrs', fee: 500, clinic: 'KidsCare Clinic, Pune', lat: 18.5500, lng: 73.9300, image: 'doc9.png' }
];

const ARTICLES = [
  { id: 'ar1', tag: 'Ayurveda', title: 'The Power of Ashwagandha: Science Meets Tradition', preview: 'Discover how modern research validates 3000-year-old Ayurvedic wisdom about stress relief.' },
  { id: 'ar2', tag: 'Medicine Safety', title: '10 Things to Know Before Taking Antibiotics', preview: 'Essential guidelines for safe antibiotic use and preventing antibiotic resistance.' },
  { id: 'ar3', tag: 'Lifestyle', title: 'Dinacharya: Daily Routine for Optimal Health', preview: "Ayurveda's morning routine practices for energy, immunity and mental clarity." },
  { id: 'ar4', tag: 'Nutrition', title: 'Turmeric & Black Pepper: A Powerful Combination', preview: 'Why combining curcumin with piperine increases absorption by 2000%.' },
  { id: 'ar5', tag: 'Home Remedies', title: 'Ginger Honey Tea for Cold & Immunity', preview: 'Prepare this simple 3-ingredient Ayurvedic remedy for instant cold relief.' },
  { id: 'ar6', tag: 'Research', title: 'Gut Health: The Ayurvedic vs Modern Approach', preview: 'Comparing Triphala and probiotic supplements for digestive wellness.' }
];

const HOME_REMEDIES = [
  { id: 'hr1', name: 'Golden Turmeric Milk', category: 'Immunity', desc: 'Ancient "Haldi Doodh" for recovery & strength', ingredients: 'Warm milk, 1/2 tsp Turmeric, pinch of Black pepper', benefits: 'Powerful anti-inflammatory and immunity booster', emoji: '🥛' },
  { id: 'hr2', name: 'Ginger Honey Tea', category: 'Cold & Cough', desc: 'Instant relief for sore throat and congestion', ingredients: 'Fresh ginger, 1 tbsp Honey, Lemon juice', benefits: 'Antibacterial and soothes the respiratory tract', emoji: '☕' },
  { id: 'hr3', name: 'Holy Basil (Tulsi) Water', category: 'Detox', desc: 'Daily tonic for respiratory health', ingredients: '5-7 Tulsi leaves, 1 cup Water (boiled)', benefits: 'Relieves stress and improves lung function', emoji: '🌿' },
  { id: 'hr4', name: 'Aloe Vera Juice', category: 'Skin & Digestion', desc: 'Pure plant-based healing for gut & glow', ingredients: 'Aloe Vera gel (fresh), Water or Orange juice', benefits: 'Cooling effect, aids digestion and skin health', emoji: '🌵' },
  { id: 'hr5', name: 'Fenugreek (Methi) Water', category: 'Blood Sugar', desc: 'Natural metabolic & sugar control', ingredients: '1 tsp Methi seeds soaked overnight in water', benefits: 'Improves insulin sensitivity and slows sugar absorption', emoji: '🫘' },
  { id: 'hr6', name: 'Triphala Night Tea', category: 'Detox & Digestion', desc: 'Complete overnight system cleanse', ingredients: '1/2 tsp Triphala powder in warm water', benefits: 'Gentle laxative, detoxifies liver and improves vision', emoji: '🍵' },
  { id: 'hr7', name: 'Peppermint & Mint Tea', category: 'Digestion', desc: 'Soothes bloating and acid reflux', ingredients: 'Fresh Mint leaves, hot water, pinch of Black salt', benefits: 'Reduces bloating, gas and improves mental focus', emoji: '🍃' },
  { id: 'hr8', name: 'Cinnamon Honey Paste', category: 'Metabolism', desc: 'Ancient weight & heart tonic', ingredients: '1/2 tsp Cinnamon powder, 1 tsp Raw Honey', benefits: 'Boosts metabolism and reduces bad cholesterol', emoji: '🍯' }
];

// ── CART STATE ──────────────────────
let cart = JSON.parse(localStorage.getItem('miv_cart') || '[]');
let currentUser = JSON.parse(localStorage.getItem('miv_user') || 'null');

function saveCart() { localStorage.setItem('miv_cart', JSON.stringify(cart)); }

function getCartCount() { return cart.reduce((sum, i) => sum + i.qty, 0); }

function getCartTotal() { return cart.reduce((sum, i) => sum + i.price * i.qty, 0); }

// ── MOBILE NATIVE SYNC ──
function triggerHaptic(type = 'light') {
  if ('vibrate' in navigator) {
    const patterns = { light: 10, medium: 25, heavy: 50 };
    navigator.vibrate(patterns[type] || patterns.light);
  }
}

function addToCart(product) {
  triggerHaptic('medium');
  const existing = cart.find(i => i.id === product.id);
  if (existing) { existing.qty++; }
  else { cart.push({ ...product, qty: 1 }); }
  saveCart();
  updateCartBadge();
  showToast(`${product.name} added to cart`);
}

function removeFromCart(id) {
  triggerHaptic('light');
  cart = cart.filter(i => i.id !== id);
  saveCart();
  updateCartBadge();
  renderCartItems();
}

function updateQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) { removeFromCart(id); return; }
  saveCart();
  updateCartBadge();
  renderCartItems();
}

function updateCartBadge() {
  const count = getCartCount();
  document.querySelectorAll('.cart-badge').forEach(b => {
    b.textContent = count;
    b.style.display = count > 0 ? 'flex' : 'none';
  });
}

function renderCartItems() {
  const container = document.getElementById('cartItems');
  const totalEl = document.getElementById('cartTotal');
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `<div class="empty-cart"><p data-i18n="cart.empty">${window.I18n ? window.I18n.t('cart.empty') : 'Your cart is empty'}</p></div>`;
    if (totalEl) totalEl.textContent = '₹0';
    return;
  }

  container.innerHTML = cart.map(item => {
    const imgSrc = getProductImage(item.name, item.tag);

    return `
    <div class="cart-item">
      <div class="cart-item-img">
        <img src="${imgSrc}" style="width:100%; height:100%; object-fit:contain; border-radius:4px;" alt="${item.name}">
      </div>
      <div class="iv-style-23">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">₹${item.price}</div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="updateQty('${item.id}', -1)">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="updateQty('${item.id}', 1)">+</button>
          <button class="iv-style-140" onclick="removeFromCart('${item.id}')" title="Remove" style="margin-left: 10px; border: none; background: none; cursor: pointer; font-size: 16px;">🗑️</button>
        </div>
      </div>
    </div>
  `}).join('');

  if (totalEl) totalEl.textContent = `₹${getCartTotal()}`;
}

// ── HELPERS ──────────────────────────
function getProductImage(name, tag) {
  const n = name.toLowerCase();
  const prefix = window.location.pathname.includes('pages/') ? '../' : '';
  let img = '';

  if (n.includes('paracetamol') || n.includes('dolo')) img = 'med_dolo.png';
  else if (n.includes('cetirizine')) img = 'med_cetirizine.png';
  else if (n.includes('metformin')) img = 'med_metformin.png';
  else if (n.includes('atorvastatin')) img = 'med_atorvastatin.png';
  else if (n.includes('azithromycin')) img = 'med_azithromycin.png';
  else if (n.includes('omeprazole')) img = 'med_omeprazole.png';
  else if (n.includes('pantoprazole')) img = 'med_pantoprazole.png';
  else if (n.includes('telmisartan')) img = 'med_telmisartan.png';
  else if (n.includes('biotin')) img = 'med_biotin.png';
  else if (n.includes('zinco') || n.includes('zinc')) img = 'med_zinc.png';
  else if (n.includes('chyawanprash')) img = 'med_chyawanprash.png';
  else if (n.includes('ashwagandha')) img = 'med_ashwagandha.png';
  else if (n.includes('kumkumadi')) img = 'med_kumkumadi.png';
  else if (n.includes('neem')) img = 'med_neem.png';
  else if (n.includes('brahmi')) img = 'med_brahmi.png';
  else if (n.includes('amalaki') || n.includes('amla')) img = 'med_amalaki.png';
  else if (n.includes('shilajit')) img = 'med_shilajit.png';
  else if (n.includes('karela')) img = 'med_karela.png';
  else if (n.includes('tulsi') || n.includes('giloy')) img = 'med_tulsi.png';
  else if (n.includes('triphala')) img = 'med_triphala.png';
  else if (n.includes('syrup') || n.includes('total')) img = 'med_syrup.png';
  else if (tag === 'ayur') img = 'medicine_ayur.png';
  else img = 'medicine_modern.png';

  // Specific check for existing /images/products or /images/assets
  const base = img.startsWith('med_') ? 'images/products/' : 'images/assets/';
  return prefix + base + img;
}

// ── TOAST ────────────────────────────
function showToast(msg, duration = 3000) {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateY(16px)'; setTimeout(() => toast.remove(), 300); }, duration);
}

// ── PRODUCT CARD RENDER ──────────────
function renderProductCard(product, variant = 'blue') {
  const { id, name, desc, price, mrp, emoji, tag, rating, reviews } = product;
  const tagLabel = tag === 'rx' ? 'Prescription' : tag === 'ayur' ? 'Ayurvedic' : 'OTC';
  const imgSrc = getProductImage(name, tag);

  return `
    <div class="product-card ${variant === 'blue' ? 'modern' : 'ayurvedic'}" onclick="openProductModal('${id}')">
      <div class="product-img" style="background:white; padding:10px;">
        <img src="${imgSrc}" style="width:100%; height:100%; object-fit:contain;" alt="${name}">
      </div>
      <div class="product-info">
        <span class="product-badge ${tag}">${tagLabel}</span>
        <div class="product-name" data-full-name="${name}">${name}</div>
        <div class="product-desc">${desc}</div>
        <div class="product-benefits-mini" onclick="event.stopPropagation(); openProductModal('${id}')">Benefits ❯</div>
        <div class="product-rating">RATING: ${rating}</div>
        <div class="product-footer">
          <div class="product-price">₹${price} <span>₹${mrp}</span></div>
        </div>
        <button class="add-to-cart-btn ${variant}" onclick="event.stopPropagation(); addToCart({id:'${id}',name:'${name}',price:${price},tag:'${tag}'})" data-i18n="product.addcart">
          ${window.I18n ? window.I18n.t('product.addcart') : 'Add to Cart'}
        </button>
      </div>
    </div>
  `;
}

function renderHomeRemedyCard(remedy) {
  return `
    <div class="remedy-card" onclick="openRemedyModal('${remedy.id}')">
      <div class="remedy-icon" style="background: var(--primary-light); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px;">${remedy.emoji}</div>
      <div class="remedy-content">
        <div class="remedy-tag">${remedy.category}</div>
        <div class="remedy-name">${remedy.name}</div>
        <div class="remedy-desc">${remedy.desc}</div>
      </div>
    </div>
  `;
}

function openRemedyModal(id) {
  const remedy = HOME_REMEDIES.find(r => r.id === id);
  if (!remedy) return;

  const modal = document.getElementById('productModal');
  modal.querySelector('.modal-box').innerHTML = `
    <div class="product-modal-grid">
      <div class="pmod-gallery">
        <div class="pmod-remedy-header" style="background: var(--primary-light); padding: 10px; border-radius: 12px; height: 80px; display: flex; align-items: center; justify-content: center; font-size: 40px;">${remedy.emoji}</div>
      </div>
      <div class="pmod-info">
        <div class="pmod-name">${remedy.name}</div>
        <div class="pmod-category">Home Remedy — ${remedy.category}</div>
        <div class="pmod-section"><h4>Benefits</h4><p>${remedy.benefits}</p></div>
        <div class="pmod-section"><h4>How to Prepare</h4><p>${remedy.ingredients}</p></div>
        <div class="pmod-section"><p><em>PRO TIP: Home remedies work best when used alongside healthy lifestyle practices.</em></p></div>
      </div>
      <div class="pmod-action">
        <button class="btn-primary" onclick="closeProductModal()">Got it, Thanks!</button>
        <div class="delivery-info">Non-commercial advice<br>Make it at home</div>
      </div>
    </div>
  `;
  modal.classList.add('open');
}

// ── PRODUCT MODAL ────────────────────
let currentProductId = null;

function openProductModal(id) {
  const product = [...MODERN_MEDICINES, ...AYURVEDIC_PRODUCTS].find(p => p.id === id);
  if (!product) return;
  currentProductId = id;

  const modal = document.getElementById('productModal');
  const isAyur = product.tag === 'ayur';
  const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);

  const imgSrc = getProductImage(product.name, product.tag);

  modal.querySelector('.modal-box').innerHTML = `
    <div class="product-modal-grid">
      <div class="pmod-gallery">
        ${discount > 0 ? `<span class="pmod-badge">${discount}% OFF</span>` : ''}
        <img src="${imgSrc}" style="max-width:100%; max-height:280px; object-fit:contain;" alt="${product.name}">
      </div>
      <div class="pmod-info">
        <div class="pmod-name">${product.name}</div>
        <div class="pmod-category">${product.category}</div>
        <div class="pmod-price">₹${product.price} <span>₹${product.mrp}</span></div>
        <div class="pmod-section"><h4>Benefits</h4><p>${product.benefits}</p></div>
        <div class="pmod-section"><h4>Ingredients / Composition</h4><p>${product.ingredients}</p></div>
        <div class="pmod-section"><h4>Dosage Instructions</h4><p>${product.dosage}</p></div>
        ${product.tag === 'rx' ? '<div class="pmod-section"><p class="iv-style-142">⚠️ <strong>Prescription Required</strong> — Please upload prescription before checkout.</p></div>' : ''}
      </div>
      <div class="pmod-action">
        <button class="btn-primary" onclick="addToCart({id:'${product.id}',name:'${product.name}',price:${product.price},tag:'${product.tag}'}); showToast('✅ Added to cart!')" data-i18n="product.addcart">${window.I18n ? window.I18n.t('product.addcart') : 'Add to Cart'}</button>
        <button class="btn-outline" onclick="openCart()" data-i18n="cart.title">${window.I18n ? window.I18n.t('cart.title') : 'View Cart →'}</button>
        <div class="delivery-info">🚚 <strong>Free delivery</strong> on orders ₹499+<br>🕒 Estimated: 24–48 hours</div>
        <div class="iv-style-143" data-i18n="product.instock">${window.I18n ? window.I18n.t('product.instock') : '🏪 In stock — Ready to ship'}</div>
        ${isAyur ? '' : `<button class="iv-style-144" onclick="searchQuery('${product.keywords[0]}'); closeProductModal();">🌿 See Ayurvedic Alternatives</button>`}
      </div>
    </div>
  `;
  modal.classList.add('open');
}

function closeProductModal() {
  document.getElementById('productModal')?.classList.remove('open');
}

// ── SEARCH SYSTEM ────────────────────
function searchQuery(query) {
  if (!query?.trim()) return;
  const q = query.toLowerCase().trim();

  const modernResults = MODERN_MEDICINES.filter(p =>
    p.keywords.some(k => k.includes(q) || q.includes(k)) ||
    p.name.toLowerCase().includes(q) ||
    p.category.toLowerCase().includes(q) ||
    p.desc.toLowerCase().includes(q)
  );

  const ayurResults = AYURVEDIC_PRODUCTS.filter(p =>
    p.keywords.some(k => k.includes(q) || q.includes(k)) ||
    p.name.toLowerCase().includes(q) ||
    p.category.toLowerCase().includes(q) ||
    p.desc.toLowerCase().includes(q)
  );

  const overlay = document.getElementById('searchOverlay');
  const modernCol = document.getElementById('searchModern');
  const ayurCol = document.getElementById('searchAyur');
  const searchTitle = document.getElementById('searchQueryTitle');

  if (searchTitle) searchTitle.textContent = `Results for "${query}"`;

  if (modernCol) {
    modernCol.innerHTML = modernResults.length
      ? modernResults.map(p => renderSearchResult(p, 'blue')).join('')
      : '<p class="iv-style-145">No modern medicine results</p>';
  }

  if (ayurCol) {
    ayurCol.innerHTML = ayurResults.length
      ? ayurResults.map(p => renderSearchResult(p, 'green')).join('')
      : '<p class="iv-style-145">No Ayurvedic results</p>';
  }

  if (overlay) overlay.style.display = 'block';
  // Clear the input after search to avoid concatenation
  const searchInput = document.getElementById('heroSearchInput');
  if (searchInput) searchInput.value = '';
}

function renderSearchResult(product, variant) {
  const imgSrc = getProductImage(product.name, product.tag);
  return `
    <div class="iv-style-241" onclick="closeSearch(); openProductModal('${product.id}')" onmouseover="this.style.background='var(--gray-50)'" onmouseout="this.style.background='transparent'">
      <div class="iv-style-146">
        <img src="${imgSrc}" style="width:100%; height:100%; object-fit:contain; border-radius:6px;" alt="${product.name}">
      </div>
      <div class="iv-style-147">
        <div class="iv-style-148">${product.name}</div>
        <div class="iv-style-149">${product.desc}</div>
        <div class="product-price" style="font-weight:700;font-size:14px;color:${variant === 'blue' ? 'var(--blue)' : 'var(--primary)'}">₹${product.price}</div>
      </div>
      <button class="product-price iv-style-140" onclick="event.stopPropagation();addToCart({id:'${product.id}',name:'${product.name}',price:${product.price},tag:'${product.tag}'})" style="background:${variant === 'blue' ? 'var(--blue-light)' : 'var(--primary-light)'};color:${variant === 'blue' ? 'var(--blue)' : 'var(--primary)'};border:none;padding:6px 12px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap;align-self:center" data-i18n="product.addcart">${window.I18n ? window.I18n.t('product.addcart') : 'Add'}</button>
    </div>
  `;
}

function closeSearch() {
  const overlay = document.getElementById('searchOverlay');
  if (overlay) overlay.style.display = 'none';
}

// ── CART PANEL ──────────────────────
function openCart() {
  renderCartItems();
  document.getElementById('cartPanel')?.classList.add('open');
}
function closeCartPanel() {
  document.getElementById('cartPanel')?.classList.remove('open');
}


/* AI Chatbot Logic Removed for Minimalism */


// ── PRESCRIPTION UPLOAD ─────────────
function openPrescriptionModal() {
  ensureSharedComponents();
  document.getElementById('prescriptionModal')?.classList.add('open');
}
function closePrescriptionModal() {
  document.getElementById('prescriptionModal')?.classList.remove('open');
}

// ── RAZORPAY & UPI CHECKOUT ──────────

function injectPaymentModal() {
  if (document.getElementById('paymentModal')) return;
  const modalHTML = `
    <div class="modal-overlay" id="paymentModal">
      <div class="modal-box pay-modal">
        <div class="pay-header">
          <h3 data-i18n="pay.title">Confirm & Pay</h3>
          <p data-i18n="pay.subtitle">Complete your payment using UPI below</p>
          <button class="pay-close" onclick="closePaymentModal()">✕</button>
        </div>
        <div class="pay-body" style="padding: 24px; display: flex; flex-direction: column; gap: 24px; background: rgba(15, 23, 42, 0.4);">
          <div class="qr-container" style="background: white; padding: 20px; border-radius: 20px; text-align: center;">
            <img id="payQRImg" style="width: 220px; height: 220px; margin: 0 auto;" src="" alt="UPI QR">
            <div id="payDirectBtnContainer" style="margin-top: 16px; display: none;">
               <a id="payDirectBtn" href="#" style="background: var(--blue); color: white; text-decoration: none; padding: 12px 24px; border-radius: 12px; font-weight: 700; width: 100%; display: block;">Open in UPI App</a>
            </div>
            <div id="payUPIID" class="upi-id" style="margin-top: 12px; font-family: monospace; font-weight: 700; color: var(--blue); background: var(--blue-light); padding: 6px 14px; border-radius: 8px;">badigermahesh371@oksbi</div>
          </div>
          <div class="pay-instr" style="color: var(--gray-300); font-size: 14px; line-height: 1.6;">
            <p>1. <strong>Scan the QR</strong><span id="payDirectInstrText"> or Click "Open in UPI App"</span>.</p>
            <p>2. <strong>Pay total amount</strong>: <span id="payAmountDisplay" style="font-weight:800; color: var(--blue); font-size: 18px;">₹0</span></p>
            <p>3. <strong>Confirm</strong> after payment by clicking below.</p>
          </div>
          <button class="pay-whatsapp-btn" onclick="confirmPaymentWhatsApp()" style="background: #25D366; color: white; border: none; padding: 16px; border-radius: 14px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; box-shadow: 0 8px 16px rgba(37, 211, 102, 0.2);">
            <span>📲 Confirm Order on WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  document.getElementById('paymentModal').addEventListener('click', function (e) {
    if (e.target === this) closePaymentModal();
  });
}

async function initiateCheckout() {
  if (cart.length === 0) { showToast('Your cart is empty!'); return; }
  const total = getCartTotal();
  
  // Save specific order details for the payment page
  localStorage.setItem('miv_pending_order_items', JSON.stringify(cart));
  
  const prefix = window.location.pathname.includes('pages/') ? '' : 'pages/';
  window.location.href = `${prefix}payment.html?amount=${total}&purpose=Product%20Order`;
}

function closePaymentModal() {
  document.getElementById('paymentModal')?.classList.remove('open');
}

function ensureSharedComponents() {
  // Guard: Do not inject legacy components on standalone or glassmorphic pages with custom navigation
  if (document.querySelector('.nav') || document.querySelector('.navbar') || document.querySelector('.admin-nav') || document.getElementById('tabModern')) {
    return;
  }

  // 1. Toast Container
  if (!document.getElementById('toastContainer')) {
    document.body.insertAdjacentHTML('beforeend', '<div class="toast-container" id="toastContainer"></div>');
  }

  // 2. Sidebar & Overlay (if not present)
  if (!document.getElementById('sidebar')) {
    const prefix = window.location.pathname.includes('pages/') ? '' : 'pages/';
    const homePrefix = window.location.pathname.includes('pages/') ? '../' : '';
    const sidebarHTML = `
      <div class="sidebar-overlay" id="sidebarOverlay" style="display:none;" onclick="window.toggleSidebar()"></div>
      <div class="sidebar" id="sidebar" style="display:none;">
        <div class="sidebar-header">
          <div class="nav-logo">
            <div class="nav-logo-icon">⚕️</div>
            <span class="nav-logo-text">MedInVedic</span>
          </div>
          <button class="sidebar-close" onclick="window.toggleSidebar()">✕</button>
        </div>
        <div class="sidebar-body">
          <a href="${homePrefix}index.html" class="sidebar-link">🏠 Home</a>

          <a href="${prefix}categories.html" class="sidebar-link">📦 Categories</a>
          <a href="${prefix}consult.html" class="sidebar-link">👨‍⚕️ Consult</a>
          <a href="${prefix}healing-hub.html" class="sidebar-link">✨ Healing Hub</a>
          <div style="margin-top:20px; padding:0 20px;"><hr style="opacity:0.1;"></div>
          <a href="${prefix}login.html" class="sidebar-link" id="sideNavAccount">👤 Sign In</a>
          <a href="#" class="sidebar-link" onclick="openCart(); window.toggleSidebar(); return false;">🛒 My Cart</a>
        </div>
        <div class="sidebar-footer">
          <button class="logout-btn" onclick="API.auth.logout()">Logout</button>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('afterbegin', sidebarHTML);
  }

  // 3. Cart Panel
  if (!document.getElementById('cartPanel')) {
    const cartHTML = `
      <div class="cart-panel" id="cartPanel" style="display:none;">
        <div class="cart-header"><h3>Cart</h3><button class="cart-close" onclick="closeCartPanel()">✕</button></div>
        <div class="cart-items" id="cartItems"><div class="empty-cart"><p>Empty</p></div></div>
        <div class="cart-footer">
          <div class="cart-total"><span>Total</span><span id="cartTotal">₹0</span></div>
          <button class="checkout-btn" onclick="initiateCheckout()">Checkout</button>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', cartHTML);
  }

  // 4. Product Modal
  if (!document.getElementById('productModal')) {
    document.body.insertAdjacentHTML('beforeend', '<div class="modal-overlay" id="productModal" style="display:none;"><div class="modal-box"></div></div>');
  }

  // 5. Prescription Modal
  if (!document.getElementById('prescriptionModal')) {
    const rxHTML = `
      <div class="modal-overlay" id="prescriptionModal" style="display:none;">
        <div class="modal-box iv-style-16" style="background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.1); border-radius: 24px; padding: 40px; width: 100%; max-width: 500px; position: relative;">
          <button class="iv-style-17" onclick="closePrescriptionModal()" style="position: absolute; top: 20px; right: 20px; background: none; border: none; color: white; cursor: pointer; font-size: 20px;">✕</button>
          <h2 class="iv-style-71" style="font-size: 24px; color: white; margin-bottom: 24px;">Upload Prescription</h2>
          <div class="upload-zone" id="uploadZone" onclick="document.getElementById('rxFileInput').click()" style="border: 2px dashed rgba(255,255,255,0.2); border-radius: 16px; padding: 40px; text-align: center; cursor: pointer; transition: 0.3s; background: rgba(255,255,255,0.05);">
            <div class="upload-text" style="color: white; font-weight: 700; margin-bottom: 8px;">Drag & drop or click</div>
            <div class="upload-subtext" style="color: var(--gray-400); font-size: 13px;">JPG, PNG, PDF • Max 10 MB</div>
          </div>
          <input type="file" id="rxFileInput" accept="image/*,.pdf" style="display: none;" onchange="handlePrescriptionUpload(this.files[0])">
          <div id="uploadStatus" style="margin-top: 24px;"></div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', rxHTML);
    
    // Re-attach event listeners for the new upload zone
    const uploadZone = document.getElementById('uploadZone');
    if (uploadZone) {
      uploadZone.addEventListener('dragover', e => { e.preventDefault(); uploadZone.classList.add('drag-over'); });
      uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('drag-over'));
      uploadZone.addEventListener('drop', e => {
        e.preventDefault();
        uploadZone.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        if (files.length) handlePrescriptionUpload(files[0]);
      });
    }
  }

  // 6. Search Overlay
  if (!document.getElementById('searchOverlay')) {
    const searchHTML = `
      <div id="searchOverlay" style="display:none;">
        <div class="search-modal">
          <button class="search-close" onclick="closeSearch()">✕</button>
          <h2 class="iv-style-6" id="searchQueryTitle">Search Results</h2>
          <div class="search-results-grid">
            <div><div class="search-col-header modern">Modern Medicine</div><div id="searchModern"></div></div>
            <div><div class="search-col-header ayurvedic">Ayurvedic Remedies</div><div id="searchAyur"></div></div>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', searchHTML);
    
    document.getElementById('searchOverlay').addEventListener('click', function (e) {
      if (!e.target.closest('.search-modal')) closeSearch();
    });
  }


  // 7. Chatbot Removed for minimalism

}

function confirmPaymentWhatsApp() {
  const total = getCartTotal();
  const user = window.API.auth.getUser();
  const itemsText = cart.map(i => `• ${i.name} (x${i.qty}) — ₹${i.price * i.qty}`).join('%0A');

  const message = `Hello MedInVedic, I would like to place an order:%0A%0A` +
    `👤 *Customer*: ${user?.name || 'Guest'}%0A` +
    `📧 *Email*: ${user?.email || 'N/A'}%0A` +
    `📦 *Items*:%0A${itemsText}%0A%0A` +
    `💰 *Total Amount Paid*: ₹${total}%0A%0A` +
    `📝 *Action*: I have completed the payment via UPI. Please confirm my order!`;

  const whatsappURL = `https://wa.me/919766441863?text=${message}`;
  window.open(whatsappURL, '_blank');

  // Optional: clear cart after redirecting to whatsapp if user confirms?
  // For now, let's keep it until they come back.
  showToast('📲 Redirecting to WhatsApp for confirmation...');
}

async function saveOrderToFirestore(total, paymentId = 'demo') {
  try {
    // Only runs if Firebase is available on the page
    if (typeof db === 'undefined') return;
    const userId = (typeof auth !== 'undefined' && auth.currentUser)
      ? auth.currentUser.uid
      : 'guest_' + Date.now();
    await db.collection('Orders').add({
      userId,
      items: cart.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty })),
      totalAmount: total,
      paymentId,
      status: 'Processing',
      createdAt: new Date().toISOString()
    });
  } catch (e) {
    console.warn('Firestore order save skipped:', e.message);
  }
}

// ── INIT ────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  ensureSharedComponents();
  updateCartBadge();

  // Render Home Remedies if container exists
  const remedyGrid = document.getElementById('homeRemediesGrid');
  if (remedyGrid) {
    remedyGrid.innerHTML = HOME_REMEDIES.map(r => renderHomeRemedyCard(r)).join('');
  }

  // Nav search
  document.querySelectorAll('[data-search-input]').forEach(input => {
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') searchQuery(e.target.value);
    });
  });

  document.querySelectorAll('[data-search-btn]').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.closest('.hero-search')?.querySelector('input') || document.querySelector('[data-search-input]');
      if (input) searchQuery(input.value);
    });
  });

  // Close modal on overlay click
  document.getElementById('productModal')?.addEventListener('click', function (e) {
    if (e.target === this) closeProductModal();
  });

  document.getElementById('searchOverlay')?.addEventListener('click', function (e) {
    if (e.target === this || e.target.classList.contains('search-modal') === false) {
      // only close if clicking backdrop
      if (!e.target.closest('.search-modal')) closeSearch();
    }
  });

  document.getElementById('prescriptionModal')?.addEventListener('click', function (e) {
    if (e.target === this) closePrescriptionModal();
  });


  // Chatbot logic removed


  // Prescription drag & drop
  const uploadZone = document.getElementById('uploadZone');
  if (uploadZone) {
    uploadZone.addEventListener('dragover', e => { e.preventDefault(); uploadZone.classList.add('drag-over'); });
    uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('drag-over'));
    uploadZone.addEventListener('drop', e => {
      e.preventDefault();
      uploadZone.classList.remove('drag-over');
      const files = e.dataTransfer.files;
      if (files.length) handlePrescriptionUpload(files[0]);
    });
  }

  // Animate on scroll
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.fade-scroll').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
  });

  // Re-render things on language change if I18n is loaded directly before app.js
  document.addEventListener('langChanged', (e) => {
    // Dynamic update without full page reload
    initLocation();
  });

  initLocation();
});

// ── LOCATION LOGIC ──────────────────
function initLocation() {
  const user = window.API?.auth?.getUser?.();
  const accNav = document.querySelectorAll('.nav-account');

  if (user && accNav) {
    accNav.forEach(el => {
      // el.innerHTML = `<span class="iv-style-1" style="font-size: 14px; font-weight: 600;">Hello, ${user.name.split(' ')[0]}</span>`;
      el.onclick = () => window.location.href = (window.location.pathname.includes('pages/')) ? 'dashboard.html' : 'pages/dashboard.html';
    });
    
    const sideAcc = document.getElementById('sideNavAccount');
    if (sideAcc) {
      // sideAcc.innerHTML = `👤 Hello, ${user.name.split(' ')[0]}`;
      sideAcc.href = (window.location.pathname.includes('pages/')) ? 'dashboard.html' : 'pages/dashboard.html';
    }
  }

  const loc = localStorage.getItem('miv_location') || null;
  const navText = document.getElementById('navLocationText');
  if (navText) {
    if (loc) {
      navText.textContent = loc;
      navText.removeAttribute('data-i18n');
    } else {
      if (window.I18n) {
        navText.textContent = window.I18n.t('nav.location.def');
      }
    }
  }

  // Inject Location Modal if not present
  if (!document.getElementById('locationModal')) {
    const modalHTML = `
      <div class="modal-overlay" id="locationModal">
        <div class="modal-box iv-style-150">
          <button class="iv-style-151" onclick="closeLocationModal()">✕</button>
          <h3 class="iv-style-152" data-i18n="loc.modal.title">${window.I18n ? window.I18n.t('loc.modal.title') : 'Choose your location'}</h3>
          <p class="iv-style-153" data-i18n="loc.modal.subtitle">${window.I18n ? window.I18n.t('loc.modal.subtitle') : 'Delivery options and delivery speeds may vary for different locations.'}</p>
          <div class="iv-style-242">
            <input class="iv-style-154" type="text" id="pincodeInput" placeholder="Enter pincode" data-i18n-ph="loc.enter_pincode">
            <button class="iv-style-155" onclick="applyLocation()" data-i18n="loc.btn.apply">${window.I18n ? window.I18n.t('loc.btn.apply') : 'Apply'}</button>
          </div>
          <div class="iv-style-156" data-i18n="loc.or">${window.I18n ? window.I18n.t('loc.or') : '— or —'}</div>
          <button class="iv-style-157" onclick="applyGPSLocation()" data-i18n="loc.btn.gps">${window.I18n ? window.I18n.t('loc.btn.gps') : 'Use current location'}</button>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    document.getElementById('locationModal').addEventListener('click', function (e) {
      if (e.target === this) closeLocationModal();
    });
  }
}

function openLocationModal() {
  document.getElementById('locationModal')?.classList.add('open');
}

function closeLocationModal() {
  document.getElementById('locationModal')?.classList.remove('open');
}

function applyLocation() {
  const pin = document.getElementById('pincodeInput').value;
  if (!pin) return;
  localStorage.setItem('miv_location', pin);
  closeLocationModal();
  initLocation();
  showToast('Location updated');
}

function applyGPSLocation() {
  localStorage.setItem('miv_location', 'Detected Location');
  closeLocationModal();
  initLocation();
  showToast('GPS Location applied');
}


function handlePrescriptionUpload(file) {
  const statusEl = document.getElementById('uploadStatus');
  if (!statusEl) return;
  statusEl.innerHTML = `
    <div><strong>${file.name}</strong> uploaded (${(file.size / 1024).toFixed(0)} KB)</div>
    <div class="rx-status pending iv-style-158">Pending Verification</div>
    <p class="iv-style-159">A pharmacist will verify your prescription within 30 minutes.</p>
  `;
}

window.addToCart = addToCart;
window.openProductModal = openProductModal;
window.closeProductModal = closeProductModal;
window.openCart = openCart;
window.closeCartPanel = closeCartPanel;
window.updateQty = updateQty;
window.removeFromCart = removeFromCart;
window.searchQuery = searchQuery;
window.closeSearch = closeSearch;
window.initiateCheckout = initiateCheckout;
window.openPrescriptionModal = openPrescriptionModal;
window.closePrescriptionModal = closePrescriptionModal;
window.handlePrescriptionUpload = handlePrescriptionUpload;
window.openLocationModal = openLocationModal;
window.closeLocationModal = closeLocationModal;
window.applyLocation = applyLocation;
window.applyGPSLocation = applyGPSLocation;
window.toggleSidebar = function() {
  const s = document.getElementById('sidebar');
  const o = document.getElementById('sidebarOverlay');
  if(s) s.classList.toggle('open');
  if(o) o.classList.toggle('open');
};

window.toggleLangMenu = function(e) {
  if(e) e.stopPropagation();
  document.getElementById('langDropdown')?.classList.toggle('open');
};

window.selectLanguage = function(lang, name) {
  if(window.I18n) window.I18n.setLang(lang);
  const lbl = document.getElementById('currentLangLabel');
  if(lbl) lbl.textContent = name;
  document.getElementById('langDropdown')?.classList.remove('open');
};

window.openRemedyModal = openRemedyModal;
window.closePaymentModal = closePaymentModal;
window.confirmPaymentWhatsApp = confirmPaymentWhatsApp;
window.MODERN_MEDICINES = MODERN_MEDICINES;
window.AYURVEDIC_PRODUCTS = AYURVEDIC_PRODUCTS;
window.HOME_REMEDIES = HOME_REMEDIES;
window.DOCTORS = DOCTORS;
window.ARTICLES = ARTICLES;
window.HEALTH_GOALS = HEALTH_GOALS;
window.renderProductCard = renderProductCard;

function initAuth() {
  const user = (typeof Token !== 'undefined') ? Token.user() : null;
  const sideNavAccount = document.getElementById('sideNavAccount');
  if (user && user.name && sideNavAccount) {
    sideNavAccount.innerHTML = '👤 ' + user.name;
    const isPage = window.location.pathname.includes('/pages/');
    sideNavAccount.href = isPage ? 'dashboard.html' : 'pages/dashboard.html';
  }
}
async function syncDatabaseData() {
  try {
    const apiBase = (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost')
      ? `http://${window.location.hostname}:3001/api`
      : '/api';
    
    // Fetch Products
    const res = await fetch(apiBase + '/products');
    if (res.ok) {
      const dbProducts = await res.json();
      if (dbProducts && dbProducts.length > 0) {
        MODERN_MEDICINES.length = 0;
        AYURVEDIC_PRODUCTS.length = 0;
        
        dbProducts.forEach(p => {
          const formatted = {
            id: String(p.id),
            name: p.name,
            category: p.category,
            price: p.price,
            mrp: Math.round(p.price * 1.25),
            tag: p.tag,
            rating: p.rating || 4.5,
            reviews: p.reviews || 10,
            desc: p.description || '',
            benefits: p.description || '',
            ingredients: 'Pure standard ingredients',
            dosage: 'As directed by physician.',
            keywords: p.keywords ? p.keywords.split(',') : [p.name.toLowerCase()]
          };
          if (p.tag === 'ayur') {
            AYURVEDIC_PRODUCTS.push(formatted);
          } else {
            MODERN_MEDICINES.push(formatted);
          }
        });
        console.log("🚀 Sync: Products successfully synced from SQLite backend database!");
      }
    }

    // Fetch Doctors
    const resD = await fetch(apiBase + '/doctors');
    if (resD.ok) {
      const dbDoctors = await resD.json();
      if (dbDoctors && dbDoctors.length > 0) {
        DOCTORS.length = 0;
        dbDoctors.forEach(d => {
          DOCTORS.push({
            id: String(d.id),
            name: d.name,
            spec: d.spec,
            rating: d.rating || 4.5,
            reviews: d.reviews || 20,
            exp: d.exp || '5 years',
            fee: d.fee || 300,
            clinic: d.address || 'MedInVedic Clinic',
            lat: d.lat || 18.52,
            lng: d.lng || 73.85,
            image: d.image || 'doc_avatar.png'
          });
        });
        console.log("🚀 Sync: Doctors successfully synced from SQLite backend database!");
      }
    }

    // Refresh UI elements on the current page
    refreshActivePageUI();
  } catch (err) {
    console.warn("⚠️ Sync: SQLite backend offline. Using local static fallback data.", err);
  }
}

function refreshActivePageUI() {
  // Homepage lists
  const modernList = document.getElementById('modernProductList');
  const ayurList = document.getElementById('ayurProductList');
  const trendingGrid = document.getElementById('trendingGrid');
  if (modernList) modernList.innerHTML = MODERN_MEDICINES.map(p => renderProductCard(p, 'blue')).join('');
  if (ayurList) ayurList.innerHTML = AYURVEDIC_PRODUCTS.map(p => renderProductCard(p, 'green')).join('');
  if (trendingGrid && MODERN_MEDICINES.length > 0 && AYURVEDIC_PRODUCTS.length > 0) {
    const trending = [MODERN_MEDICINES[0], AYURVEDIC_PRODUCTS[0], MODERN_MEDICINES[Math.min(6, MODERN_MEDICINES.length-1)], AYURVEDIC_PRODUCTS[Math.min(2, AYURVEDIC_PRODUCTS.length-1)]];
    trendingGrid.innerHTML = trending.map((p, i) => renderProductCard(p, i % 2 === 0 ? 'blue' : 'green')).join('');
  }

  // Home Page Doctors Teaser
  const docTeaser = document.getElementById('doctorTeaser');
  if (docTeaser && DOCTORS.length > 0) {
    docTeaser.innerHTML = DOCTORS.slice(0, 6).map(d => `
      <div class="doctor-card" style="height: auto; padding: 24px; text-align: center;">
        <div class="doctor-avatar" style="width: 80px; height: 80px; margin: 0 auto 16px;">
          <img src="${d.image ? 'images/doctors/' + d.image : 'images/assets/doc_avatar.png'}" alt="${d.name}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;" onerror="this.src='images/assets/doc_avatar.png'" />
        </div>
        <div class="doctor-name" style="font-size: 18px; font-weight: 800; color: white; margin-bottom: 4px;">${d.name}</div>
        <div class="doctor-spec" style="color: var(--primary); font-weight: 700; font-size: 11px; text-transform: uppercase; margin-bottom: 12px;">${d.spec}</div>
        <div style="font-size: 12px; color: var(--gray-400); margin-bottom: 16px;">
          ${d.exp} Experience • ${d.rating} ★
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <button class="add-to-cart-btn" style="background: var(--blue-dark); border: 1px solid var(--primary); padding: 12px; font-size: 14px; font-weight: 700; border-radius: 50px; color: white; margin: 0; display: flex; align-items: center; justify-content: center; gap: 8px;" onclick="event.stopPropagation(); window.openBookingForm('${d.name}', '${d.spec}', Math.round(${d.fee} * 0.7))">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-11.7 8.38 8.38 0 0 1 3.8.9L21 3.5Z"></path></svg>
            Book Appointment (₹${Math.round(d.fee * 0.7)})
          </button>
        </div>
      </div>
    `).join('');
  }

  // Categories Page
  const modernCatProducts = document.getElementById('modernCatProducts');
  const ayurCatProducts = document.getElementById('ayurCatProducts');
  if (modernCatProducts && typeof filterCatModern === 'function') {
    filterCatModern('all', document.querySelector('#modernCatFilters .cat-tab') || { classList: { add: () => {} } });
  }
  if (ayurCatProducts && typeof filterCatAyur === 'function') {
    filterCatAyur('all', document.querySelector('#ayurCatFilters .cat-tab') || { classList: { add: () => {} } });
  }

  // Consult Page
  const doctorsList = document.getElementById('doctorsList');
  if (doctorsList && typeof renderDoctors === 'function') {
    if (typeof GLOBAL_EXPERTS !== 'undefined') {
      const LOCAL_INDIA_DOCTORS = DOCTORS.map(d => {
        let state = 'Maharashtra';
        if (d.city === 'Delhi') state = 'Delhi';
        return { ...d, country: 'India', state: d.state || state, city: d.city || 'Pune' };
      });
      window.ALL_DOCTORS = [...LOCAL_INDIA_DOCTORS, ...GLOBAL_EXPERTS];
      renderDoctors(window.ALL_DOCTORS);
      if (typeof initNearbyMap === 'function') initNearbyMap();
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  syncDatabaseData();
  document.addEventListener('click', () => document.getElementById('langDropdown')?.classList.remove('open'));
});
