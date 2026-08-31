/**
 * VedicMind AI — Domain Router
 * 
 * Strict Domain Isolation:
 * - HEALTH_AI: Medicine, Ayurveda, Symptoms, Treatment, Doctors, Doshas, Clinics
 * - VEDICMIND_AI: Math, Vedic Mathematics, Sutras, Calculations, Multiplication, Squares, Reasoning, Aptitude, Exams
 * - AMBIGUOUS: Prompts user to choose between Health and VedicMind
 */
class AiDomainRouter {
  static classifyDomain(query) {
    const q = String(query).toLowerCase().trim();

    const healthKeywords = [
      'fever', 'headache', 'pain', 'dose', 'dosage', 'tablet', 'syrup', 'ayurved', 'dosha',
      'vata', 'pitta', 'kapha', 'medicine', 'medic', 'prescription', 'doctor', 'clinic',
      'treatment', 'symptom', 'disease', 'blood pressure', 'diabetes', 'side effect', 'remedy',
      'remedies', 'herbal', 'herb', 'ashwagandha', 'tulsi', 'triphala', 'paracetamol', 'metformin',
      'dermatology', 'skin', 'wellness', 'health'
    ];

    const vedicKeywords = [
      'multiply', 'multiplication', 'divide', 'division', 'square', 'squaring', 'square root',
      'sutra', 'nikhilam', 'ekadhikena', 'urdhva', 'tiryagbhyam', 'anurupyena', 'paravartya',
      'algebra', 'fraction', 'percentage', 'math', 'mathematics', 'calculate', 'calculation',
      'speed math', 'mental math', 'exam prep', 'olympiad', 'aptitude', 'reasoning', 'geometry',
      'equation', 'bodmas', 'vedic math', 'vedic mathematics', 'quiz', 'xp', 'streak'
    ];

    const hasHealth = healthKeywords.some(k => q.includes(k));
    const hasMath = vedicKeywords.some(k => q.includes(k)) || 
                    /\bvedic\b/.test(q) && !q.includes('ayurved') || 
                    /[0-9]+\s*[*x×+/÷^-]\s*[0-9]+/.test(q);

    if (hasMath && !hasHealth) {
      return {
        domain: 'VEDICMIND_AI',
        confidence: 0.98,
        recommendedAgent: 'TutorAgent',
        ragNamespace: 'vedic_documents'
      };
    }

    if (hasHealth && !hasMath) {
      return {
        domain: 'HEALTH_AI',
        confidence: 0.98,
        recommendedAgent: 'HealthConsultantAgent',
        ragNamespace: 'health_documents'
      };
    }

    if (hasHealth && hasMath) {
      return {
        domain: 'AMBIGUOUS',
        confidence: 0.5,
        clarificationPrompt: 'Are you asking about health dosage calculation or Vedic mathematics learning?'
      };
    }

    return {
      domain: 'VEDICMIND_AI',
      confidence: 0.75,
      recommendedAgent: 'TutorAgent',
      ragNamespace: 'vedic_documents'
    };
  }
}

module.exports = AiDomainRouter;
