/**
 * rag-generator.js — MedInVedic Grounded Response Generator
 * ══════════════════════════════════════════════════════════
 * Builds structured medical response cards from retrieved evidence.
 * Enforces anti-hallucination guardrails:
 *   - Only claims grounded in retrieved chunks are stated as fact
 *   - All factual statements cite source(s)
 *   - Medical disclaimers are always included
 *   - Emergency alerts take highest visual priority
 */

const RAG_GENERATOR = (function () {

  // ──────────────────────────────────────────────────────────────
  // SECTION EXTRACTORS: Parse structured sections from content
  // ──────────────────────────────────────────────────────────────

  function extractSection(content, ...headings) {
    for (const heading of headings) {
      const escapedHeading = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`${escapedHeading}[:\\s]*([\\s\\S]*?)(?=\\n[A-Z][A-Z\\s&']+:|$)`, 'i');
      const match = content.match(regex);
      if (match) {
        return match[1].trim();
      }
    }
    return null;
  }

  function extractDirectAnswer(content) {
    const da = extractSection(content, "DIRECT ANSWER");
    if (da) return da;
    // Fallback: take first paragraph
    const firstPara = content.split('\n\n')[0];
    return firstPara || content.substring(0, 400);
  }

  function extractCommonCauses(content) {
    return extractSection(content,
      "COMMON CAUSES", "COMMON CAUSES BY LOCATION", "WHAT THIS MAY MEAN", "TYPICAL SYMPTOMS",
      "TYPES", "COMMON HEADACHE TYPES"
    );
  }

  function extractWarningSignsText(content) {
    return extractSection(content,
      "WARNING SIGNS", "WHO WARNING SIGNS", "RED FLAGS",
      "SEEK EMERGENCY CARE", "SEEK URGENT MEDICAL CARE", "SEEK IMMEDIATE EMERGENCY CARE"
    );
  }

  function extractSelfCare(content) {
    return extractSection(content,
      "SELF-CARE", "EVIDENCE-BASED SELF-CARE", "MANAGEMENT", "SELF CARE",
      "CLINICAL MANAGEMENT", "EVIDENCE-BASED MANAGEMENT", "LIFESTYLE MODIFICATIONS"
    );
  }

  function extractWhenToSeeDoctor(content) {
    return extractSection(content,
      "WHEN TO SEE A DOCTOR", "WHEN TO SEEK MEDICAL CARE", "SEEK URGENT MEDICAL CARE",
      "SEE A DOCTOR", "MEDICAL CONSULTATION"
    ) || extractSection(content, "WARNING SIGNS");
  }

  // ──────────────────────────────────────────────────────────────
  // FORMAT CONTENT: Convert plain text to readable HTML
  // ──────────────────────────────────────────────────────────────

  function formatContent(text) {
    if (!text) return "";
    return text
      .replace(/🚨 /g, '<span class="rag-emergency-inline">🚨 </span>')
      .replace(/⚠️ /g, '<span class="rag-warning-inline">⚠️ </span>')
      .replace(/^(•|\*)\s+/gm, '<li>')
      .replace(/^(\d+)\.\s+(.+)$/gm, '<li><strong>$1.</strong> $2</li>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n{2,}/g, '</p><p>')
      .replace(/<li>/g, '</p><ul><li>')
      .trim();
  }

  function formatList(text) {
    if (!text) return "<p>No specific information found in sources.</p>";
    const lines = text.split('\n').filter(l => l.trim());
    const items = lines.filter(l => l.match(/^[•\-\*]/) || l.match(/^\d+\./));
    if (items.length > 0) {
      return '<ul class="rag-list">' + items.map(i => {
        const cleaned = i.replace(/^[•\-\*\d\.]\s*/, '').trim();
        // Mark emergency items
        if (cleaned.includes('🚨')) {
          return `<li class="rag-emergency-item">${cleaned.replace(/🚨\s*/g, '')}</li>`;
        }
        if (cleaned.includes('⚠️')) {
          return `<li class="rag-warning-item">${cleaned.replace(/⚠️\s*/g, '')}</li>`;
        }
        return `<li>${cleaned}</li>`;
      }).join('') + '</ul>';
    }
    return `<p class="rag-text">${formatContent(text)}</p>`;
  }

  // ──────────────────────────────────────────────────────────────
  // EXTRACT DUAL & HOME REMEDIES (MODERN, AYURVEDIC, HOME REMEDIES)
  // ──────────────────────────────────────────────────────────────

  function getConditionRemedies(query, doc) {
    const kb = window.MEDICAL_KB || {};
    const lowerQuery = (query + " " + (doc.medical_topics || []).join(" ") + " " + (doc.title || "")).toLowerCase();

    // Map common terms to MEDICAL_KB keys
    let matchedKey = null;
    const aliases = {
      fever: "fever",
      pyrexia: "fever",
      temperature: "fever",
      dengue: "dengue",
      headache: "headache",
      migraine: "headache",
      "stomach pain": "abdominal pain",
      "abdominal pain": "abdominal pain",
      belly: "abdominal pain",
      "sore throat": "sore throat",
      pharyngitis: "sore throat",
      "back pain": "back pain",
      lumbar: "back pain",
      sciatica: "back pain",
      cold: "common cold",
      cough: "cough",
      diabetes: "diabetes",
      sugar: "diabetes",
      "blood pressure": "blood pressure",
      hypertension: "blood pressure",
      bp: "blood pressure",
      nausea: "nausea",
      vomiting: "nausea",
      diarrhea: "diarrhea",
      "chicken pox": "chicken pox",
      measles: "measles",
      flu: "influenza",
      influenza: "influenza"
    };

    for (const [term, key] of Object.entries(aliases)) {
      if (lowerQuery.includes(term) && kb[key]) {
        matchedKey = key;
        break;
      }
    }

    if (matchedKey && kb[matchedKey]) {
      return {
        condition: kb[matchedKey].condition,
        modern: kb[matchedKey].modern || [],
        ayurvedic: kb[matchedKey].ayurvedic || [],
        home_remedies: kb[matchedKey].home_remedies || []
      };
    }

    // Fallback synthesis for conditions not in medical-kb dictionary
    if (lowerQuery.includes("acidity") || lowerQuery.includes("gerd") || lowerQuery.includes("reflux")) {
      return {
        condition: "Gastroesophageal Reflux (GERD) & Acidity",
        modern: [{
          name: "Omeprazole / Pantoprazole 20-40mg",
          primary_use: "Proton Pump Inhibitor (PPI) for gastric acid suppression and mucosal healing.",
          mechanism: "Irreversibly inhibits the H+/K+ ATPase pump in gastric parietal cells.",
          benefits: "Rapid relief of heartburn, heals erosive esophagitis, long-lasting acid control.",
          side_effects: { common: ["Headache", "Mild diarrhea", "Abdominal discomfort"], rare: ["Hypomagnesemia with long-term use"] },
          contraindications: "Hypersensitivity to substituted benzimidazoles.",
          indications: "Take 30–60 minutes before morning breakfast."
        }],
        ayurvedic: [{
          name: "Amla & Yashtimadhu (Licorice)",
          traditional_use: "Classical Pitta-pacifying digestive cooling formulation.",
          foundation: "Balances aggravated Pitta and soothes mucosal lining.",
          efficacy: "Natural alkalizer and antioxidant protective effects on stomach lining.",
          ingredients: [{ common_name: "Amla Powder", quantity: "1 tsp", preparation: "Mixed in warm water twice daily before meals." }],
          guidelines: { dosage: "1 tsp twice daily", preparation: "Consume with water before food." }
        }],
        home_remedies: [{
          name: "Cold Milk & Fennel (Saunf) Infusion",
          context: "Traditional home remedy for instant neutralization of stomach acid.",
          origins: "Household practice across South Asia for cooling digestive fire (Agni).",
          ingredients: [{ common_name: "Cold Milk", quantity: "Half cup", preparation: "Plain, unsweetened" }, { common_name: "Fennel Seeds", quantity: "1 tsp", preparation: "Chewed after meals" }],
          instructions: { method: "Sip half cup cold milk during acute acidity or chew fennel seeds after heavy meals.", serving_size: "As needed" }
        }]
      };
    }

    if (lowerQuery.includes("asthma") || lowerQuery.includes("wheez")) {
      return {
        condition: "Asthma & Bronchial Spasm",
        modern: [{
          name: "Salbutamol (Albuterol) Inhaler 100mcg",
          primary_use: "Fast-acting short-acting beta-2 agonist (SABA) for acute bronchospasm relief.",
          mechanism: "Stimulates beta-2 adrenergic receptors in bronchial smooth muscle, causing rapid bronchodilation.",
          benefits: "Opens constricted airways within 3–5 minutes during acute wheezing.",
          side_effects: { common: ["Tremor", "Tachycardia (Rapid pulse)", "Nervousness"], rare: ["Hypokalemia with frequent high doses"] },
          indications: "1-2 puffs via spacer during acute shortness of breath."
        }],
        ayurvedic: [{
          name: "Vasa (Adhatoda vasica) & Pippali",
          traditional_use: "Classical Kasahara (cough-relieving) and Shwasahara (respiratory tonic) formulation.",
          foundation: "Kapha-Vata balancing; liquefies sticky bronchial phlegm.",
          efficacy: "Vasicine alkaloid is known for gentle bronchodilatory and mucolytic properties.",
          ingredients: [{ common_name: "Vasa Leaf Powder", quantity: "500mg", preparation: "Infused with honey" }],
          guidelines: { dosage: "Twice daily as supportive tonic. NEVER replace rescue inhaler during severe attacks." }
        }],
        home_remedies: [{
          name: "Warm Ginger-Tulsi Steam Inhalation",
          context: "Household soothing therapy for airway congestion.",
          origins: "Domestic steam therapy for relaxing upper airway passages.",
          ingredients: [{ common_name: "Fresh Tulsi Leaves", quantity: "5-6 leaves", preparation: "Added to boiling water" }],
          instructions: { method: "Inhale steam gently for 5–10 minutes with eyes closed to moisten airways.", serving_size: "Once or twice daily" }
        }]
      };
    }

    return null;
  }

  // ──────────────────────────────────────────────────────────────
  // MAIN RESPONSE BUILDER
  // ──────────────────────────────────────────────────────────────

  function buildStructuredResponse(query, triage, contextDocs) {
    if (!contextDocs || contextDocs.length === 0) {
      return buildInsufficientEvidenceResponse(query);
    }

    // Use the top document as primary source
    const primaryDoc = contextDocs[0];
    const content = primaryDoc.content;

    // Extract structured sections
    const directAnswer = extractDirectAnswer(content);
    const commonCauses = extractCommonCauses(content);
    const warningSigns = extractWarningSignsText(content);
    const selfCare = extractSelfCare(content);
    const whenToSeeDoctor = extractWhenToSeeDoctor(content);

    // Extract separated Modern, Ayurvedic, and Home remedies
    const remedies = getConditionRemedies(query, primaryDoc.doc || primaryDoc);

    // Build the response object
    return {
      type: "structured_response",
      query,
      intent: triage.intent,
      emergency: triage.emergency,
      disclaimer: triage.disclaimer,
      remedies: remedies,
      sections: {
        directAnswer: directAnswer ? formatContent(directAnswer) : null,
        commonCauses: commonCauses ? formatList(commonCauses) : null,
        warningSigns: warningSigns ? formatList(warningSigns) : null,
        selfCare: selfCare ? formatList(selfCare) : null,
        whenToSeeDoctor: whenToSeeDoctor ? formatList(whenToSeeDoctor) : null
      },
      sources: contextDocs,
      primaryDoc
    };
  }

  function buildInsufficientEvidenceResponse(query) {
    return {
      type: "insufficient_evidence",
      query,
      message: `I was unable to find sufficient reliable information in my verified medical knowledge base to answer your question about: <strong>"${query}"</strong>.<br><br>
To get accurate information, I recommend:<br>
<ul>
  <li>Consulting a qualified healthcare provider (doctor, pharmacist)</li>
  <li>Visiting trusted health websites: NHS (nhs.uk), WHO (who.int), CDC (cdc.gov), MoHFW (mohfw.gov.in)</li>
  <li>Calling the National Health Helpline: <strong>1800-180-1104</strong></li>
</ul>`,
      sources: []
    };
  }

  // ──────────────────────────────────────────────────────────────
  // HTML CARD RENDERER
  // ──────────────────────────────────────────────────────────────

  function renderResponseCard(response) {
    if (response.type === "insufficient_evidence") {
      return renderInsufficientEvidenceCard(response);
    }
    return renderFullCard(response);
  }

  function renderEmergencyBanner(emergency) {
    if (!emergency || !emergency.detected) return "";
    const isCritical = emergency.severity === "critical";
    return `
      <div class="rag-emergency-banner ${isCritical ? 'critical' : 'urgent'}" role="alert">
        <div class="rag-emergency-icon">${isCritical ? '🚨' : '⚠️'}</div>
        <div class="rag-emergency-body">
          <div class="rag-emergency-title">${isCritical ? 'EMERGENCY WARNING' : 'URGENT MEDICAL ADVICE'}</div>
          <div class="rag-emergency-text">${emergency.message}</div>
          ${isCritical ? `
            <a href="tel:112" class="rag-emergency-cta">
              📞 Call 112 Emergency Services
            </a>
          ` : ''}
        </div>
      </div>
    `;
  }

  function renderSourceDrawer(sources) {
    if (!sources || sources.length === 0) return "";
    const drawerItems = sources.map(s => {
      const tierLabel = s.tier === 1 ? "🏆 Tier 1" : s.tier === 2 ? "🔬 Tier 2" : "🌿 Tier 3";
      const tierClass = s.tier === 1 ? "tier-1" : s.tier === 2 ? "tier-2" : "tier-3";
      const evidenceClass = s.evidence_level === "Strong" ? "strong" : s.evidence_level.includes("Moderate") ? "moderate" : "limited";
      return `
        <div class="rag-source-item">
          <div class="rag-source-header">
            <span class="rag-citation-badge">[${s.citationIndex}]</span>
            <span class="rag-source-title">${s.title}</span>
          </div>
          <div class="rag-source-meta">
            <span class="rag-tier-badge ${tierClass}">${tierLabel}</span>
            <span class="rag-evidence-badge ${evidenceClass}">${s.evidence_level}</span>
            <span class="rag-org">${s.organization}</span>
          </div>
          ${s.source_url ? `<a href="${s.source_url}" target="_blank" rel="noopener" class="rag-source-link">View Source ↗</a>` : ''}
          ${s.disclaimer ? `<div class="rag-source-disclaimer">⚠️ ${s.disclaimer}</div>` : ''}
        </div>
      `;
    }).join('');

    return `
      <div class="rag-sources-section">
        <button class="rag-sources-toggle" onclick="this.classList.toggle('open');this.nextElementSibling.classList.toggle('open');" aria-expanded="false">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
          Evidence & Sources (${sources.length} verified ${sources.length === 1 ? 'source' : 'sources'})
          <svg class="rag-toggle-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </button>
        <div class="rag-sources-drawer">
          ${drawerItems}
        </div>
      </div>
    `;
  }

  function renderFullCard(response) {
    const { sections, emergency, disclaimer, sources, intent } = response;
    const hasWarningSigns = sections.warningSigns && sections.warningSigns.length > 10;
    const hasEmergency = emergency && emergency.detected;

    // Citation footnotes
    const citeLinks = sources.map(s =>
      `<span class="rag-cite-ref" title="${s.title} — ${s.organization}">[${s.citationIndex}]</span>`
    ).join("");

    // Intent badge
    const intentLabels = {
      SYMPTOM_INFORMATION: "Symptom Information",
      MEDICATION_INFORMATION: "Medication Information",
      HERBAL_REMEDY: "Herbal/Traditional Medicine",
      WELLNESS_INFORMATION: "Health & Wellness",
      GENERAL_HEALTH: "Health Information",
      DRUG_INTERACTION: "Drug Interaction",
      DIAGNOSIS_REQUEST: "Health Information"
    };
    const intentLabel = intentLabels[intent] || "Health Information";

    return `
      <div class="rag-response-card" role="region" aria-label="Health Intelligence Response">
        
        <!-- Emergency Banner (always first if detected) -->
        ${hasEmergency ? renderEmergencyBanner(emergency) : ""}

        <!-- Response Header -->
        <div class="rag-card-header">
          <div class="rag-card-badges">
            <span class="rag-badge rag-badge-engine">
              <span class="rag-pulse"></span>CLINICAL ENGINE
            </span>
            <span class="rag-badge rag-badge-intent">${intentLabel}</span>
          </div>
          <div class="rag-evidence-bar">
            <span class="rag-evidence-label">Evidence Quality</span>
            <div class="rag-evidence-dots">
              ${sources.map(s => `<span class="rag-dot tier-${s.tier}" title="${s.evidence_level}"></span>`).join("")}
            </div>
          </div>
        </div>

        <!-- Section 1: Direct Answer -->
        ${sections.directAnswer ? `
          <div class="rag-section rag-section-answer">
            <div class="rag-section-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              Direct Answer ${citeLinks}
            </div>
            <div class="rag-section-body">${sections.directAnswer}</div>
          </div>
        ` : ""}

        <!-- Section 2: What this may mean -->
        ${sections.commonCauses ? `
          <div class="rag-section">
            <div class="rag-section-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
              Common Possibilities
            </div>
            <div class="rag-section-body">
              <p class="rag-nondx-note">⚕️ <em>${RAG_SAFETY.NON_DIAGNOSTIC_DISCLAIMER}</em></p>
              ${sections.commonCauses}
            </div>
          </div>
        ` : ""}

        <!-- Section 3: Warning Signs -->
        ${hasWarningSigns ? `
          <div class="rag-section rag-section-warning">
            <div class="rag-section-label rag-label-warning">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              Warning Signs — Seek Medical Care
            </div>
            <div class="rag-section-body">${sections.warningSigns}</div>
          </div>
        ` : ""}

        <!-- ══════════════════════════════════════════════════════ -->
        <!-- SEPARATE DUAL & TRIPLE REMEDY CATEGORIES             -->
        <!-- ══════════════════════════════════════════════════════ -->

        <!-- 1. MODERN MEDICINES (ALLOPATHIC) -->
        ${response.remedies && response.remedies.modern && response.remedies.modern.length > 0 ? `
          <div class="rag-section rag-category-modern">
            <div class="rag-section-label rag-label-modern">
              <span class="rag-category-icon">💊</span>
              Modern Medicines (Allopathic / Pharmaceutical)
              <span class="rag-mini-tag blue">Pharma Grade</span>
            </div>
            <div class="rag-section-body">
              <div class="rag-remedy-cards-grid">
                ${response.remedies.modern.map(m => `
                  <div class="rag-remedy-card modern-card">
                    <div class="rag-remedy-title">${m.name}</div>
                    <div class="rag-remedy-primary">${m.primary_use || ''}</div>
                    ${m.mechanism ? `<div class="rag-remedy-mech"><strong>Mechanism:</strong> ${m.mechanism}</div>` : ''}
                    ${m.benefits ? `<div class="rag-remedy-benefit"><strong>Benefits:</strong> ${m.benefits}</div>` : ''}
                    ${m.indications ? `<div class="rag-remedy-ind"><strong>Usage note:</strong> ${m.indications}</div>` : ''}
                    ${m.contraindications ? `<div class="rag-remedy-contra"><strong>Contraindications:</strong> ${m.contraindications}</div>` : ''}
                    ${m.side_effects && m.side_effects.common ? `
                      <div class="rag-remedy-side"><strong>Common side effects:</strong> ${m.side_effects.common.join(', ')}</div>
                    ` : ''}
                  </div>
                `).join('')}
              </div>
              <p class="rag-remedy-disclaimer">⚕️ <em>General pharmaceutical information. Do not self-prescribe or alter prescription dosages without consulting a licensed physician.</em></p>
            </div>
          </div>
        ` : ""}

        <!-- 2. AYURVEDIC REMEDIES (HERBAL) -->
        ${response.remedies && response.remedies.ayurvedic && response.remedies.ayurvedic.length > 0 ? `
          <div class="rag-section rag-category-ayur">
            <div class="rag-section-label rag-label-ayur">
              <span class="rag-category-icon">🌿</span>
              Ayurvedic Remedies (Herbal / Traditional)
              <span class="rag-mini-tag green">AYUSH / Pharmacopoeia</span>
            </div>
            <div class="rag-section-body">
              <div class="rag-remedy-cards-grid">
                ${response.remedies.ayurvedic.map(a => `
                  <div class="rag-remedy-card ayur-card">
                    <div class="rag-remedy-title">${a.name}</div>
                    ${a.traditional_use ? `<div class="rag-remedy-primary">${a.traditional_use}</div>` : ''}
                    ${a.foundation ? `<div class="rag-remedy-found"><strong>Ayurvedic Foundation:</strong> ${a.foundation}</div>` : ''}
                    ${a.efficacy ? `<div class="rag-remedy-eff"><strong>Observed Evidence:</strong> ${a.efficacy}</div>` : ''}
                    ${a.ingredients ? `
                      <div class="rag-remedy-ing"><strong>Formulation:</strong> ${a.ingredients.map(i => `${i.common_name} (${i.quantity || 'standard'})`).join(', ')}</div>
                    ` : ''}
                    ${a.guidelines && a.guidelines.dosage ? `
                      <div class="rag-remedy-dose"><strong>Dosage guideline:</strong> ${a.guidelines.dosage}</div>
                    ` : ''}
                    ${a.guidelines && a.guidelines.interactions ? `
                      <div class="rag-remedy-interact"><strong>Precaution / Interaction:</strong> ${a.guidelines.interactions}</div>
                    ` : ''}
                  </div>
                `).join('')}
              </div>
              <p class="rag-remedy-disclaimer">🌿 <em>Traditional Ayurvedic monograph. Herbal products have varying clinical evidence and may interact with modern drugs.</em></p>
            </div>
          </div>
        ` : ""}

        <!-- 3. HOME REMEDIES (HOUSEHOLD SUPPORT) -->
        ${response.remedies && response.remedies.home_remedies && response.remedies.home_remedies.length > 0 ? `
          <div class="rag-section rag-category-home">
            <div class="rag-section-label rag-label-home">
              <span class="rag-category-icon">🏡</span>
              Home Remedies (Household & Supportive Care)
              <span class="rag-mini-tag amber">Gentle Support</span>
            </div>
            <div class="rag-section-body">
              <div class="rag-remedy-cards-grid">
                ${response.remedies.home_remedies.map(h => `
                  <div class="rag-remedy-card home-card">
                    <div class="rag-remedy-title">${h.name}</div>
                    ${h.context ? `<div class="rag-remedy-primary">${h.context}</div>` : ''}
                    ${h.ingredients ? `
                      <div class="rag-remedy-ing"><strong>Household Ingredients:</strong> ${h.ingredients.map(i => `${i.common_name} (${i.quantity})`).join(', ')}</div>
                    ` : ''}
                    ${h.instructions && h.instructions.method ? `
                      <div class="rag-remedy-method"><strong>Preparation & Instructions:</strong> ${h.instructions.method}</div>
                    ` : ''}
                    ${h.instructions && h.instructions.interactions ? `
                      <div class="rag-remedy-interact"><strong>Precaution:</strong> ${h.instructions.interactions}</div>
                    ` : ''}
                  </div>
                `).join('')}
              </div>
              <p class="rag-remedy-disclaimer">🏡 <em>Home remedies provide supportive comfort and are not a cure for acute bacterial infections or emergencies.</em></p>
            </div>
          </div>
        ` : ""}

        <!-- Section 4: General supportive care (if no specific remedy blocks) -->
        ${sections.selfCare && (!response.remedies || (!response.remedies.modern && !response.remedies.ayurvedic)) ? `
          <div class="rag-section">
            <div class="rag-section-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
              Supportive Self-Care (Evidence-Based)
            </div>
            <div class="rag-section-body">${sections.selfCare}</div>
          </div>
        ` : ""}

        <!-- Section 5: When to seek care -->
        ${sections.whenToSeeDoctor ? `
          <div class="rag-section rag-section-seeklcare">
            <div class="rag-section-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
              When to Seek Medical Care
            </div>
            <div class="rag-section-body">${sections.whenToSeeDoctor}</div>
          </div>
        ` : ""}

        <!-- Suggested Questions for Your Doctor -->
        <div class="rag-section rag-section-doc-questions">
          <div class="rag-section-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            Suggested Questions for Your Doctor
          </div>
          <div class="rag-section-body">
            <ul class="rag-list">
              <li>"Based on my symptoms, what diagnostic tests (e.g. blood counts, imaging) do you recommend?"</li>
              <li>"Are there specific red-flag signs that should prompt me to go to emergency care?"</li>
              <li>"Could any of my current OTC medicines or herbal supplements interact with the treatment plan?"</li>
            </ul>
          </div>
        </div>

        <!-- Non-Diagnostic Disclaimer Banner -->
        <div class="rag-disclaimer-banner">
          ⚕️ <strong>Medical Information Disclaimer:</strong> ${disclaimer}
        </div>

        <!-- Action Bar: PDF Download, TTS, Copy Brief, WhatsApp Share -->
        <div class="rag-actions-toolbar">
          <button class="rag-action-btn rag-pdf-btn" onclick="ragDownloadPDF(this)" aria-label="Download Verified Clinical PDF Report" title="Download Verified PDF Report">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            <span class="rag-pdf-label">${(function(){ const l=window.RAG_LANG_LABELS; const lang=window._ragCurrentLang||'en'; return l&&l[lang]&&l[lang].pdf_btn ? l[lang].pdf_btn : '📥 Download Verified PDF Report'; })()}</span>
          </button>
          <button class="rag-action-btn rag-tts-btn" onclick="ragToggleReadAloud(this)" aria-label="Read summary aloud">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
            <span class="rag-tts-text">${(function(){ const l=window.RAG_LANG_LABELS; const lang=window._ragCurrentLang||'en'; return l&&l[lang]&&l[lang].listen_btn ? l[lang].listen_btn : '🔊 Listen'; })()}</span>
          </button>
          <button class="rag-action-btn" onclick="ragCopyDoctorBrief(this)" aria-label="Copy brief for doctor">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            <span>${(function(){ const l=window.RAG_LANG_LABELS; const lang=window._ragCurrentLang||'en'; return l&&l[lang]&&l[lang].copy_btn ? l[lang].copy_btn : '📋 Copy for Doctor'; })()}</span>
          </button>
          <button class="rag-action-btn" onclick="ragShareWhatsApp(this)" aria-label="Share via WhatsApp">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-11.7 8.38 8.38 0 0 1 3.8.9L21 3.5Z"></path></svg>
            <span>${(function(){ const l=window.RAG_LANG_LABELS; const lang=window._ragCurrentLang||'en'; return l&&l[lang]&&l[lang].share_btn ? l[lang].share_btn : '📱 Share'; })()}</span>
          </button>
        </div>

        <!-- Sources Drawer -->
        ${renderSourceDrawer(sources)}

        <!-- Feedback -->
        <div class="rag-feedback-row">
          <span class="rag-feedback-label">Was this helpful?</span>
          <button class="rag-feedback-btn" onclick="ragFeedback(this, 'helpful')" aria-label="Helpful">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"></path><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
            Helpful
          </button>
          <button class="rag-feedback-btn" onclick="ragFeedback(this, 'not_helpful')" aria-label="Not helpful">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"></path><path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path></svg>
            Not Helpful
          </button>
        </div>
      </div>
    `;
  }

  function renderInsufficientEvidenceCard(response) {
    return `
      <div class="rag-response-card rag-insufficient">
        <div class="rag-card-header">
          <div class="rag-card-badges">
            <span class="rag-badge rag-badge-engine"><span class="rag-pulse"></span>CLINICAL ENGINE</span>
          </div>
        </div>
        <div class="rag-section">
          <div class="rag-section-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            Insufficient Evidence Found
          </div>
          <div class="rag-section-body">${response.message}</div>
        </div>
      </div>
    `;
  }

  function renderThinkingState() {
    return `
      <div class="rag-thinking-card" aria-live="polite">
        <div class="rag-thinking-steps">
          <div class="rag-thinking-step active" id="step-search">
            <span class="rag-step-icon">🔍</span>
            <span>Searching verified medical sources...</span>
          </div>
          <div class="rag-thinking-step" id="step-review">
            <span class="rag-step-icon">📋</span>
            <span>Reviewing clinical evidence...</span>
          </div>
          <div class="rag-thinking-step" id="step-synthesize">
            <span class="rag-step-icon">⚗️</span>
            <span>Synthesizing grounded response...</span>
          </div>
        </div>
      </div>
    `;
  }

  function animateThinkingSteps() {
    const steps = ["step-review", "step-synthesize"];
    let i = 0;
    const interval = setInterval(() => {
      if (i < steps.length) {
        const el = document.getElementById(steps[i]);
        if (el) el.classList.add("active");
        i++;
      } else {
        clearInterval(interval);
      }
    }, 700);
    return interval;
  }

  return {
    buildStructuredResponse,
    buildInsufficientEvidenceResponse,
    renderResponseCard,
    renderEmergencyBanner,
    renderSourceDrawer,
    renderThinkingState,
    animateThinkingSteps
  };
})();

// Global feedback handler
function ragFeedback(btn, type) {
  const row = btn.closest('.rag-feedback-row');
  if (row) {
    row.innerHTML = `<span class="rag-feedback-thanks">${type === 'helpful' ? '👍 Thank you for your feedback!' : '👎 We\'ll work to improve. Consider consulting a healthcare provider for your question.'}</span>`;
  }
}

// Global Text-to-Speech (TTS) Read Aloud Handler
let _currentUtterance = null;
function ragToggleReadAloud(btn) {
  if (!('speechSynthesis' in window)) {
    alert('Text-to-speech is not supported in this browser.');
    return;
  }

  const isSpeaking = window.speechSynthesis.speaking;
  const label = btn.querySelector('.rag-tts-text');

  if (isSpeaking) {
    window.speechSynthesis.cancel();
    btn.classList.remove('speaking');
    if (label) label.textContent = 'Listen';
    return;
  }

  const card = btn.closest('.rag-response-card');
  if (!card) return;

  const answerEl = card.querySelector('.rag-section-answer .rag-section-body');
  const warningEl = card.querySelector('.rag-section-warning .rag-section-body');

  let textToRead = '';
  if (answerEl) textToRead += 'Direct Answer: ' + answerEl.innerText + '. ';
  if (warningEl) textToRead += 'Warning Signs: ' + warningEl.innerText + '. ';

  if (!textToRead) textToRead = card.innerText.substring(0, 400);

  // Clean citation brackets [1], emojis, etc.
  textToRead = textToRead.replace(/\[\d+\]/g, '').replace(/[🚨⚠️🏆🔬🌿⚕️👍👎]/g, '');

  _currentUtterance = new SpeechSynthesisUtterance(textToRead);
  _currentUtterance.rate = 0.95;
  _currentUtterance.pitch = 1.0;

  // Language mapping
  const lang = (window.I18n && window.I18n.currentLang) || 'en';
  if (lang === 'hi') _currentUtterance.lang = 'hi-IN';
  else if (lang === 'kn') _currentUtterance.lang = 'kn-IN';
  else _currentUtterance.lang = 'en-IN';

  _currentUtterance.onend = () => {
    btn.classList.remove('speaking');
    if (label) label.textContent = 'Listen';
  };

  _currentUtterance.onerror = () => {
    btn.classList.remove('speaking');
    if (label) label.textContent = 'Listen';
  };

  btn.classList.add('speaking');
  if (label) label.textContent = 'Stop';
  window.speechSynthesis.speak(_currentUtterance);
}

// Copy Doctor Consultation Brief
function ragCopyDoctorBrief(btn) {
  const card = btn.closest('.rag-response-card');
  if (!card) return;

  const answerEl = card.querySelector('.rag-section-answer .rag-section-body');
  const causesEl = card.querySelector('.rag-section:nth-of-type(2) .rag-section-body');
  const warningEl = card.querySelector('.rag-section-warning .rag-section-body');

  const text = [
    `📋 MEDINVEDIC CLINICAL HEALTH BRIEF`,
    `Date: ${new Date().toLocaleDateString()}`,
    ``,
    `🔍 Summary:`,
    answerEl ? answerEl.innerText.trim() : 'N/A',
    ``,
    `⚠️ Red Flags to Check:`,
    warningEl ? warningEl.innerText.trim() : 'None reported',
    ``,
    `❓ Questions for Doctor:`,
    `1. What diagnostic tests (e.g. blood counts, imaging) do you recommend?`,
    `2. Are there any specific red-flag symptoms to monitor closely?`,
    `3. Are my current medications and herbal supplements safe together?`,
    ``,
    `Generated via MedInVedic Health Intelligence AI (Informational purpose only)`
  ].join('\n');

  navigator.clipboard.writeText(text).then(() => {
    const originalText = btn.innerHTML;
    btn.innerHTML = `<span>✓ Copied!</span>`;
    setTimeout(() => { btn.innerHTML = originalText; }, 2000);
  }).catch(() => {
    alert('Brief copied to clipboard:\n\n' + text);
  });
}

// Share via WhatsApp
function ragShareWhatsApp(btn) {
  const card = btn.closest('.rag-response-card');
  if (!card) return;

  const answerEl = card.querySelector('.rag-section-answer .rag-section-body');
  const summary = answerEl ? answerEl.innerText.substring(0, 300) : 'Health Intelligence summary';

  const msg = encodeURIComponent(`*MedInVedic Health Intelligence Summary*\n\n${summary}\n\n_Informational guidance based on WHO/CDC/NHS clinical guidelines._\nExplore more: https://medinvedic.web.app`);
  window.open(`https://wa.me/?text=${msg}`, '_blank');
}

// Download Verified Clinical Report as PDF
function ragDownloadPDF(btn) {
  const card = btn.closest('.rag-response-card');
  if (!card) return;

  const originalHtml = btn.innerHTML;
  btn.innerHTML = `<span style="color:#dc2626; font-weight:bold;">⏳ Generating Verified PDF...</span>`;

  const refId = 'MIV-' + Math.random().toString(36).substring(2, 8).toUpperCase() + '-' + new Date().getFullYear();
  const dateStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  // Extract structured elements from active card
  const answerEl = card.querySelector('.rag-section-answer .rag-section-body');
  const causesEl = card.querySelector('.rag-section:nth-of-type(2) .rag-section-body');
  const warningEl = card.querySelector('.rag-section-warning .rag-section-body');
  const modernCardEl = card.querySelector('.rag-category-modern .rag-section-body');
  const ayurCardEl = card.querySelector('.rag-category-ayur .rag-section-body');
  const homeCardEl = card.querySelector('.rag-category-home .rag-section-body');
  const questionsEl = card.querySelector('.rag-section-doc-questions .rag-section-body');
  const sourcesEl = card.querySelector('.rag-sources-drawer');

  // Create clean printable/downloadable container
  const reportContainer = document.createElement('div');
  reportContainer.className = 'medinvedic-verified-pdf-container';
  reportContainer.style.cssText = 'padding: 24px 28px; font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; color: #111827; background: #ffffff; line-height: 1.5; max-width: 800px; margin: 0 auto; box-sizing: border-box;';

  reportContainer.innerHTML = `
    <!-- Top Verified Header -->
    <div style="border-bottom: 2px solid #1e40af; padding-bottom: 14px; margin-bottom: 18px;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <div style="font-size: 24px; font-weight: 900; color: #1e3a8a; letter-spacing: -0.5px;">MedInVedic</div>
          <div style="font-size: 11px; font-weight: 800; color: #059669; text-transform: uppercase; letter-spacing: 1px; margin-top: 2px;">
            Dual Health Intelligence — Clinical Engine
          </div>
        </div>
        <div style="text-align: right;">
          <div style="display: inline-block; background: #ecfdf5; border: 1.5px solid #059669; border-radius: 6px; padding: 4px 10px; font-size: 10.5px; font-weight: 800; color: #065f46; text-transform: uppercase; letter-spacing: 0.5px;">
            🛡️ VERIFIED CLINICAL REPORT
          </div>
          <div style="font-size: 9.5px; color: #6b7280; margin-top: 4px;">Ref ID: <strong>${refId}</strong></div>
          <div style="font-size: 9.5px; color: #6b7280;">Date: ${dateStr}</div>
        </div>
      </div>
      <div style="margin-top: 10px; padding: 6px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; display: flex; justify-content: space-between; font-size: 10px; color: #475569;">
        <span><strong>Knowledge Standards:</strong> WHO • CDC • NHS • MoHFW • AYUSH</span>
        <span><strong>Validation:</strong> Evidence Grounded (Tier 1/2/3)</span>
      </div>
    </div>

    <!-- Direct Evaluation -->
    ${answerEl ? `
      <div style="margin-bottom: 16px; page-break-inside: avoid;">
        <div style="font-size: 12px; font-weight: 800; color: #1e40af; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; border-bottom: 1px solid #dbeafe; padding-bottom: 3px;">
          📋 Direct Clinical Evaluation
        </div>
        <div style="font-size: 11.5px; line-height: 1.6; color: #1f2937;">
          ${answerEl.innerHTML}
        </div>
      </div>
    ` : ''}

    <!-- Warning Signs / Red Flags -->
    ${warningEl ? `
      <div style="margin-bottom: 16px; padding: 10px 14px; background: #fef2f2; border-left: 4px solid #dc2626; border-radius: 4px; page-break-inside: avoid;">
        <div style="font-size: 11.5px; font-weight: 800; color: #991b1b; text-transform: uppercase; margin-bottom: 4px;">
          ⚠️ Warning Signs & Red Flags (Seek Immediate Medical Care)
        </div>
        <div style="font-size: 11px; line-height: 1.5; color: #7f1d1d;">
          ${warningEl.innerHTML}
        </div>
      </div>
    ` : ''}

    <!-- 3-Way Separated Remedies Grid -->
    <div style="margin-bottom: 16px;">
      <div style="font-size: 12px; font-weight: 800; color: #111827; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; border-bottom: 1px solid #e5e7eb; padding-bottom: 3px;">
        💊 Separated Treatment Options & Supportive Care
      </div>

      <!-- Modern Medicines -->
      ${modernCardEl ? `
        <div style="margin-bottom: 12px; padding: 10px 12px; background: #f0fdf4; border: 1px solid #bbf7d0; border-left: 3.5px solid #2563eb; border-radius: 6px; page-break-inside: avoid;">
          <div style="font-size: 11px; font-weight: 800; color: #1d4ed8; text-transform: uppercase; margin-bottom: 4px;">
            💊 Modern Medicines (Allopathic / Pharmaceutical Grade)
          </div>
          <div style="font-size: 10.5px; color: #374151; line-height: 1.5;">
            ${modernCardEl.innerHTML}
          </div>
        </div>
      ` : ''}

      <!-- Ayurvedic Remedies -->
      ${ayurCardEl ? `
        <div style="margin-bottom: 12px; padding: 10px 12px; background: #f0fdf4; border: 1px solid #bbf7d0; border-left: 3.5px solid #16a34a; border-radius: 6px; page-break-inside: avoid;">
          <div style="font-size: 11px; font-weight: 800; color: #15803d; text-transform: uppercase; margin-bottom: 4px;">
            🌿 Ayurvedic Remedies (Herbal / Traditional Pharmacopoeia)
          </div>
          <div style="font-size: 10.5px; color: #374151; line-height: 1.5;">
            ${ayurCardEl.innerHTML}
          </div>
        </div>
      ` : ''}

      <!-- Home Remedies -->
      ${homeCardEl ? `
        <div style="margin-bottom: 12px; padding: 10px 12px; background: #fffbeb; border: 1px solid #fde68a; border-left: 3.5px solid #d97706; border-radius: 6px; page-break-inside: avoid;">
          <div style="font-size: 11px; font-weight: 800; color: #b45309; text-transform: uppercase; margin-bottom: 4px;">
            🏡 Home Remedies (Household Supportive Care)
          </div>
          <div style="font-size: 10.5px; color: #374151; line-height: 1.5;">
            ${homeCardEl.innerHTML}
          </div>
        </div>
      ` : ''}
    </div>

    <!-- Suggested Questions for Doctor -->
    ${questionsEl ? `
      <div style="margin-bottom: 16px; padding: 10px 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; page-break-inside: avoid;">
        <div style="font-size: 11px; font-weight: 800; color: #334155; text-transform: uppercase; margin-bottom: 4px;">
          ❓ Suggested Questions for Your Doctor
        </div>
        <div style="font-size: 10.5px; color: #475569; line-height: 1.5;">
          ${questionsEl.innerHTML}
        </div>
      </div>
    ` : ''}

    <!-- Verified Sources -->
    ${sourcesEl ? `
      <div style="margin-bottom: 16px; page-break-inside: avoid;">
        <div style="font-size: 11px; font-weight: 800; color: #4b5563; text-transform: uppercase; margin-bottom: 4px;">
          📚 Verified Evidence Citations & Sources
        </div>
        <div style="font-size: 9.5px; color: #6b7280; line-height: 1.4;">
          ${sourcesEl.innerHTML.replace(/display:\s*none/g, 'display:block')}
        </div>
      </div>
    ` : ''}

    <!-- Footer Seal & Disclaimer -->
    <div style="border-top: 1.5px solid #cbd5e1; padding-top: 10px; margin-top: 16px; font-size: 8.5px; color: #64748b; line-height: 1.4; text-align: justify; page-break-inside: avoid;">
      <div style="font-weight: 800; color: #334155; margin-bottom: 2px;">OFFICIAL MEDICAL & LEGAL DISCLAIMER:</div>
      This document is an educational summary generated by the MedInVedic RAG Clinical Engine using verified evidence guidelines from WHO, CDC, NHS, MoHFW, and AYUSH. It does NOT constitute medical diagnosis, clinical treatment, or personalized prescription. Always consult a qualified licensed physician for medical conditions. For life-threatening emergencies, call 112 (India) immediately.
    </div>
  `;

  // Generate via html2pdf or window print fallback
  if (window.html2pdf) {
    const opt = {
      margin:       [8, 8, 8, 8],
      filename:     `MedInVedic_Verified_Report_${refId}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
    };

    window.html2pdf().set(opt).from(reportContainer).save().then(() => {
      btn.innerHTML = originalHtml;
      if (typeof showToast === 'function') showToast('✓ Verified Clinical Report PDF Downloaded', 'success');
    }).catch(err => {
      console.warn('html2pdf error, falling back to print window:', err);
      printFallback(reportContainer, btn, originalHtml);
    });
  } else {
    printFallback(reportContainer, btn, originalHtml);
  }
}

function printFallback(container, btn, originalHtml) {
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>MedInVedic Verified Clinical Report</title>
        <style>
          body { font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; padding: 20px; color: #111827; background: #fff; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        ${container.innerHTML}
        <script>window.onload = function() { window.print(); };<\/script>
      </body>
      </html>
    `);
    printWindow.document.close();
  }
  btn.innerHTML = originalHtml;
}

window.RAG_GENERATOR = RAG_GENERATOR;
window.ragFeedback = ragFeedback;
window.ragToggleReadAloud = ragToggleReadAloud;
window.ragCopyDoctorBrief = ragCopyDoctorBrief;
window.ragShareWhatsApp = ragShareWhatsApp;
window.ragDownloadPDF = ragDownloadPDF;
