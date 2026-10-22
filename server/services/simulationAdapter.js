/**
 * server/services/simulationAdapter.js
 * Replaceable Simulation Engine Adapter Interface
 * ─────────────────────────────────────────────────────────────────
 * Allows MedInVedic to run its clean-room native engine (default)
 * or connect via network API to an optional external MiroFish engine instance.
 * 
 * Complies strictly with AGPL isolation guidelines by keeping network
 * calls separated via standard HTTP JSON boundaries without bundling AGPL code.
 * ─────────────────────────────────────────────────────────────────
 */

const { defaultSimulationEngine } = require('./simulationEngine');

class BaseSimulationAdapter {
  async createJob(ownerId, scenarioInput) {
    throw new Error('createJob must be implemented by adapter subclass');
  }

  async runSimulation(job) {
    throw new Error('runSimulation must be implemented by adapter subclass');
  }

  async askAgent(job, agentId, question) {
    throw new Error('askAgent must be implemented by adapter subclass');
  }
}

/**
 * 1. Native Clean-Room Engine Adapter (Default & Recommended)
 * Fully MIT compliant, zero external AGPL dependency.
 */
class NativeSimulationAdapter extends BaseSimulationAdapter {
  constructor(engine = defaultSimulationEngine) {
    super();
    this.engine = engine;
    this.engineType = 'NATIVE_MEDINVEDIC_CLEAN_ROOM';
  }

  async createJob(ownerId, scenarioInput) {
    return this.engine.createSimulationJob(ownerId, scenarioInput);
  }

  async runSimulation(job, onProgress) {
    return this.engine.executeSimulation(job, onProgress);
  }

  async askAgent(job, agentId, question) {
    return this.engine.askAgentQuestion(job, agentId, question);
  }
}

/**
 * 2. External MiroFish HTTP Adapter (Optional / Future Evaluation)
 * Connects to a completely separate, independently hosted MiroFish daemon
 * over an isolated network HTTP interface.
 */
class MiroFishExternalAdapter extends BaseSimulationAdapter {
  constructor(options = {}) {
    super();
    this.baseUrl = options.baseUrl || process.env.MIROFISH_SERVICE_URL || 'http://localhost:5001';
    this.apiKey = options.apiKey || process.env.MIROFISH_API_KEY || '';
    this.engineType = 'EXTERNAL_MIROFISH_SERVICE';
    this.enabled = process.env.ENABLE_EXTERNAL_MIROFISH === 'true';
  }

  async createJob(ownerId, scenarioInput) {
    if (!this.enabled) {
      throw new Error('External MiroFish service is currently disabled by feature flag.');
    }
    // Remote proxy implementation placeholder
    throw new Error('External MiroFish adapter is configured for staging evaluation only.');
  }

  async runSimulation(job, onProgress) {
    if (!this.enabled) {
      throw new Error('External MiroFish service is currently disabled by feature flag.');
    }
    throw new Error('External MiroFish adapter is configured for staging evaluation only.');
  }

  async askAgent(job, agentId, question) {
    if (!this.enabled) {
      throw new Error('External MiroFish service is currently disabled by feature flag.');
    }
    throw new Error('External MiroFish adapter is configured for staging evaluation only.');
  }
}

// Factory function
function getSimulationAdapter(providerType = process.env.SIMULATION_PROVIDER || 'native') {
  if (providerType === 'mirofish_external') {
    return new MiroFishExternalAdapter();
  }
  return new NativeSimulationAdapter();
}

module.exports = {
  BaseSimulationAdapter,
  NativeSimulationAdapter,
  MiroFishExternalAdapter,
  getSimulationAdapter
};
