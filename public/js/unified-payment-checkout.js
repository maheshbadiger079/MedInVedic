/**
 * MedInVedic Unified Payment Checkout Client
 * 
 * Unifies:
 * 1. Razorpay Gateway (Cards, NetBanking, Razorpay UPI)
 * 2. Self-Hosted YouPI-PG UPI (Dynamic Vector QR + Mobile Intent Links + Polling + Decoupled Timers)
 * 3. Cash on Delivery (COD) for eligible physical healthcare goods
 * 4. MedInVedic Verified Patient Wallet
 */

(function (window) {
  const UnifiedCheckout = {
    apiBase: window.location.origin.includes('localhost') ? 'http://localhost:3001/api' : '/api',
    activePollingInterval: null,
    activeCountdownInterval: null,
    currentSession: null,

    /**
     * Evaluates whether an order is eligible for Cash on Delivery.
     * Blocked for online consultations, digital subscriptions, and wallet top-ups.
     */
    isCodEligible(orderContext = {}) {
      const type = orderContext.type || 'GENERAL';
      if (type === 'CONSULTATION' || type === 'SUBSCRIPTION' || type === 'WALLET_TOPUP') {
        return { eligible: false, reason: 'COD is not permitted for digital consultations and wallet recharges.' };
      }
      return { eligible: true };
    },

    /**
     * Creates an authoritative payment session on the backend.
     */
    async createSession(options = {}) {
      const token = localStorage.getItem('mv_token') || '';
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${this.apiBase}/payments/session`, {
        method: 'POST',
        headers,
        body: JSON.stringify(options)
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Failed to create payment session' }));
        throw new Error(err.error || 'Server error creating session');
      }

      const data = await res.json();
      this.currentSession = data;
      return data;
    },

    /**
     * Polls payment status from server.
     */
    async fetchStatus(paymentId) {
      const token = localStorage.getItem('mv_token') || '';
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${this.apiBase}/payments/status/${paymentId}`, {
        method: 'GET',
        headers
      });

      if (!res.ok) {
        throw new Error('Unable to retrieve payment status');
      }

      return await res.json();
    },

    /**
     * Cancels a pending payment session.
     */
    async cancelSession(paymentId, reason = 'Customer cancelled') {
      const token = localStorage.getItem('mv_token') || '';
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      this.stopPolling();
      const res = await fetch(`${this.apiBase}/payments/cancel`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ paymentId, reason })
      });

      return await res.json();
    },

    /**
     * Starts countdown timer
     */
    startCountdown(totalSeconds, onTick, onExpire) {
      if (this.activeCountdownInterval) clearInterval(this.activeCountdownInterval);
      let remaining = totalSeconds;

      onTick(remaining);
      this.activeCountdownInterval = setInterval(() => {
        remaining--;
        if (remaining <= 0) {
          clearInterval(this.activeCountdownInterval);
          this.activeCountdownInterval = null;
          if (onExpire) onExpire();
        } else {
          onTick(remaining);
        }
      }, 1000);
    },

    /**
     * Starts status polling for UPI session
     */
    startPolling(paymentId, onStatusChange, intervalMs = 4000) {
      this.stopPolling();
      this.activePollingInterval = setInterval(async () => {
        try {
          const statusData = await this.fetchStatus(paymentId);
          onStatusChange(statusData);

          if (statusData.status === 'VERIFIED_PAID' || statusData.status === 'FAILED' || statusData.status === 'EXPIRED' || statusData.status === 'CANCELLED') {
            this.stopPolling();
          }
        } catch (e) {
          console.warn('[UnifiedCheckout] Polling error:', e.message);
        }
      }, intervalMs);
    },

    stopPolling() {
      if (this.activePollingInterval) {
        clearInterval(this.activePollingInterval);
        this.activePollingInterval = null;
      }
      if (this.activeCountdownInterval) {
        clearInterval(this.activeCountdownInterval);
        this.activeCountdownInterval = null;
      }
    }
  };

  window.UnifiedCheckout = UnifiedCheckout;
})(window);
