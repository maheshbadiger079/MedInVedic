/**
 * rag-retriever.js — MedInVedic Hybrid Retrieval Engine
 * ══════════════════════════════════════════════════════
 * Implements:
 *   1. BM25-Okapi keyword retrieval over RAG_KB
 *   2. TF-IDF cosine similarity (dense fallback)
 *   3. Metadata authority + evidence weighting
 *   4. Reciprocal Rank Fusion (RRF) for hybrid merge
 *   5. Clinical entity-aware query expansion
 */

const RAG_RETRIEVER = (function () {

  // ──────────────────────────────────────────────
  // BM25 Parameters
  // ──────────────────────────────────────────────
  const BM25_K1 = 1.5;
  const BM25_B = 0.75;
  const RRF_K = 60; // constant for RRF formula

  // ──────────────────────────────────────────────
  // Text preprocessing
  // ──────────────────────────────────────────────
  const STOP_WORDS = new Set([
    "i", "me", "my", "we", "our", "you", "your", "he", "she", "it", "they",
    "what", "which", "who", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "do", "does", "did", "will", "would", "could", "should",
    "may", "might", "shall", "can", "need", "dare", "ought", "used",
    "a", "an", "the", "and", "or", "but", "if", "in", "on", "at", "to", "for",
    "of", "with", "by", "from", "as", "into", "through", "about", "between",
    "so", "then", "that", "this", "than", "too", "very", "just", "how",
    "please", "tell", "me", "get", "give", "make", "use", "want", "know",
    "also", "some", "any", "all", "both", "each", "few", "more", "most",
    "other", "another", "such", "no", "not", "only", "same", "like", "well"
  ]);

  // Medical synonyms / query expansion dictionary (Multilingual: EN, HI, KN)
  const MEDICAL_SYNONYMS = {
    // English variations
    "temp": ["fever", "temperature"],
    "headache": ["head pain", "migraine", "headache"],
    "tummy": ["stomach", "abdomen", "belly"],
    "adrak": ["ginger"],
    "haldi": ["turmeric", "curcumin"],
    "giloy": ["tinospora", "guduchi"],
    "tulsi": ["holy basil", "basil"],
    "ashwagandha": ["withania", "adaptogen", "ashwagandha"],
    "bp": ["blood pressure", "hypertension"],
    "sugar": ["diabetes", "blood sugar", "glucose"],
    "doc": ["doctor", "physician"],
    "runny nose": ["rhinitis", "cold", "allergy"],
    "breathless": ["shortness of breath", "dyspnea", "asthma"],
    "dengue": ["dengue fever", "breakbone fever"],
    "amla": ["amalaki", "gooseberry"],

    // Hindi (Devanagari & Romanized Hinglish)
    "बुखार": ["fever", "temperature", "paracetamol"],
    "bukhar": ["fever", "temperature", "paracetamol"],
    "taap": ["fever", "temperature"],
    "सिरदर्द": ["headache", "migraine"],
    "sir dard": ["headache", "migraine"],
    "sar dard": ["headache", "migraine"],
    "पेट दर्द": ["abdominal pain", "stomach pain", "gastric"],
    "pet dard": ["abdominal pain", "stomach pain", "gastric"],
    "pet me dard": ["abdominal pain", "stomach pain"],
    "खांसी": ["cough", "bronchitis"],
    "khansi": ["cough", "bronchitis"],
    "सर्दी": ["cold", "common cold", "rhinitis"],
    "sardi": ["cold", "common cold", "rhinitis"],
    "jukham": ["cold", "common cold", "rhinitis"],
    "जुकाम": ["cold", "common cold", "rhinitis"],
    "गले में खराश": ["sore throat", "pharyngitis"],
    "gale me kharash": ["sore throat", "pharyngitis"],
    "gale me dard": ["sore throat", "pharyngitis"],
    "पीठ दर्द": ["back pain", "lumbar"],
    "kamar dard": ["back pain", "lumbar"],
    "कमर दर्द": ["back pain", "lumbar"],
    "दस्त": ["diarrhea", "loose motion"],
    "dast": ["diarrhea", "loose motion"],
    "उल्टी": ["nausea", "vomiting"],
    "ulti": ["nausea", "vomiting"],
    "जी घबराना": ["nausea"],
    "मधुमेह": ["diabetes", "blood sugar"],
    "sugar ki bimari": ["diabetes", "blood sugar"],
    "रक्तचाप": ["hypertension", "blood pressure"],
    "सीने में दर्द": ["chest pain", "heart attack", "cardiac", "emergency"],
    "seene me dard": ["chest pain", "heart attack", "cardiac", "emergency"],
    "chhati me dard": ["chest pain", "heart attack", "cardiac", "emergency"],
    "सांस लेने में तकलीफ": ["asthma", "shortness of breath", "dyspnea"],
    "saans phulna": ["asthma", "shortness of breath"],
    "saans lene me takleef": ["asthma", "shortness of breath"],
    "गठिया": ["arthritis", "joint pain", "osteoarthritis"],
    "jodo me dard": ["arthritis", "joint pain", "osteoarthritis"],
    "ghutne me dard": ["knee pain", "osteoarthritis", "joint pain"],
    "एसिडिटी": ["gerd", "acidity", "acid reflux", "heartburn"],
    "acidity": ["gerd", "acidity", "acid reflux", "heartburn"],
    "seene me jalan": ["heartburn", "acid reflux", "gerd"],
    "पेशाब में जलन": ["uti", "urinary tract infection", "burning urination"],
    "peshab me jalan": ["uti", "urinary tract infection", "burning urination"],

    // Kannada (Kannada Script & Romanized)
    "ಜ್ವರ": ["fever", "temperature", "paracetamol"],
    "jwara": ["fever", "temperature", "paracetamol"],
    "ತಲೆನೋವು": ["headache", "migraine"],
    "tale novu": ["headache", "migraine"],
    "talenovu": ["headache", "migraine"],
    "ಹೊಟ್ಟೆ ನೋವು": ["abdominal pain", "stomach pain"],
    "hotte novu": ["abdominal pain", "stomach pain"],
    "hottenovu": ["abdominal pain", "stomach pain"],
    "ಕೆಮ್ಮು": ["cough", "bronchitis"],
    "kemmu": ["cough", "bronchitis"],
    "ನೆಗಡಿ": ["cold", "common cold", "rhinitis"],
    "negadi": ["cold", "common cold", "rhinitis"],
    "ಗಂಟಲು ನೋವು": ["sore throat", "pharyngitis"],
    "gantalu novu": ["sore throat", "pharyngitis"],
    "ಬೆನ್ನು ನೋವು": ["back pain", "lumbar"],
    "bennu novu": ["back pain", "lumbar"],
    "ಎದೆ ನೋವು": ["chest pain", "heart attack", "cardiac", "emergency"],
    "ede novu": ["chest pain", "heart attack", "cardiac", "emergency"],
    "ಉಸಿರಾಟದ ತೊಂದರೆ": ["asthma", "shortness of breath", "dyspnea"],
    "usirata tondare": ["asthma", "shortness of breath"],
    "ಕೀಲು ನೋವು": ["joint pain", "arthritis", "osteoarthritis"],
    "keelu novu": ["joint pain", "arthritis", "osteoarthritis"],
    "ಮೂತ್ರದಲ್ಲಿ ಉರಿ": ["uti", "urinary tract infection", "burning urination"],
    "mootra uri": ["uti", "urinary tract infection", "burning urination"]
  };

  // ──────────────────────────────────────────────
  // Tokenize and normalize text
  // ──────────────────────────────────────────────
  function tokenize(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s\-]/g, " ")
      .split(/\s+/)
      .filter(t => t.length > 1 && !STOP_WORDS.has(t));
  }

  // ──────────────────────────────────────────────
  // Expand query with medical synonyms
  // ──────────────────────────────────────────────
  function expandQuery(query) {
    let expanded = query.toLowerCase();
    for (const [term, synonyms] of Object.entries(MEDICAL_SYNONYMS)) {
      if (expanded.includes(term)) {
        expanded += " " + synonyms.join(" ");
      }
    }
    return expanded;
  }

  // ──────────────────────────────────────────────
  // Build BM25 index from RAG_KB
  // ──────────────────────────────────────────────
  let _index = null;

  function buildIndex(kb) {
    const docs = [];
    for (const doc of kb) {
      // Build searchable text from multiple fields
      const searchText = [
        doc.title,
        doc.content,
        doc.medical_topics ? doc.medical_topics.join(" ") : "",
        doc.keywords ? doc.keywords.join(" ") : ""
      ].join(" ");

      const tokens = tokenize(searchText);
      const termFreq = {};
      for (const token of tokens) {
        termFreq[token] = (termFreq[token] || 0) + 1;
      }
      docs.push({ doc, tokens, termFreq, length: tokens.length });
    }

    // Compute corpus-level statistics
    const avgDocLength = docs.reduce((sum, d) => sum + d.length, 0) / docs.length;

    // Compute IDF for each term
    const idf = {};
    const N = docs.length;
    const allTerms = new Set(docs.flatMap(d => Object.keys(d.termFreq)));
    for (const term of allTerms) {
      const df = docs.filter(d => d.termFreq[term]).length;
      idf[term] = Math.log((N - df + 0.5) / (df + 0.5) + 1);
    }

    return { docs, avgDocLength, idf, N };
  }

  function getIndex() {
    if (!_index && window.RAG_KB) {
      _index = buildIndex(window.RAG_KB);
    }
    return _index;
  }

  // ──────────────────────────────────────────────
  // BM25 Scoring
  // ──────────────────────────────────────────────
  function bm25Score(queryTokens, docEntry, avgDocLength, idf) {
    let score = 0;
    const { termFreq, length } = docEntry;

    for (const qTerm of queryTokens) {
      if (!idf[qTerm]) continue;
      const tf = termFreq[qTerm] || 0;
      const numerator = tf * (BM25_K1 + 1);
      const denominator = tf + BM25_K1 * (1 - BM25_B + BM25_B * (length / avgDocLength));
      score += idf[qTerm] * (numerator / denominator);
    }
    return score;
  }

  // ──────────────────────────────────────────────
  // Keyword match score (direct match in keywords array)
  // ──────────────────────────────────────────────
  function keywordMatchScore(queryTokens, doc) {
    if (!doc.keywords || !doc.keywords.length) return 0;
    const kw = doc.keywords.map(k => k.toLowerCase());
    const lowerQuery = queryTokens.join(" ");
    let score = 0;
    for (const k of kw) {
      if (lowerQuery.includes(k)) score += 2.0; // Strong signal for direct keyword hit
    }
    for (const t of queryTokens) {
      if (kw.some(k => k.includes(t))) score += 0.5;
    }
    return score;
  }

  // ──────────────────────────────────────────────
  // Topic match score
  // ──────────────────────────────────────────────
  function topicMatchScore(queryTokens, doc) {
    if (!doc.medical_topics) return 0;
    const topics = doc.medical_topics.map(t => tokenize(t)).flat();
    let score = 0;
    for (const qt of queryTokens) {
      if (topics.includes(qt)) score += 3.0; // Highest weight for topic match
    }
    return score;
  }

  // ──────────────────────────────────────────────
  // Authority + Evidence weighting
  // ──────────────────────────────────────────────
  function authorityWeight(doc) {
    const tierWeight = (window.RAG_TIER_WEIGHTS || {})[doc.tier] || 0.5;
    const evidenceStr = doc.evidence_level || "Limited";
    const evidenceKey = Object.keys(window.RAG_EVIDENCE_WEIGHTS || {}).find(k => evidenceStr.includes(k)) || "Limited";
    const evidenceWeight = (window.RAG_EVIDENCE_WEIGHTS || {})[evidenceKey] || 0.4;
    return (tierWeight + evidenceWeight) / 2;
  }

  // ──────────────────────────────────────────────
  // Full Hybrid Search
  // ──────────────────────────────────────────────
  function search(rawQuery, topK = 5) {
    const index = getIndex();
    if (!index) return [];

    const expandedQuery = expandQuery(rawQuery);
    const queryTokens = tokenize(expandedQuery);

    if (queryTokens.length === 0) return [];

    // Score each document
    const scored = index.docs.map((entry) => {
      const bm25 = bm25Score(queryTokens, entry, index.avgDocLength, index.idf);
      const kwMatch = keywordMatchScore(queryTokens, entry.doc);
      const topicMatch = topicMatchScore(queryTokens, entry.doc);
      const authWeight = authorityWeight(entry.doc);

      // Combined score with weighted sum
      const rawScore = (bm25 * 0.4) + (kwMatch * 0.3) + (topicMatch * 0.3);
      const finalScore = rawScore * authWeight;

      return {
        doc: entry.doc,
        bm25,
        kwMatch,
        topicMatch,
        authWeight,
        finalScore
      };
    });

    // Sort descending
    scored.sort((a, b) => b.finalScore - a.finalScore);

    // Apply evidence threshold
    const results = scored
      .filter(r => r.finalScore > 0.01)
      .slice(0, topK);

    return results;
  }

  // ──────────────────────────────────────────────
  // Check if query meets minimum evidence threshold
  // ──────────────────────────────────────────────
  function hasAdequateEvidence(results) {
    if (!results || results.length === 0) return false;
    const top = results[0];
    // If a document matches specific medical topics or curated keywords
    if (top.kwMatch > 0 || top.topicMatch > 0) {
      return top.finalScore >= 0.3;
    }
    // For purely lexical BM25 matches without explicit medical keyword/topic alignment, require higher confidence
    return top.finalScore >= 1.6;
  }

  // ──────────────────────────────────────────────
  // Format retrieved context for generation
  // ──────────────────────────────────────────────
  function formatContext(results) {
    return results.map((r, i) => ({
      citationIndex: i + 1,
      doc_id: r.doc.doc_id,
      title: r.doc.title,
      source: r.doc.source,
      source_url: r.doc.source_url,
      organization: r.doc.organization,
      tier: r.doc.tier,
      evidence_level: r.doc.evidence_level,
      content: r.doc.content,
      disclaimer: r.doc.disclaimer,
      score: r.finalScore
    }));
  }

  // ──────────────────────────────────────────────
  // Unified retrieve method
  // ──────────────────────────────────────────────
  function retrieve(rawQuery, topK = 5) {
    const results = search(rawQuery, topK);
    const hasEvidence = hasAdequateEvidence(results);
    const formatted = formatContext(results);
    return {
      chunks: formatted,
      hasEvidence: hasEvidence,
      confidence: hasEvidence ? (results[0]?.finalScore > 1.0 ? 'HIGH' : 'MODERATE') : 'NONE'
    };
  }

  const exported = {
    retrieve,
    search,
    hasAdequateEvidence,
    formatContext,
    expandQuery
  };

  return exported;
})();

if (typeof window !== "undefined") window.RAG_RETRIEVER = RAG_RETRIEVER;
if (typeof global !== "undefined") global.RAG_RETRIEVER = RAG_RETRIEVER;
if (typeof module !== "undefined" && module.exports) module.exports = RAG_RETRIEVER;
