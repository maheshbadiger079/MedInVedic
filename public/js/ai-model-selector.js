/**
 * ai-model-selector.js — MedInVedic AI Model Selector Client
 * ══════════════════════════════════════════════════════════════
 * Modular, zero-disruption client component matching the reference
 * model selector panel UI with real backend routing integration.
 */

(function (window, document) {
  'use strict';

  const STORAGE_MODEL_KEY = 'medinvedic_selected_model';
  const STORAGE_EFFORT_KEY = 'medinvedic_selected_effort';

  // Verified default models in case offline / static hosting
  const DEFAULT_MODELS = [
    {
      id: 'medinvedic-expert',
      name: 'MedInVedic Expert',
      category: 'Premium — AI Diagnostic & Wellness Suites',
      badge: 'Premium',
      shortDescription: 'For complex healthcare questions',
      description: 'For complex healthcare questions and evidence-based explanations.',
      accessRequirement: 'premium',
      accessGranted: true, // will be verified via API or user membership
      requiresUpgrade: false,
      imageSupport: true,
      supportedEfforts: ['low', 'medium', 'high'],
      defaultEffort: 'medium',
      isDefault: false
    },
    {
      id: 'medinvedic-advanced',
      name: 'MedInVedic Advanced',
      category: 'Advanced Healthcare Workflows',
      badge: null,
      shortDescription: 'For detailed research and evidence-based answers',
      description: 'For detailed research and comprehensive health information.',
      accessRequirement: 'standard',
      accessGranted: true,
      requiresUpgrade: false,
      imageSupport: true,
      supportedEfforts: ['low', 'medium', 'high'],
      defaultEffort: 'medium',
      isDefault: false
    },
    {
      id: 'medinvedic-balanced',
      name: 'MedInVedic Balanced',
      category: 'AI Health Score & Analytics',
      badge: null,
      shortDescription: 'Best for everyday health information',
      description: 'Best balance of answer quality, speed, and cost.',
      accessRequirement: 'free',
      accessGranted: true,
      requiresUpgrade: false,
      imageSupport: true,
      supportedEfforts: ['low', 'medium'],
      defaultEffort: 'medium',
      isDefault: true
    },
    {
      id: 'medinvedic-quick',
      name: 'MedInVedic Quick',
      category: 'Health Intelligence AI',
      badge: null,
      shortDescription: 'Fast answers to simpler questions',
      description: 'Fast responses for simpler questions.',
      accessRequirement: 'free',
      accessGranted: true,
      requiresUpgrade: false,
      imageSupport: false,
      supportedEfforts: ['low'],
      defaultEffort: 'low',
      isDefault: false
    }
  ];

  class ModelSelector {
    constructor() {
      this.models = [...DEFAULT_MODELS];
      this.selectedModelId = this.loadStoredModel();
      this.selectedEffort = this.loadStoredEffort();
      this.isOpen = false;
      this.featureEnabled = true;
      this.instances = [];

      this.init();
    }

    loadStoredModel() {
      try {
        const stored = localStorage.getItem(STORAGE_MODEL_KEY);
        if (stored && DEFAULT_MODELS.some(m => m.id === stored)) {
          return stored;
        }
      } catch (e) {
        // storage disabled or sandboxed
      }
      return 'medinvedic-balanced';
    }

    loadStoredEffort() {
      try {
        const stored = localStorage.getItem(STORAGE_EFFORT_KEY);
        if (stored && ['low', 'medium', 'high'].includes(stored)) {
          return stored;
        }
      } catch (e) {}
      return 'medium';
    }

    async init() {
      // Sync with server registry if API available
      await this.fetchModelsFromServer();

      // Listen for click-outside and escape
      document.addEventListener('click', (e) => this.handleGlobalClick(e));
      document.addEventListener('keydown', (e) => this.handleGlobalKey(e));
    }

    async fetchModelsFromServer() {
      try {
        const apiBase = window.API_BASE || (window.location.port === '8888' ? 'http://localhost:3001/api' : '/api');
        const token = localStorage.getItem('mv_auth_token') || localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        const res = await fetch(`${apiBase}/models?current=${encodeURIComponent(this.selectedModelId)}`, { headers });
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.models)) {
            this.models = data.models;
            this.featureEnabled = data.featureEnabled !== false;
            // Ensure selected model is valid in retrieved list
            if (!this.models.some(m => m.id === this.selectedModelId)) {
              this.selectedModelId = data.defaultModel || 'medinvedic-balanced';
            }
            this.updateAllInstances();
          }
        }
      } catch (err) {
        // Graceful fallback to DEFAULT_MODELS
      }
    }

    getSelectedModel() {
      return this.models.find(m => m.id === this.selectedModelId) || this.models.find(m => m.id === 'medinvedic-balanced') || this.models[0];
    }

    getSelectedEffort() {
      const model = this.getSelectedModel();
      if (model && model.supportedEfforts && !model.supportedEfforts.includes(this.selectedEffort)) {
        return model.defaultEffort || model.supportedEfforts[0] || 'medium';
      }
      return this.selectedEffort;
    }

    selectModel(modelId) {
      const model = this.models.find(m => m.id === modelId);
      if (!model) return false;

      // Check access requirements
      if (model.requiresUpgrade) {
        this.showUpgradeModal(model);
        return false;
      }

      this.selectedModelId = model.id;
      try {
        localStorage.setItem(STORAGE_MODEL_KEY, model.id);
      } catch (e) {}

      // Clamp effort if not supported by new model
      if (model.supportedEfforts && !model.supportedEfforts.includes(this.selectedEffort)) {
        this.selectedEffort = model.defaultEffort || model.supportedEfforts[0] || 'medium';
        try {
          localStorage.setItem(STORAGE_EFFORT_KEY, this.selectedEffort);
        } catch (e) {}
      }

      this.closeAll();
      this.updateAllInstances();

      // Dispatch change event
      const eventData = {
        modelId: model.id,
        modelName: model.name,
        effort: this.getSelectedEffort(),
        imageSupport: model.imageSupport
      };
      window.dispatchEvent(new CustomEvent('medinvedic:model-changed', { detail: eventData }));
      return true;
    }

    cycleEffort() {
      const model = this.getSelectedModel();
      const supported = (model && model.supportedEfforts) || ['medium'];
      if (supported.length <= 1) return;

      const currentIdx = supported.indexOf(this.selectedEffort);
      const nextIdx = (currentIdx + 1) % supported.length;
      this.selectedEffort = supported[nextIdx];

      try {
        localStorage.setItem(STORAGE_EFFORT_KEY, this.selectedEffort);
      } catch (e) {}

      this.updateAllInstances();

      window.dispatchEvent(new CustomEvent('medinvedic:model-changed', {
        detail: {
          modelId: model.id,
          modelName: model.name,
          effort: this.selectedEffort,
          imageSupport: model.imageSupport
        }
      }));
    }

    showUpgradeModal(model) {
      let modal = document.getElementById('mvUpgradeModal');
      let backdrop = document.getElementById('mvUpgradeBackdrop');

      if (!modal) {
        backdrop = document.createElement('div');
        backdrop.id = 'mvUpgradeBackdrop';
        backdrop.className = 'mv-upgrade-backdrop';

        modal = document.createElement('div');
        modal.id = 'mvUpgradeModal';
        modal.className = 'mv-upgrade-dialog';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');

        modal.innerHTML = `
          <div class="mv-upgrade-title">
            <span>✨</span> MedInVedic Expert Tier
          </div>
          <div class="mv-upgrade-text">
            <strong>${model.name}</strong> is reserved for MedInVedic Premium members. It unlocks deep multi-source clinical synthesis, high-token context reasoning, and prioritized evidence verification.
          </div>
          <div class="mv-upgrade-actions">
            <button class="mv-upgrade-btn cancel" onclick="MedInVedicModelSelector.closeUpgradeModal()">Stay on Current</button>
            <button class="mv-upgrade-btn confirm" onclick="window.location.href='payment.html'">View Premium Plans</button>
          </div>
        `;

        backdrop.addEventListener('click', () => this.closeUpgradeModal());
        document.body.appendChild(backdrop);
        document.body.appendChild(modal);
      }

      backdrop.classList.add('is-open');
      modal.classList.add('is-open');
    }

    closeUpgradeModal() {
      const modal = document.getElementById('mvUpgradeModal');
      const backdrop = document.getElementById('mvUpgradeBackdrop');
      if (modal) modal.classList.remove('is-open');
      if (backdrop) backdrop.classList.remove('is-open');
    }

    closeAll() {
      this.isOpen = false;
      this.instances.forEach(inst => {
        if (inst.trigger) inst.trigger.classList.remove('is-open');
        if (inst.dropdown) inst.dropdown.classList.remove('is-open');
      });
    }

    toggleInstance(inst) {
      if (!this.featureEnabled) return;
      const willOpen = !inst.dropdown.classList.contains('is-open');
      this.closeAll();
      if (willOpen) {
        inst.trigger.classList.add('is-open');
        inst.dropdown.classList.add('is-open');
        this.isOpen = true;
        // Focus first option or active option
        const activeItem = inst.dropdown.querySelector('.mv-model-item.is-active') || inst.dropdown.querySelector('.mv-model-item');
        if (activeItem) activeItem.focus();
      }
    }

    handleGlobalClick(e) {
      if (!this.isOpen) return;
      let clickedInside = false;
      this.instances.forEach(inst => {
        if (inst.container && inst.container.contains(e.target)) {
          clickedInside = true;
        }
      });
      if (!clickedInside) {
        this.closeAll();
      }
    }

    handleGlobalKey(e) {
      if (e.key === 'Escape') {
        this.closeAll();
        this.closeUpgradeModal();
      }
    }

    renderModelSvgIcon(modelId) {
      if (modelId === 'medinvedic-expert') {
        // Stylized intelligence emblem matching reference
        return `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2a4 4 0 0 1 4 4c0 1.5-.8 2.8-2 3.5V11a2 2 0 0 1-2 2v0a2 2 0 0 1-2-2V9.5C8.8 8.8 8 7.5 8 6a4 4 0 0 1 4-4z"/>
            <path d="M10 13a4 4 0 0 0-4 4v1h12v-1a4 4 0 0 0-4-4"/>
            <circle cx="12" cy="6" r="1.5" fill="currentColor"/>
          </svg>
        `;
      }
      return ``;
    }

    renderDropdownHtml() {
      const current = this.getSelectedModel();
      const currentEffort = this.getSelectedEffort();
      const effortDisplay = currentEffort.charAt(0).toUpperCase() + currentEffort.slice(1);

      const itemsHtml = this.models.map(m => {
        const isSelected = m.id === current.id;
        const iconHtml = this.renderModelSvgIcon(m.id);

        return `
          <button type="button"
                  class="mv-model-item ${isSelected ? 'is-active' : ''}"
                  role="option"
                  aria-selected="${isSelected}"
                  data-model-id="${m.id}"
                  onclick="MedInVedicModelSelector.selectModel('${m.id}')">
            <div class="mv-model-item-main">
              ${iconHtml ? `<div class="mv-model-icon">${iconHtml}</div>` : ''}
              <div class="mv-model-info" style="${!iconHtml ? 'padding-left: 2px;' : ''}">
                <div class="mv-model-title-row">
                  <span class="mv-model-name">${m.name}</span>
                  ${m.badge ? `<span class="mv-model-badge ${m.badge.toLowerCase()}">${m.badge}</span>` : ''}
                </div>
                ${m.category ? `<div style="font-size:11px; font-weight:700; color:#34d399; margin: 1px 0 2px;">${m.category}</div>` : ''}
                <p class="mv-model-desc">${m.shortDescription || m.description}</p>
              </div>
            </div>
            ${isSelected ? `
              <div class="mv-model-check">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
            ` : ''}
          </button>
        `;
      }).join('');

      return `
        <div class="mv-model-list" role="listbox" aria-label="Select AI Model">
          ${itemsHtml}
        </div>
        <div class="mv-model-divider"></div>
        <div class="mv-model-footer">
          <button type="button" class="mv-effort-row" onclick="MedInVedicModelSelector.cycleEffort()" title="Click to adjust response effort">
            <span class="mv-effort-label">Response effort</span>
            <span class="mv-effort-val">
              <span>${effortDisplay}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </span>
          </button>
          <p class="mv-model-caption">Illustrative UI concept — availability and access depend on your configuration.</p>
        </div>
      `;
    }

    updateAllInstances() {
      const current = this.getSelectedModel();
      this.instances.forEach(inst => {
        if (inst.label) {
          inst.label.textContent = current.name;
        }
        if (inst.dropdown) {
          inst.dropdown.innerHTML = this.renderDropdownHtml();
        }
      });
    }

    /**
     * Attach selector to a specific container element.
     */
    attachTo(containerIdOrElement, options = {}) {
      const container = typeof containerIdOrElement === 'string'
        ? document.getElementById(containerIdOrElement)
        : containerIdOrElement;

      if (!container) return null;

      const align = options.alignRight ? 'align-right' : '';
      const current = this.getSelectedModel();

      container.style.position = 'relative';
      container.style.display = 'inline-block';

      // Create Trigger
      const trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.className = 'mv-model-trigger';
      trigger.setAttribute('aria-haspopup', 'listbox');
      trigger.setAttribute('aria-expanded', 'false');
      trigger.setAttribute('aria-label', 'Select MedInVedic AI Model');

      trigger.innerHTML = `
        <span class="mv-trigger-icon">⚡</span>
        <span class="mv-trigger-label">${current.name}</span>
        <svg class="mv-trigger-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      `;

      // Create Dropdown
      const dropdown = document.createElement('div');
      dropdown.className = `mv-model-dropdown ${align}`;
      dropdown.innerHTML = this.renderDropdownHtml();

      const inst = {
        container,
        trigger,
        label: trigger.querySelector('.mv-trigger-label'),
        dropdown
      };

      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleInstance(inst);
      });

      // Keyboard navigation within dropdown
      dropdown.addEventListener('keydown', (e) => {
        const items = Array.from(dropdown.querySelectorAll('.mv-model-item'));
        const currentIndex = items.indexOf(document.activeElement);

        if (e.key === 'ArrowDown') {
          e.preventDefault();
          const nextIndex = (currentIndex + 1) % items.length;
          items[nextIndex].focus();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          const prevIndex = (currentIndex - 1 + items.length) % items.length;
          items[prevIndex].focus();
        }
      });

      container.innerHTML = '';
      container.appendChild(trigger);
      container.appendChild(dropdown);

      this.instances.push(inst);
      return inst;
    }
  }

  // Create global singleton
  window.MedInVedicModelSelector = new ModelSelector();

})(window, document);
