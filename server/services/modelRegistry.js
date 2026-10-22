/**
 * server/services/modelRegistry.js — MedInVedic AI Model Registry
 * ══════════════════════════════════════════════════════════════════
 * Server-side model registry and validation service.
 * Enforces server-side allowlist, capability checks, healthcare guardrails,
 * effort setting support, image support, and access tier validation.
 */

const MODEL_REGISTRY = {
  'medinvedic-expert': {
    id: 'medinvedic-expert',
    name: 'MedInVedic Expert',
    category: 'Premium — AI Diagnostic & Wellness Suites',
    badge: 'Premium',
    shortDescription: 'For complex healthcare questions',
    description: 'For complex healthcare questions and evidence-based explanations.',
    providerModelId: 'gemini-1.5-pro',
    provider: 'Google Gemini',
    enabled: true,
    isDefault: false,
    accessRequirement: 'premium', // 'free' | 'standard' | 'premium'
    capabilities: [
      'rag',
      'deep_clinical_reasoning',
      'multimodal',
      'vision',
      'ayurvedic_synthesis',
      'multi_source_comparison'
    ],
    supportedLanguages: ['en', 'hi', 'kn', 'ta', 'te', 'mr', 'bn', 'gu', 'ml'],
    imageSupport: true,
    maxContextTokens: 32768,
    supportedEfforts: ['low', 'medium', 'high'],
    defaultEffort: 'medium',
    retrievalTopK: 8,
    temperature: 0.15,
    maxTokens: 4096,
    usageLimits: {
      requestsPerMinute: 20,
      dailyQuota: 500
    }
  },

  'medinvedic-advanced': {
    id: 'medinvedic-advanced',
    name: 'MedInVedic Advanced',
    category: 'Advanced Healthcare Workflows',
    badge: null,
    shortDescription: 'For detailed research and evidence-based answers',
    description: 'For detailed research, multi-step queries, and comprehensive health information.',
    providerModelId: 'gemini-1.5-flash-advanced',
    provider: 'Google Gemini',
    enabled: true,
    isDefault: false,
    accessRequirement: 'standard',
    capabilities: [
      'rag',
      'multi_step_retrieval',
      'source_comparison',
      'multimodal',
      'vision'
    ],
    supportedLanguages: ['en', 'hi', 'kn', 'ta', 'te', 'mr', 'bn', 'gu', 'ml'],
    imageSupport: true,
    maxContextTokens: 16384,
    supportedEfforts: ['low', 'medium', 'high'],
    defaultEffort: 'medium',
    retrievalTopK: 6,
    temperature: 0.2,
    maxTokens: 2048,
    usageLimits: {
      requestsPerMinute: 40,
      dailyQuota: 1000
    }
  },

  'medinvedic-balanced': {
    id: 'medinvedic-balanced',
    name: 'MedInVedic Balanced',
    category: 'AI Health Score & Analytics',
    badge: null,
    shortDescription: 'Best for everyday health information',
    description: 'Best balance of answer quality, speed, and cost for everyday health queries.',
    providerModelId: 'gemini-1.5-flash',
    provider: 'Google Gemini',
    enabled: true,
    isDefault: true,
    accessRequirement: 'free',
    capabilities: [
      'rag',
      'general_health',
      'ayurvedic_guidance',
      'multimodal',
      'vision'
    ],
    supportedLanguages: ['en', 'hi', 'kn', 'ta', 'te', 'mr', 'bn', 'gu', 'ml'],
    imageSupport: true,
    maxContextTokens: 8192,
    supportedEfforts: ['low', 'medium'],
    defaultEffort: 'medium',
    retrievalTopK: 5,
    temperature: 0.2,
    maxTokens: 1024,
    usageLimits: {
      requestsPerMinute: 60,
      dailyQuota: 2000
    }
  },

  'medinvedic-quick': {
    id: 'medinvedic-quick',
    name: 'MedInVedic Quick',
    category: 'Health Intelligence AI',
    badge: null,
    shortDescription: 'Fast answers to simpler questions',
    description: 'Fast responses for basic health education, terminology explanations, and general wellness information.',
    providerModelId: 'gemini-1.5-flash-fast',
    provider: 'Google Gemini',
    enabled: true,
    isDefault: false,
    accessRequirement: 'free',
    capabilities: [
      'rag',
      'terminology_lookup',
      'general_wellness',
      'quick_faq'
    ],
    supportedLanguages: ['en', 'hi', 'kn', 'ta', 'te', 'mr', 'bn', 'gu', 'ml'],
    imageSupport: false, // Explicitly text-only for high throughput
    maxContextTokens: 4096,
    supportedEfforts: ['low'],
    defaultEffort: 'low',
    retrievalTopK: 3,
    temperature: 0.2,
    maxTokens: 512,
    usageLimits: {
      requestsPerMinute: 90,
      dailyQuota: 5000
    }
  }
};

class ModelRegistryService {
  /**
   * Check if AI model selector feature flag is enabled.
   */
  static isFeatureEnabled() {
    return process.env.AI_MODEL_SELECTOR_ENABLED !== 'false';
  }

  /**
   * Get default model ID.
   */
  static getDefaultModelId() {
    const defaultModel = Object.values(MODEL_REGISTRY).find(m => m.isDefault && m.enabled);
    return defaultModel ? defaultModel.id : 'medinvedic-balanced';
  }

  /**
   * Get full model configuration by ID.
   */
  static getModel(modelId) {
    if (!modelId || typeof modelId !== 'string') return null;
    return MODEL_REGISTRY[modelId.trim().toLowerCase()] || null;
  }

  /**
   * Validate model identifier against server-side allowlist.
   */
  static validateModel(modelId) {
    if (!modelId) {
      return {
        valid: true,
        model: MODEL_REGISTRY[this.getDefaultModelId()],
        isDefaultFallback: true
      };
    }

    const normalizedId = String(modelId).trim().toLowerCase();
    const model = MODEL_REGISTRY[normalizedId];

    if (!model) {
      return {
        valid: false,
        error: `Unknown model identifier '${modelId}'. Allowed models: ${Object.keys(MODEL_REGISTRY).join(', ')}`,
        code: 'INVALID_MODEL',
        allowedModels: Object.keys(MODEL_REGISTRY)
      };
    }

    if (!model.enabled) {
      return {
        valid: false,
        error: `Model '${model.name}' is currently disabled in system configuration.`,
        code: 'MODEL_DISABLED',
        model
      };
    }

    return {
      valid: true,
      model
    };
  }

  /**
   * Validate user access rights for the model (free, standard, premium).
   */
  static validateAccess(model, user = null) {
    if (!model) return { granted: false, reason: 'Invalid model' };
    if (model.accessRequirement === 'free') return { granted: true };

    // If no user provided, standard is permitted for public web demo, but premium requires verified tier
    if (!user) {
      if (model.accessRequirement === 'premium') {
        return {
          granted: false,
          requiresUpgrade: true,
          reason: `${model.name} requires an active MedInVedic Premium membership.`,
          upgradeUrl: '/pages/payment.html'
        };
      }
      return { granted: true };
    }

    // Check admin / super_admin role
    if (['admin', 'super_admin'].includes(user.role)) {
      return { granted: true };
    }

    // Check membership tier
    const tier = (user.membership || '').toLowerCase();
    const isPremiumUser = tier === 'gold' || tier === 'platinum' || user.is_premium === 1 || user.is_premium === true;

    if (model.accessRequirement === 'premium' && !isPremiumUser) {
      return {
        granted: false,
        requiresUpgrade: true,
        reason: `${model.name} is reserved for MedInVedic Premium members (Gold/Platinum).`,
        upgradeUrl: '/pages/payment.html'
      };
    }

    return { granted: true };
  }

  /**
   * Validate if the model can process multimodal/image inputs.
   */
  static validateImageSupport(model) {
    if (!model) return { supported: false, error: 'Model not found' };
    if (!model.imageSupport) {
      return {
        supported: false,
        error: `${model.name} does not support image analysis. Please switch to MedInVedic Balanced, Advanced, or Expert.`,
        recommendedModels: ['medinvedic-balanced', 'medinvedic-advanced', 'medinvedic-expert']
      };
    }
    return { supported: true };
  }

  /**
   * Resolve and sanitize response effort setting.
   */
  static resolveEffort(model, effortInput) {
    if (!model) return 'medium';
    const effort = String(effortInput || '').trim().toLowerCase();
    if (model.supportedEfforts.includes(effort)) {
      return effort;
    }
    return model.defaultEffort || 'medium';
  }

  /**
   * Returns list of client-facing model profiles (safe, secrets excluded).
   */
  static listModelsForClient(user = null, currentModelId = null) {
    const currentId = currentModelId || this.getDefaultModelId();

    return Object.values(MODEL_REGISTRY).map(m => {
      const accessCheck = this.validateAccess(m, user);

      return {
        id: m.id,
        name: m.name,
        category: m.category,
        badge: m.badge,
        shortDescription: m.shortDescription,
        description: m.description,
        enabled: m.enabled,
        isDefault: m.isDefault,
        isSelected: m.id === currentId,
        accessRequirement: m.accessRequirement,
        accessGranted: accessCheck.granted,
        requiresUpgrade: !!accessCheck.requiresUpgrade,
        imageSupport: m.imageSupport,
        supportedEfforts: m.supportedEfforts,
        defaultEffort: m.defaultEffort,
        capabilities: m.capabilities
      };
    });
  }

  /**
   * Build execution configuration for RAG query based on model and effort.
   */
  static getExecutionConfig(modelId, effortInput) {
    const validation = this.validateModel(modelId);
    const model = validation.valid ? validation.model : MODEL_REGISTRY[this.getDefaultModelId()];
    const effort = this.resolveEffort(model, effortInput);

    let topK = model.retrievalTopK;
    let temperature = model.temperature;
    let maxTokens = model.maxTokens;

    if (effort === 'low') {
      topK = Math.max(2, topK - 2);
      maxTokens = Math.floor(maxTokens * 0.75);
    } else if (effort === 'high') {
      topK = topK + 2;
      maxTokens = Math.floor(maxTokens * 1.25);
    }

    return {
      modelProfileId: model.id,
      displayName: model.name,
      providerModelId: model.providerModelId,
      provider: model.provider,
      effort,
      topK,
      temperature,
      maxTokens,
      imageSupport: model.imageSupport,
      capabilities: model.capabilities
    };
  }
}

module.exports = {
  MODEL_REGISTRY,
  ModelRegistryService
};
