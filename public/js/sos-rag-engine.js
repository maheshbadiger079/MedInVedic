/**
 * sos-rag-engine.js — RAG-Based SOS Emergency Health Assistant
 * ═══════════════════════════════════════════════════════════════
 * Evidence-Grounded Emergency Knowledge Base + Safety Guardrails
 */

(function (root, factory) {
  const result = factory();
  if (typeof module === 'object' && module.exports) { module.exports = result; }
  if (typeof global !== 'undefined') { global.SOS_RAG = result; }
  if (typeof window !== 'undefined') { window.SOS_RAG = result; }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ────────────────────────────────────────────────────────
     EMERGENCY KNOWLEDGE BASE (RAG-Grounded — 14 Protocols)
  ──────────────────────────────────────────────────────── */
  const EMERGENCY_KB = {
    cpr: {
      id: 'cpr',
      title: 'Cardiopulmonary Resuscitation (CPR)',
      emergencyLevel: 'CRITICAL',
      icon: '❤️',
      source: { org: 'American Heart Association (AHA)', doc: 'CPR & ECC Guidelines 2020', tier: 'Tier 1: High', updated: '2020-10-01' },
      immediateAction: 'Call 112 immediately. Begin CPR only if the person is unresponsive and not breathing normally.',
      steps: [
        { n: 1, title: 'Check Responsiveness', detail: 'Tap shoulders firmly and shout "Are you okay?" — check for normal breathing (no more than 10 seconds).' },
        { n: 2, title: 'Call Emergency Services', detail: 'Call 112 now or send someone. Ask for an AED if available. Speaker-phone allows hands-free guidance.' },
        { n: 3, title: 'Chest Compressions', detail: 'Place heel of one hand on center of chest (lower half of sternum). Push HARD and FAST: 100–120 compressions/min, 5–6 cm depth. Allow full chest recoil.' },
        { n: 4, title: 'Rescue Breaths (if trained)', detail: 'After 30 compressions: tilt head, lift chin, give 2 breaths (1 second each). Watch for chest rise. Resume compressions immediately.' },
        { n: 5, title: 'Continue Until Help Arrives', detail: 'Keep CPR cycles of 30:2 until AED arrives, person starts breathing, or professional rescuers take over.' }
      ],
      doNot: ['Do NOT stop CPR unless the person shows clear signs of life', 'Do NOT give rescue breaths if untrained — do Hands-Only CPR', 'Do NOT tilt the neck if spinal injury is suspected'],
      warnings: ['CPR can cause rib fractures — this is acceptable to save a life', 'Hands-Only CPR is effective for adult cardiac arrest'],
      metronomeBPM: 110,
      disclaimer: 'CPR protocols are based on AHA 2020 Guidelines. Updated training is strongly recommended.'
    },

    bleeding: {
      id: 'bleeding',
      title: 'Severe Bleeding Control',
      emergencyLevel: 'CRITICAL',
      icon: '🩸',
      source: { org: 'Stop the Bleed / ACS TQIP', doc: 'Bleeding Control Basic — ATLS', tier: 'Tier 1: High', updated: '2022-01-01' },
      immediateAction: 'Call 112. Apply direct firm pressure immediately. Do NOT remove blood-soaked dressings.',
      steps: [
        { n: 1, title: 'Ensure Safety', detail: 'Wear gloves if available. Protect yourself from blood-borne exposure.' },
        { n: 2, title: 'Apply Direct Pressure', detail: 'Use a clean cloth, gauze, or dressing. Apply FIRM, constant, direct pressure on the wound. Maintain for at least 10 minutes without lifting.' },
        { n: 3, title: 'Pack Deep Wounds', detail: 'For deep wounds: pack tightly with gauze, then apply pressure on top. Do not remove packing.' },
        { n: 4, title: 'Elevate the Limb', detail: 'Raise the injured limb above the heart level if no fracture suspected — reduces blood pressure at the wound.' },
        { n: 5, title: 'Tourniquet (Last Resort)', detail: 'For life-threatening limb bleeding ONLY: Apply 5–7 cm above wound. Tighten until bleeding stops. Note time applied. NEVER remove it — leave for medical professionals.' }
      ],
      doNot: ['Do NOT remove blood-soaked dressings', 'Do NOT probe or explore wounds', 'Do NOT apply tourniquet over joints'],
      warnings: ['Tourniquets on limbs for >2 hours may cause complications — medical staff must be notified of time applied', 'Internal bleeding cannot be controlled by first aid — immediate hospital care is essential'],
      disclaimer: 'Based on Stop the Bleed / ACS TQIP guidelines. Severe internal bleeding requires immediate surgical intervention.'
    },

    choking: {
      id: 'choking',
      title: 'Choking Relief — Heimlich Maneuver',
      emergencyLevel: 'HIGH',
      icon: '🫁',
      source: { org: 'American Red Cross / AHA', doc: 'First Aid, CPR & AED Guidelines', tier: 'Tier 1: High', updated: '2021-01-01' },
      immediateAction: 'If person cannot speak, cough, or breathe — act immediately. Call 112.',
      steps: [
        { n: 1, title: 'Ask "Are You Choking?"', detail: 'If they can speak or cough strongly — encourage them to keep coughing. Monitor.' },
        { n: 2, title: 'Give 5 Back Blows', detail: 'Lean them forward, support chest with one hand. Deliver 5 firm back blows with the heel of your hand between the shoulder blades.' },
        { n: 3, title: 'Give 5 Abdominal Thrusts', detail: 'Stand behind them. Fist just above navel. Grasp with other hand. Pull sharply inward and upward 5 times.' },
        { n: 4, title: 'Alternate Until Clear', detail: 'Alternate 5 back blows + 5 abdominal thrusts until the object is expelled or they become unconscious.' },
        { n: 5, title: 'If Unconscious', detail: 'Lower them gently. Call 112 if not done. Begin CPR. Look in mouth before giving breaths — remove object only if clearly visible.' }
      ],
      doNot: ['Do NOT perform blind finger sweeps', 'Do NOT give abdominal thrusts to pregnant women or infants — use chest thrusts', 'Do NOT slap back too hard for infants'],
      warnings: ['For infants: use 5 back blows + 5 chest thrusts (NOT abdominal thrusts)', 'For pregnant women: use chest thrusts instead of abdominal thrusts'],
      disclaimer: 'Based on American Red Cross & AHA guidelines.'
    },

    heatstroke: {
      id: 'heatstroke',
      title: 'Heat Stroke Emergency',
      emergencyLevel: 'HIGH',
      icon: '🌡️',
      source: { org: 'CDC / WHO', doc: 'Heat Stress & Heat Stroke Prevention Guidelines', tier: 'Tier 1: High', updated: '2023-06-01' },
      immediateAction: 'Heat stroke is life-threatening. Call 112 immediately. Cool the person rapidly — every second matters.',
      steps: [
        { n: 1, title: 'Call 112 Now', detail: 'Heat stroke can cause brain damage and death. Call emergency services immediately.' },
        { n: 2, title: 'Move to Cool Area', detail: 'Get the person out of direct sunlight immediately. Move to an air-conditioned space or shaded area.' },
        { n: 3, title: 'Cool Rapidly', detail: 'Remove excess clothing. Spray or sponge with cool (not icy) water. Fan vigorously. Apply ice packs to neck, armpits, and groin.' },
        { n: 4, title: 'Immersion if Available', detail: 'Cold water immersion (tub/bucket) is the most effective cooling — use if available and person is conscious.' },
        { n: 5, title: 'Do Not Give Fluids if Drowsy', detail: 'Only give small sips of cool water if the person is fully alert and can swallow safely.' }
      ],
      doNot: ['Do NOT give water to an unconscious person — choking risk', 'Do NOT use alcohol rubs', 'Do NOT give aspirin or paracetamol for heat stroke — ineffective'],
      warnings: ['Signs of heat stroke: body temp >40°C, confusion, no sweating, rapid pulse', 'Distinguish from heat exhaustion: heat stroke involves altered mental status'],
      disclaimer: 'Based on CDC & WHO heat-related illness guidelines.'
    },

    burns: {
      id: 'burns',
      title: 'Burns First Aid',
      emergencyLevel: 'HIGH',
      icon: '🔥',
      source: { org: 'WHO / NHS / American Burn Association', doc: 'Burn Care Guidelines', tier: 'Tier 1: High', updated: '2022-04-01' },
      immediateAction: 'For major burns or burns to face/hands/genitals — call 112. Do NOT delay.',
      steps: [
        { n: 1, title: 'Stop the Burning Process', detail: 'Remove from heat source. Remove burning/hot clothing and jewelry (unless stuck to skin). Do NOT pop blisters.' },
        { n: 2, title: 'Cool with Running Water', detail: 'Run COOL (not cold/icy) water over the burn for 20 minutes. Start within 3 hours of injury.' },
        { n: 3, title: 'Cover the Burn', detail: 'Cover loosely with sterile non-fluffy dressing or clean cling film. Do NOT use cotton wool or adhesive bandages.' },
        { n: 4, title: 'Pain Management', detail: 'Over-the-counter paracetamol or ibuprofen may help — check for age and contraindications. Follow product instructions.' },
        { n: 5, title: 'Seek Medical Evaluation', detail: 'All but the most minor burns should be assessed by a healthcare professional, especially in children, elderly, or burns on face/hands.' }
      ],
      doNot: ['Do NOT use ice, butter, toothpaste, or oil — these cause further damage', 'Do NOT break blisters', 'Do NOT remove clothing that is stuck to the skin'],
      warnings: ['Deep burns (waxy, leathery, charred, painless) require emergency care', 'Chemical burns: brush off dry chemical, then irrigate with large amounts of water for 20+ minutes'],
      disclaimer: 'Based on WHO, NHS, and American Burn Association guidelines.'
    },

    stroke: {
      id: 'stroke',
      title: 'Stroke Warning Signs (FAST)',
      emergencyLevel: 'CRITICAL',
      icon: '🧠',
      source: { org: 'American Stroke Association / WHO', doc: 'Stroke Response Guidelines', tier: 'Tier 1: High', updated: '2023-01-01' },
      immediateAction: '⚡ FAST method. Every minute matters — brain cells die every second. Call 112 IMMEDIATELY.',
      steps: [
        { n: 1, title: 'F — Face Drooping', detail: 'Ask the person to smile. Is one side drooping or numb? Facial asymmetry is a key stroke sign.' },
        { n: 2, title: 'A — Arm Weakness', detail: 'Ask them to raise both arms. Does one arm drift downward or feel weak?' },
        { n: 3, title: 'S — Speech Difficulty', detail: 'Ask them to repeat a simple phrase. Is speech slurred, garbled, or strange?' },
        { n: 4, title: 'T — Time to Call 112', detail: 'If ANY of these signs are present — call 112 immediately. Note the time symptoms began (critical for treatment decisions).' },
        { n: 5, title: 'While Waiting', detail: 'Keep them calm. Lay them on their side if vomiting. Do NOT give food or water. Stay with them.' }
      ],
      doNot: ['Do NOT give aspirin without medical instruction for stroke', 'Do NOT let them sleep it off', 'Do NOT give food or water (swallowing may be impaired)'],
      warnings: ['Treatment is most effective within the first hours ("golden hour")', 'TIA (mini-stroke) symptoms resolve but still require immediate medical evaluation — high risk of major stroke within days'],
      disclaimer: 'Based on American Stroke Association & WHO stroke response guidelines.'
    },

    heartattack: {
      id: 'heartattack',
      title: 'Heart Attack Warning Signs',
      emergencyLevel: 'CRITICAL',
      icon: '💔',
      source: { org: 'American Heart Association / BHF', doc: 'Heart Attack Response Guidelines 2023', tier: 'Tier 1: High', updated: '2023-03-01' },
      immediateAction: 'Call 112 immediately. Have the person sit or lie in comfortable position. Do NOT drive to hospital.',
      steps: [
        { n: 1, title: 'Recognize Symptoms', detail: 'Chest pain/pressure/tightness (may radiate to arm, jaw, neck, back), shortness of breath, sweating, nausea, lightheadedness, unusual fatigue.' },
        { n: 2, title: 'Call 112 Immediately', detail: 'Do NOT wait to see if symptoms pass. Call 112 — paramedics can begin treatment en route.' },
        { n: 3, title: 'Aspirin (if directed)', detail: 'If available, not allergic, and no contraindications: 300mg aspirin (chewed, not swallowed whole) — ONLY if emergency services advise it or person has confirmed prescription.' },
        { n: 4, title: 'Comfortable Position', detail: 'Sit or lie in most comfortable position — usually sitting with knees bent (W-position) is best. Loosen tight clothing.' },
        { n: 5, title: 'Be Ready for CPR', detail: 'If person becomes unresponsive and stops breathing normally — begin CPR and use AED if available.' }
      ],
      doNot: ['Do NOT drive the patient to hospital yourself — ambulance is faster and safer', 'Do NOT leave the person alone', 'Do NOT give aspirin if allergic or if instructed otherwise'],
      warnings: ['Women, elderly, and diabetics may have atypical symptoms (jaw pain, extreme fatigue, nausea) without classic chest pain', 'Immediate medical treatment within 90 minutes significantly improves outcomes'],
      disclaimer: 'Based on AHA & British Heart Foundation guidelines.'
    },

    allergic: {
      id: 'allergic',
      title: 'Severe Allergic Reaction (Anaphylaxis)',
      emergencyLevel: 'CRITICAL',
      icon: '⚠️',
      source: { org: 'World Allergy Organization / AAAAI', doc: 'Anaphylaxis Emergency Guidelines', tier: 'Tier 1: High', updated: '2022-11-01' },
      immediateAction: 'Anaphylaxis can be fatal within minutes. Use epinephrine auto-injector (EpiPen) if available. Call 112.',
      steps: [
        { n: 1, title: 'Use Epinephrine Auto-Injector', detail: 'If person has a prescribed EpiPen/auto-injector — use it NOW in outer thigh. Even through clothing. Note time.' },
        { n: 2, title: 'Call 112 Immediately', detail: 'Even if symptoms improve after epinephrine — biphasic reactions can occur. Hospital observation is mandatory.' },
        { n: 3, title: 'Lay Them Down', detail: 'Lay flat with legs raised (shock position) — UNLESS breathing difficulty, then sit upright. Do NOT stand them up.' },
        { n: 4, title: 'Second Dose if Needed', detail: 'If symptoms persist after 5–15 minutes and a second auto-injector is available — administer it in opposite thigh.' },
        { n: 5, title: 'CPR if Needed', detail: 'If they become unconscious and stop breathing — begin CPR.' }
      ],
      doNot: ['Do NOT give antihistamines as the primary treatment for anaphylaxis', 'Do NOT stand the patient up (worsens shock)', 'Do NOT leave them alone'],
      warnings: ['Symptoms: hives, throat swelling, difficulty breathing, severe drop in blood pressure, vomiting', 'Death can occur within 5–30 minutes — every second matters'],
      disclaimer: 'Based on World Allergy Organization & AAAAI anaphylaxis guidelines.'
    },

    poisoning: {
      id: 'poisoning',
      title: 'Poisoning First Response',
      emergencyLevel: 'CRITICAL',
      icon: '☠️',
      source: { org: 'WHO / Poison Control Centers', doc: 'Poisoning Management Guidelines', tier: 'Tier 1: High', updated: '2022-01-01' },
      immediateAction: 'Call Poison Control (India: 1800-116-117) or 112 immediately. Do NOT induce vomiting unless specifically directed.',
      steps: [
        { n: 1, title: 'Call for Help Immediately', detail: 'Call 112 or Poison Control (India: 1800-116-117). Give details: substance name, amount, time, person\'s age and weight.' },
        { n: 2, title: 'Do NOT Induce Vomiting', detail: 'Unless specifically directed by Poison Control — many substances cause more damage coming back up (corrosives, hydrocarbons).' },
        { n: 3, title: 'If Swallowed (Non-Corrosive)', detail: 'If directed by Poison Control — give water or milk. Follow instructions precisely.' },
        { n: 4, title: 'If on Skin or Eyes', detail: 'Remove contaminated clothing. Flush skin with large amounts of water for 20+ minutes. For eyes: flush with clean water 15–20 minutes.' },
        { n: 5, title: 'Save the Container', detail: 'Keep the poison container, package, or plant — show to medical staff. This is crucial for correct treatment.' }
      ],
      doNot: ['Do NOT induce vomiting without professional guidance', 'Do NOT give activated charcoal without medical direction', 'Do NOT give "antidotes" from internet — many are wrong or dangerous'],
      warnings: ['If unconscious: recovery position, do not leave alone, call 112', 'Carbon monoxide: remove from exposure immediately, fresh air, call 112 — do NOT reenter building'],
      disclaimer: 'Poisoning management varies by substance. Always contact Poison Control or emergency services first.'
    },

    fracture: {
      id: 'fracture',
      title: 'Fracture / Bone Injury',
      emergencyLevel: 'MODERATE',
      icon: '🦴',
      source: { org: 'NHS / AO Foundation', doc: 'Fracture First Aid Guidelines', tier: 'Tier 1: High', updated: '2022-06-01' },
      immediateAction: 'Do NOT attempt to straighten the bone. Immobilize and call 112 for open fractures or suspected spinal/pelvic injury.',
      steps: [
        { n: 1, title: 'Stop Bleeding if Present', detail: 'Apply gentle pressure around (not over) the wound with clean dressing. For open fractures — cover wound with sterile dressing.' },
        { n: 2, title: 'Immobilize the Injury', detail: 'Support above and below the injury. Do NOT try to realign or push bones back. Use improvised splint — pad it well.' },
        { n: 3, title: 'Apply Cold Pack', detail: 'Wrap an ice pack or cold cloth in a towel — apply to reduce swelling. Do NOT apply ice directly to skin.' },
        { n: 4, title: 'Elevate if Possible', detail: 'If elevation does not cause more pain — raise the injured area above heart level.' },
        { n: 5, title: 'Seek Medical Evaluation', detail: 'All suspected fractures should be evaluated by a healthcare professional for X-ray and appropriate treatment.' }
      ],
      doNot: ['Do NOT try to straighten the bone', 'Do NOT move person if spinal injury suspected (unless in immediate danger)', 'Do NOT apply heat initially'],
      warnings: ['Open fractures (bone visible) and suspected spinal/pelvic fractures are emergencies — call 112', 'Compartment syndrome: severe pain, pallor, paresthesia — emergency'],
      disclaimer: 'Based on NHS & AO Foundation fracture first aid guidelines.'
    },

    seizure: {
      id: 'seizure',
      title: 'Seizure First Aid',
      emergencyLevel: 'HIGH',
      icon: '⚡',
      source: { org: 'Epilepsy Foundation / WHO', doc: 'Seizure First Aid Guidelines', tier: 'Tier 1: High', updated: '2021-01-01' },
      immediateAction: 'Call 112 if: first seizure, lasts >5 minutes, person does not regain consciousness, or injury occurs.',
      steps: [
        { n: 1, title: 'Stay Calm and Stay With Them', detail: 'Time the seizure. Do NOT restrain the person — you cannot stop a seizure.' },
        { n: 2, title: 'Protect From Injury', detail: 'Move dangerous objects away. Cushion the head (jacket, clothing). Do NOT put anything in their mouth.' },
        { n: 3, title: 'Place in Recovery Position', detail: 'After convulsions stop: gently roll them on their side (recovery position) to keep airway clear.' },
        { n: 4, title: 'Call 112 When Required', detail: 'Call immediately if: first seizure, >5 minutes, injury, pregnant, diabetic, no recovery of consciousness, repeated seizures.' },
        { n: 5, title: 'After the Seizure', detail: 'Stay with them while they recover (may be confused for minutes to hours). Reassure them. Tell them what happened.' }
      ],
      doNot: ['Do NOT put anything in their mouth', 'Do NOT restrain the person', 'Do NOT give water until fully conscious and alert'],
      warnings: ['Status epilepticus (seizure >5 min) is a medical emergency', 'Post-ictal period (confusion after seizure) is normal but monitor closely'],
      disclaimer: 'Based on Epilepsy Foundation & WHO seizure first aid guidelines.'
    },

    diabetic: {
      id: 'diabetic',
      title: 'Diabetic Emergency (Hypoglycaemia)',
      emergencyLevel: 'HIGH',
      icon: '🍬',
      source: { org: 'Diabetes UK / ADA', doc: 'Hypoglycaemia Management Guidelines', tier: 'Tier 1: High', updated: '2022-09-01' },
      immediateAction: 'If conscious and can swallow: give fast-acting sugar immediately. If unconscious: call 112 — do NOT give anything by mouth.',
      steps: [
        { n: 1, title: 'Check Blood Sugar if Meter Available', detail: 'Below 70 mg/dL (3.9 mmol/L) = low blood sugar (hypoglycaemia).' },
        { n: 2, title: 'Give Fast Sugar (Conscious Only)', detail: 'Give 15–20g fast-acting carbohydrates: 4 glucose tablets, 150ml fruit juice, 4–5 jelly beans, or sugar dissolved in water. NOT diet drinks.' },
        { n: 3, title: 'Wait and Recheck', detail: 'Wait 15 minutes, recheck blood sugar. Repeat if still low. Once recovered: give a small meal or snack.' },
        { n: 4, title: 'If Unconscious or Unable to Swallow', detail: 'Place on side, call 112. If glucagon kit available and trained: administer it. Do NOT give anything by mouth.' },
        { n: 5, title: 'Seek Medical Help', detail: 'If blood sugar does not rise, symptoms persist, or person was unconscious — always seek medical evaluation.' }
      ],
      doNot: ['Do NOT give food or drink to unconscious person — choking risk', 'Do NOT give insulin (makes it worse)', 'Do NOT leave them alone'],
      warnings: ['Symptoms: shakiness, sweating, confusion, irritability, rapid heartbeat, pale skin', 'Severe hypoglycaemia with loss of consciousness requires glucagon injection or IV glucose — call 112'],
      disclaimer: 'Based on Diabetes UK & ADA hypoglycaemia guidelines.'
    },

    drowning: {
      id: 'drowning',
      title: 'Drowning Response',
      emergencyLevel: 'CRITICAL',
      icon: '🌊',
      source: { org: 'WHO / International Lifesaving Federation', doc: 'Drowning Prevention and Response Guidelines', tier: 'Tier 1: High', updated: '2022-01-01' },
      immediateAction: 'Call 112 immediately. Only enter water if trained — use throw/reach techniques. Begin CPR immediately if not breathing.',
      steps: [
        { n: 1, title: 'Ensure Own Safety', detail: 'Do NOT jump in unless trained. Use throw (rope/belt) or reach (pole/towel) techniques from shore.' },
        { n: 2, title: 'Remove from Water', detail: 'Get the person out of water as quickly and safely as possible. Horizontal removal preferred if spinal injury suspected.' },
        { n: 3, title: 'Call 112', detail: 'Call immediately. Drowning can cause cardiac arrest — paramedics are needed.' },
        { n: 4, title: 'Begin Rescue Breaths First', detail: 'Unlike cardiac arrest — drowning victims need oxygen first. Give 5 rescue breaths immediately, then 30 compressions if still unresponsive.' },
        { n: 5, title: 'Continue CPR', detail: 'Continue CPR (30:2) until help arrives or person breathes on their own. Use AED if available.' }
      ],
      doNot: ['Do NOT enter water without training — you may become a second victim', 'Do NOT hold victim upside down to drain water', 'Do NOT stop CPR until professional help arrives'],
      warnings: ['Near-drowning (secondary drowning) can occur hours later — all drowning victims should be evaluated at hospital', 'Cold water drowning: continue CPR — there are cases of survival after prolonged submersion in cold water'],
      disclaimer: 'Based on WHO & International Lifesaving Federation guidelines.'
    },

    asthma: {
      id: 'asthma',
      title: 'Asthma / Breathing Emergency',
      emergencyLevel: 'HIGH',
      icon: '💨',
      source: { org: 'GINA / NHS / BTS', doc: 'Asthma Management Guidelines 2023', tier: 'Tier 1: High', updated: '2023-05-01' },
      immediateAction: 'Help them use their reliever inhaler (blue/salbutamol). If severe — call 112. Do NOT leave them alone.',
      steps: [
        { n: 1, title: 'Reassure and Sit Upright', detail: 'Keep them calm and sitting upright, slightly leaning forward. Panic worsens breathing difficulty.' },
        { n: 2, title: 'Use Reliever Inhaler', detail: 'Help them use their blue reliever inhaler (salbutamol). 1 puff every 30–60 seconds, up to 10 puffs. Use a spacer if available.' },
        { n: 3, title: 'Reassess After 15 Minutes', detail: 'If no improvement after 10 puffs or inhaler ran out — call 112. Repeat 10 puffs while waiting.' },
        { n: 4, title: 'Call 112 For Severe Attack', detail: 'Call 112 if: too breathless to speak, blue lips, exhausted/drowsy, or no improvement after 10 puffs.' },
        { n: 5, title: 'Continue Treatment Until Help Arrives', detail: 'Keep giving the reliever inhaler (10 puffs every 15 minutes) while waiting for ambulance.' }
      ],
      doNot: ['Do NOT use preventer (brown/orange) inhaler in an acute attack', 'Do NOT lie them down — sitting upright is best', 'Do NOT leave them alone'],
      warnings: ['Signs of severe attack: can\'t complete sentences, very fast breathing, accessory muscle use', 'Silent chest (no wheeze) can indicate very severe obstruction — call 112 immediately'],
      disclaimer: 'Based on GINA 2023, NHS, and BTS asthma management guidelines.'
    }
  };

  /* ────────────────────────────────────────────────────────
     EMERGENCY TRIAGE — INTENT CLASSIFIER
  ──────────────────────────────────────────────────────── */
  const TRIAGE_PATTERNS = [
    { level: 'CRITICAL', keywords: ['not breathing', 'no pulse', 'unconscious', 'cardiac arrest', 'heart stopped', 'no breath', 'collapsed', 'unresponsive', 'anaphylaxis', 'throat closing', 'not moving', 'blue lips', 'stroke', 'sudden weakness one side', 'cannot speak suddenly', 'drowning', 'hanging', 'severe allergic', 'choking cant breathe'] },
    { level: 'HIGH', keywords: ['chest pain', 'heart attack', 'difficulty breathing', 'seizure', 'convulsing', 'severe bleeding', 'heavy bleeding', 'head injury', 'lose consciousness', 'fainted', 'poisoning', 'overdose', 'burn large', 'broken bone', 'diabetic emergency', 'very high fever', 'heat stroke', 'choking', 'asthma attack'] },
    { level: 'MODERATE', keywords: ['fever', 'vomiting', 'dizziness', 'headache', 'mild pain', 'cut', 'sprain', 'rash', 'diarrhea', 'allergic reaction mild', 'ear pain', 'abdominal pain'] },
    { level: 'LOW', keywords: ['cough', 'cold', 'sore throat', 'runny nose', 'mild headache', 'tired', 'fatigue', 'back pain minor', 'insect bite'] }
  ];

  function classifyEmergency(query) {
    const q = query.toLowerCase();
    for (const pattern of TRIAGE_PATTERNS) {
      for (const kw of pattern.keywords) {
        if (q.includes(kw)) {
          return { level: pattern.level, isEmergency: pattern.level === 'CRITICAL' || pattern.level === 'HIGH', keyword: kw };
        }
      }
    }
    return { level: 'LOW', isEmergency: false };
  }

  /* ────────────────────────────────────────────────────────
     RAG RETRIEVER — Match query to emergency protocol
  ──────────────────────────────────────────────────────── */
  const TOPIC_KEYWORDS = {
    cpr: ['cpr', 'heart stopped', 'not breathing', 'cardiac arrest', 'chest compression', 'resuscitation', 'pulse', 'unconscious', 'no breath'],
    bleeding: ['bleeding', 'blood', 'wound', 'cut', 'tourniquet', 'hemorrhage', 'severe bleed'],
    choking: ['choking', 'choke', 'cannot breathe', 'food stuck', 'throat blocked', 'heimlich'],
    heatstroke: ['heat stroke', 'heatstroke', 'overheating', 'heat exhaustion', 'sunstroke', 'high temperature outdoors'],
    burns: ['burn', 'burns', 'fire', 'scalding', 'chemical burn', 'hot water', 'scald'],
    stroke: ['stroke', 'face drooping', 'slurred speech', 'arm weakness', 'sudden confusion', 'fast stroke'],
    heartattack: ['heart attack', 'chest pain', 'myocardial infarction', 'crushing chest', 'jaw pain', 'left arm pain'],
    allergic: ['allergic', 'allergy', 'anaphylaxis', 'epipen', 'swelling throat', 'hives', 'bee sting'],
    poisoning: ['poison', 'poisoning', 'overdose', 'chemical ingestion', 'swallowed', 'toxic', 'drug overdose'],
    fracture: ['fracture', 'broken bone', 'break', 'bone injury', 'fall', 'splint'],
    seizure: ['seizure', 'convulsion', 'epilepsy', 'fit', 'shaking uncontrollably', 'convulsing'],
    diabetic: ['diabetic', 'diabetes', 'low blood sugar', 'hypoglycaemia', 'glucose', 'insulin reaction', 'sugar low'],
    drowning: ['drowning', 'drowned', 'water', 'submersion', 'near drowning'],
    asthma: ['asthma', 'wheeze', 'breathing difficulty', 'inhaler', 'shortness breath', 'cant breathe', 'breathless']
  };

  function retrieveProtocol(query) {
    const q = query.toLowerCase();
    let bestMatch = null;
    let bestScore = 0;
    for (const [topicId, keywords] of Object.entries(TOPIC_KEYWORDS)) {
      let score = 0;
      for (const kw of keywords) {
        if (q.includes(kw)) score += kw.split(' ').length;
      }
      if (score > bestScore) { bestScore = score; bestMatch = topicId; }
    }
    if (bestMatch && bestScore > 0 && EMERGENCY_KB[bestMatch]) {
      return { found: true, protocol: EMERGENCY_KB[bestMatch], score: bestScore };
    }
    return { found: false };
  }

  /* ────────────────────────────────────────────────────────
     RAG ANSWER GENERATOR
  ──────────────────────────────────────────────────────── */
  function generateAnswer(query) {
    const triage = classifyEmergency(query);
    const retrieval = retrieveProtocol(query);

    if (!retrieval.found) {
      return {
        type: 'INSUFFICIENT_EVIDENCE',
        triage,
        message: 'Insufficient verified information found for this specific query in the emergency knowledge base.',
        recommendation: 'For any health emergency, please contact 112 (India National Emergency) or your local emergency services immediately. Consult a qualified healthcare professional for non-emergency concerns.',
        sources: []
      };
    }

    const protocol = retrieval.protocol;
    return {
      type: 'RAG_RESPONSE',
      triage,
      protocol,
      emergencyLevel: protocol.emergencyLevel,
      immediateAction: protocol.immediateAction,
      steps: protocol.steps,
      doNot: protocol.doNot,
      warnings: protocol.warnings,
      source: protocol.source,
      disclaimer: protocol.disclaimer,
      evidenceStatus: 'HIGH',
      notDiagnosis: true
    };
  }

  /* ────────────────────────────────────────────────────────
     PUBLIC API
  ──────────────────────────────────────────────────────── */
  return {
    kb: EMERGENCY_KB,
    getAllTopics: () => Object.values(EMERGENCY_KB).map(p => ({ id: p.id, title: p.title, icon: p.icon, level: p.emergencyLevel })),
    getProtocol: (id) => EMERGENCY_KB[id] || null,
    classifyEmergency,
    retrieveProtocol,
    generateAnswer,
    version: '2.0-RAG',
    knowledgeSources: 14,
    lastUpdated: '2023-10-01'
  };

}));
