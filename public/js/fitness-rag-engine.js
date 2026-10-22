/**
 * fitness-rag-engine.js — MedInVedic RAG Fitness, Activity & Dinacharya Chronobiology Engine
 * ══════════════════════════════════════════════════════════════════════════════════════════
 * Features:
 * 1. Evidence-grounded exercise prescriptions from WHO 2020 Guidelines & ACSM (FITT-VP principle).
 * 2. Classical Ayurvedic Chronobiology & Dinacharya time-blocks (Charaka Samhita Sutrasthana 7).
 * 3. Ministry of AYUSH Common Yoga Protocols (CYP) with Dosha-tailored asanas and pranayama.
 * 4. Safety contraindications screening (Hypertension, lower back pain, knee/joint strain).
 * 5. Interactive circadian timeline and workout plan generator.
 */

(function (root, factory) {
  const result = factory();
  if (typeof module === 'object' && module.exports) { module.exports = result; }
  if (typeof global !== 'undefined') { global.FITNESS_RAG = result; }
  if (typeof window !== 'undefined') { window.FITNESS_RAG = result; }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ─────────────────────────────────────────────────────────────
     1. EVIDENCE GUIDELINES & CITATION METADATA
  ───────────────────────────────────────────────────────────── */
  const CITATIONS = {
    who_pa: {
      title: 'WHO Guidelines on Physical Activity and Sedentary Behaviour (2020)',
      org: 'World Health Organization',
      year: '2020',
      tier: 'Tier 1: Global Health Authority',
      coreAdvice: 'Adults should undertake 150–300 minutes of moderate-intensity or 75–150 minutes of vigorous aerobic activity weekly, plus muscle strengthening 2+ days/week.'
    },
    acsm: {
      title: 'ACSM Guidelines for Exercise Testing and Prescription (11th Ed.)',
      org: 'American College of Sports Medicine (ACSM)',
      year: '2022',
      tier: 'Tier 1: Sports Medicine Standard',
      coreAdvice: 'Comprehensive exercise must incorporate cardiorespiratory, resistance, flexibility, and neuromotor exercise (balance/agility) for functional longevity.'
    },
    ayush_yoga: {
      title: 'Common Yoga Protocol (CYP) for Disease Prevention and Health Promotion',
      org: 'Ministry of AYUSH, Government of India',
      year: '2023',
      tier: 'Tier 1: Official National AYUSH Guideline',
      coreAdvice: 'Yoga must integrate Sukshma Vyayama (micro-movements), Sthula Vyayama, steady asanas with breathing awareness, and pranayama to balance Prana Vayu.'
    },
    charaka_dinacharya: {
      title: 'Charaka Samhita — Sutrasthana Chapter 7 (Annapanavidhi & Dinacharya)',
      org: 'Classical Ayurvedic Text / CCRAS',
      year: 'Classical (Peer Reviewed by AYUSH CCRAS)',
      tier: 'Tier 1: Classical Medical Foundation',
      coreAdvice: 'Vyayama (exercise) should be performed to half-capacity (Ardha Shakti — marked by sweat on forehead/nose). Exercise beyond capacity vitiates Vata and depletes Ojas.'
    }
  };

  /* ─────────────────────────────────────────────────────────────
     2. DOSHA-SPECIFIC WORKOUT & YOGA PROTOCOLS
  ───────────────────────────────────────────────────────────── */
  const DOSHA_PROTOCOLS = {
    Vata: {
      dosha: 'Vata',
      qualities: 'Cold, light, dry, mobile, irregular',
      exercisePrinciple: 'Grounding, rhythmic, slow-to-moderate, calming, warm environment',
      cardioRecommendation: 'Brisk low-impact walking, gentle cycling, indoor rowing, swimming in warm water (20–30 mins)',
      strengthStyle: 'Controlled tempo, moderate resistance, focus on core and pelvic stability, avoiding burnout',
      yogaFocus: 'Grounding, hip-openers, spinal elongation, slow transitions',
      recommendedAsanas: [
        { name: 'Tadasana (Mountain Pose)', benefit: 'Spinal alignment and stability' },
        { name: 'Vrikshasana (Tree Pose)', benefit: 'Neuromotor balance and mental focus' },
        { name: 'Paschimottanasana (Seated Forward Bend)', benefit: 'Calms Vata in lower abdomen and nervous system' },
        { name: 'Setu Bandhasana (Bridge Pose)', benefit: 'Strengthens pelvic floor and lumbar spine' },
        { name: 'Balasana (Child\'s Pose)', benefit: 'Grounds scattered nervous energy' },
        { name: 'Shavasana (Corpse Pose)', benefit: 'Deep nervous system reset (minimum 10 mins)' }
      ],
      pranayama: 'Nadi Shodhana (Alternate Nostril Breathing) — 10 rounds, slow and unhurried; Bhramari (Bee Breath)',
      idealTime: 'Morning Kapha window (07:00 – 09:00 AM) or early evening (05:00 – 06:00 PM)',
      abhyangaOil: 'Warm Sesame Oil or Mahanarayan Taila before bath',
      warning: 'Avoid excessive high-impact jumping, prolonged marathon cardio, or exercising on empty stomach without hydration.'
    },

    Pitta: {
      dosha: 'Pitta',
      qualities: 'Hot, sharp, intense, oily, penetrating',
      exercisePrinciple: 'Cooling, moderate intensity, playful, non-competitive, open-air',
      cardioRecommendation: 'Outdoor trail running in cool hours, swimming, cycling, brisk evening walking (30–45 mins)',
      strengthStyle: 'High-rep, moderate weight, fluid movement, avoid competitive strain and overheating',
      yogaFocus: 'Heart-opening, cooling forward bends, moderate twists that release liver/gallbladder heat',
      recommendedAsanas: [
        { name: 'Chandra Namaskar (Moon Salutation)', benefit: 'Cooling lunar sequence calming solar Pitta' },
        { name: 'Matsyasana (Fish Pose)', benefit: 'Opens thoracic cage and thyroid region' },
        { name: 'Ardha Matsyendrasana (Spinal Twist)', benefit: 'Detoxifies liver and stimulates Ranjaka Pitta balance' },
        { name: 'Bhujangasana (Cobra Pose)', benefit: 'Expands chest without building excessive heat' },
        { name: 'Ustrasana (Camel Pose - gentle)', benefit: 'Opens solar plexus and releases frustration' },
        { name: 'Shavasana with cooling visualization', benefit: 'Relaxes vascular tension and lowers pulse' }
      ],
      pranayama: 'Sheetali / Sheetkari (Cooling Breath) — 10 rounds; Chandra Bhedana (Left Nostril Breathing)',
      idealTime: 'Cool early morning hours (05:30 – 07:00 AM) or sunset (06:00 – 07:00 PM)',
      abhyangaOil: 'Cooling Coconut Oil, Chandanadi Taila, or Sunflower Oil',
      warning: 'Avoid exercising in mid-day sun (11 AM – 3 PM) or hot yoga rooms; avoid hyper-competitive ego strain.'
    },

    Kapha: {
      dosha: 'Kapha',
      qualities: 'Heavy, slow, cool, dense, static',
      exercisePrinciple: 'Invigorating, dynamic, metabolic stimulating, sweat-inducing, progressive',
      cardioRecommendation: 'HIIT intervals, brisk uphill power walking, jumping rope, cycling with resistance (35–50 mins)',
      strengthStyle: 'Progressive overload, circuit training, compound movements (squats, pushups, lunges) with minimal rest',
      yogaFocus: 'Dynamic flow, backbends, core engagement, stimulating metabolic fire (Agni)',
      recommendedAsanas: [
        { name: 'Surya Namaskar (Sun Salutation)', benefit: 'Dynamic 8–12 rounds to ignite digestive fire and burn Ama' },
        { name: 'Virabhadrasana I & II (Warrior Poses)', benefit: 'Builds stamina and dispels mental lethargy' },
        { name: 'Utkatasana (Chair Pose)', benefit: 'Activates large thigh muscles and boosts caloric burn' },
        { name: 'Dhanurasana (Bow Pose)', benefit: 'Massages abdominal organs and releases chest congestion' },
        { name: 'Navasana (Boat Pose)', benefit: 'Strengthens core and stimulates Samana Vayu' },
        { name: 'Urdhva Mukha Svanasana (Upward Dog)', benefit: 'Expands lung capacity against Kapha mucus' }
      ],
      pranayama: 'Bhastrika (Bellows Breath) — 3 rounds of 20 pumps; Kapalbhati (Skull Shining) — 3 rounds',
      idealTime: 'Brahma Muhurta / Morning Kapha time (06:00 – 08:30 AM) to break through morning inertia',
      abhyangaOil: 'Mustard Oil (Sarshapa) or dry powder massage (Udvartana) using chickpea and Triphala',
      warning: 'Do not skip exercise; Kapha must break a mild sweat daily to prevent lymphatic stagnation and weight gain.'
    }
  };

  /* ─────────────────────────────────────────────────────────────
     3. 24-HOUR CIRCADIAN DINACHARYA BUILDER
  ───────────────────────────────────────────────────────────── */

  function formatTime(hour, minute) {
    const h = hour % 24;
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    const displayM = minute < 10 ? '0' + minute : minute;
    return `${displayH}:${displayM} ${period}`;
  }

  function parseTime(timeStr) {
    if (!timeStr) return { hour: 7, minute: 30 };
    const parts = timeStr.split(':');
    return {
      hour: parseInt(parts[0], 10) || 7,
      minute: parseInt(parts[1], 10) || 30
    };
  }

  /**
   * Generates a chronobiological 24-hour Dinacharya synchronized with Dosha time-blocks.
   */
  function buildDinacharyaTimeline(dosha, currentWakeStr, goal) {
    const userWake = parseTime(currentWakeStr);
    
    // Ideal Ayurvedic Wakeup: Brahma Muhurta (approx 96 mins before sunrise, typically 5:00-5:30 AM)
    let idealWakeH = 5, idealWakeM = 30;
    if (dosha === 'Kapha') { idealWakeH = 5; idealWakeM = 0; }
    if (dosha === 'Vata') { idealWakeH = 6; idealWakeM = 0; }
    if (dosha === 'Pitta') { idealWakeH = 5; idealWakeM = 30; }

    // Stepping target: don't shock user if they wake up at 8:30 AM
    let targetWakeH = idealWakeH;
    let targetWakeM = idealWakeM;
    if (userWake.hour > 7) {
      targetWakeH = Math.max(idealWakeH, userWake.hour - 1); // Gradual 1-hour earlier step
    }

    // Target Sleep is 7.5 to 8 hours before wake
    let targetSleepH = (targetWakeH - 8 + 24) % 24;
    let targetSleepM = targetWakeM;

    const timeline = [];

    // 1. Dawn / Wakeup
    timeline.push({
      time: formatTime(targetWakeH, targetWakeM),
      doshaPeriod: 'Vata Period (02:00 – 06:00 AM)',
      title: '🌅 Brahma Muhurta Awakening & Ushapan',
      desc: 'Wake in the tranquil Vata window. Drink 1–2 glasses of warm water (Ushapan) to stimulate peristalsis and colon evacuation.',
      category: 'Circadian Hygiene',
      source: 'Charaka Samhita Sutrasthana 7 / WHO Circadian Review'
    });

    // 2. Oral & Sensory Cleansing
    const cleanH = targetWakeH;
    const cleanM = (targetWakeM + 25) % 60;
    timeline.push({
      time: formatTime(cleanH, cleanM),
      doshaPeriod: 'Kapha Period (06:00 – 10:00 AM)',
      title: '🌿 Danta Dhavana, Tongue Scraping & Gandusha',
      desc: 'Brush teeth with herbal neem/clove paste, scrape tongue to remove Ama, and perform oil pulling (Gandusha with warm sesame/coconut oil for 3–5 mins).',
      category: 'Oral Health',
      source: 'Ministry of AYUSH Common Protocols'
    });

    // 3. Morning Movement / Vyayama
    const exH = targetWakeH + 1;
    const exM = targetWakeM;
    timeline.push({
      time: formatTime(exH, exM),
      doshaPeriod: 'Morning Kapha Window — Optimal Exercise Time',
      title: '🏃 Morning Vyayama & Dosha-Aligned Yoga',
      desc: `Engage in 30–45 mins of structured activity. ${DOSHA_PROTOCOLS[dosha].exercisePrinciple}. Exercise to Ardha Shakti (half-capacity).`,
      category: 'Physical Activity',
      source: 'WHO 2020 Physical Activity Guidelines & ACSM'
    });

    // 4. Bath & Nourishing Breakfast
    const bfastH = targetWakeH + 2;
    timeline.push({
      time: formatTime(bfastH, targetWakeM),
      doshaPeriod: 'Kapha Window',
      title: '🥣 Snana (Warm Bath) & Sattvic Breakfast',
      desc: 'Warm soothing bath. Nourishing breakfast matching your constitution: warm cooked oatmeal/poha for Vata, fresh fruit & grains for Pitta, light steamed idli/sprouts for Kapha.',
      category: 'Nourishment',
      source: 'ACSM Nutritional Guidelines / AYUSH'
    });

    // 5. Deep Work & Midday Solar Peak (Agni Maximum)
    timeline.push({
      time: '12:30 PM',
      doshaPeriod: 'Pitta Period (10:00 AM – 02:00 PM)',
      title: '☀️ Madhyanha Bhojana — Principal Meal of the Day',
      desc: 'Solar energy and metabolic digestive fire (Jatharagni) are at their absolute peak. Consume your heaviest and most complete meal now. Walk 100 gentle steps (Shatapadi) after eating.',
      category: 'Nutrition & Digestion',
      source: 'Charaka Samhita Sutrasthana / Circadian Chronobiology'
    });

    // 6. Afternoon Focus & Micro-Break
    timeline.push({
      time: '04:00 PM',
      doshaPeriod: 'Vata Period (02:00 PM – 06:00 PM)',
      title: '🚶 Afternoon Movement Break & Hydration',
      desc: 'Combat prolonged sitting. 10-minute posture reset, neck-shoulder rolls, hydration with warm herbal infusion (tulsi/cumin-coriander).',
      category: 'Ergonomics',
      source: 'WHO Sedentary Behavior Guidelines'
    });

    // 7. Evening Sunset & Light Dinner
    timeline.push({
      time: '07:30 PM',
      doshaPeriod: 'Evening Kapha Window (06:00 PM – 10:00 PM)',
      title: '🍲 Sandhya Bhojana — Light Early Dinner',
      desc: 'Light, warm, easily digestible dinner at least 2.5 to 3 hours before sleep. Avoid heavy curd, ice creams, or deep-fried foods at night.',
      category: 'Digestion',
      source: 'Ayurvedic Ahara Guidelines'
    });

    // 8. Digital Sunset & Wind-Down
    timeline.push({
      time: '09:15 PM',
      doshaPeriod: 'Pre-Sleep Preparation',
      title: '📵 Digital Sunset & Pada Abhyanga',
      desc: 'Silence blue-light screens. Massage warm sesame or brahmi oil on the soles of feet (Pada Abhyanga) to induce deep somnolence and calm Vata.',
      category: 'Sleep Hygiene',
      source: 'ACSM & Sleep Foundation Chronobiology'
    });

    // 9. Deep Sleep & Cellular Repair
    timeline.push({
      time: formatTime(targetSleepH, targetSleepM),
      doshaPeriod: 'Pitta Night Window (10:00 PM – 02:00 AM)',
      title: '🌙 Nidra — Restorative Circadian Sleep',
      desc: 'Sleep before 10:30 PM allows liver glycogen replenishment, cellular autophagy, and hormonal recalibration during the internal Pitta cycle.',
      category: 'Recovery',
      source: 'National Sleep Foundation / Charaka Samhita'
    });

    return {
      targetWake: formatTime(targetWakeH, targetWakeM),
      targetSleep: formatTime(targetSleepH, targetSleepM),
      timeline: timeline
    };
  }

  /* ─────────────────────────────────────────────────────────────
     4. RAG ROUTINE GENERATOR
  ───────────────────────────────────────────────────────────── */

  function generateRoutine(params) {
    const dosha = params.dosha || 'Vata';
    const currentWake = params.currentWake || '07:30';
    const goal = params.goal || 'discipline';
    const level = params.level || 'intermediate';
    const limitations = params.limitations || [];

    const protocol = DOSHA_PROTOCOLS[dosha] || DOSHA_PROTOCOLS.Vata;
    const dinacharya = buildDinacharyaTimeline(dosha, currentWake, goal);

    // Calculate Weekly Activity Targets based on WHO 2020 Guidelines
    let weeklyMins = 150;
    let strengthDays = 2;
    if (level === 'beginner') { weeklyMins = 150; strengthDays = 2; }
    else if (level === 'intermediate') { weeklyMins = 220; strengthDays = 3; }
    else if (level === 'advanced') { weeklyMins = 300; strengthDays = 4; }

    // Health Limitation Modifications
    const modifications = [];
    if (limitations.includes('knee_joint')) {
      modifications.push('• Knee / Joint Strain: Substitute running/jumping with flat ground walking, recumbent cycling, or swimming. In yoga, keep knees soft; avoid deep unsupported squats (Malasana) and Padmasana.');
    }
    if (limitations.includes('back_pain')) {
      modifications.push('• Lower Back Stiffness: Keep spine neutral during all lifts; avoid weighted deadlifts and aggressive forward fold twists. Focus on Cat-Cow (Marjaryasana), Bhujangasana, and bird-dog core stabilization.');
    }
    if (limitations.includes('hypertension')) {
      modifications.push('• Elevated Blood Pressure: Avoid inverted postures (Shirshasana, Sarvangasana) and strenuous isometric breath holding (Valsalva). Maintain continuous slow rhythmic breathing.');
    }
    if (limitations.includes('diabetes')) {
      modifications.push('• Glycemic Regulation: Perform a 15-minute brisk walk within 30 minutes following your main lunch. Carry fast-acting glucose during prolonged endurance sessions.');
    }

    // Daily Workout Structure (WHO & ACSM Aligned)
    const workoutPlan = {
      warmup: [
        '5 Mins Sukshma Vyayama (Neck rotations, shoulder rolls, wrist circling, ankle pumps)',
        'Joint mobilization breathing (Griva & Skandha Sanchalana)'
      ],
      aerobicCardio: {
        type: protocol.cardioRecommendation,
        duration: level === 'beginner' ? '20 Mins' : level === 'intermediate' ? '30 Mins' : '40 Mins',
        guideline: 'WHO Target: Aerobic endurance at Zone 2 conversational heart rate'
      },
      strengthConditioning: {
        type: protocol.strengthStyle,
        frequency: `${strengthDays} days / week`,
        guideline: 'ACSM Muscular Strength & Functional Core Integrity'
      },
      yogaAsanas: protocol.recommendedAsanas,
      pranayama: protocol.pranayama,
      cooldown: [
        '5 Mins Shavasana with deep abdominal diaphragmatic breathing',
        'Mindfulness gratitude reset'
      ]
    };

    return {
      dosha: dosha,
      level: level,
      goal: goal,
      dinacharya: dinacharya,
      workoutPlan: workoutPlan,
      protocol: protocol,
      modifications: modifications,
      weeklyTargets: {
        aerobicMinutes: weeklyMins,
        strengthDays: strengthDays,
        dailyStepsTarget: level === 'beginner' ? '6,500 – 8,000' : '8,000 – 10,000'
      },
      citations: [
        CITATIONS.who_pa,
        CITATIONS.acsm,
        CITATIONS.ayush_yoga,
        CITATIONS.charaka_dinacharya
      ]
    };
  }

  /* ─────────────────────────────────────────────────────────────
     5. EXPORT PUBLIC INTERFACE
  ───────────────────────────────────────────────────────────── */
  return {
    generateRoutine: generateRoutine,
    getDoshaProtocols: () => DOSHA_PROTOCOLS,
    getCitations: () => CITATIONS
  };
}));
