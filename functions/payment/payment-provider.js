/**
 * MedInVedic Payment System — Core Payment Provider Interface & Contracts
 * 
 * Defines the canonical payment statuses, provider enums, and base interface
 * for all payment gateways (Razorpay, YouPI-PG UPI, Cash on Delivery).
 */

const PAYMENT_STATUS = {
  CREATED: 'CREATED',
  PENDING: 'PENDING',
  OBSERVED_UNVERIFIED: 'OBSERVED_UNVERIFIED',
  VERIFIED_PAID: 'VERIFIED_PAID',
  PENDING_COD_CONFIRMATION: 'PENDING_COD_CONFIRMATION',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  FAILED: 'FAILED',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
  DISPUTED: 'DISPUTED'
};

const PAYMENT_PROVIDER = {
  RAZORPAY: 'RAZORPAY',
  YOUPI_PG: 'YOUPI_PG',
  COD: 'COD'
};

const PAYMENT_METHOD = {
  RAZORPAY_GATEWAY: 'razorpay_gateway',
  UPI_QR: 'upi_qr',
  UPI_INTENT: 'upi_intent',
  CASH_ON_DELIVERY: 'cash_on_delivery'
};

const VERIFICATION_SOURCE = {
  GATEWAY_HMAC: 'GATEWAY_HMAC',
  ADMIN_RECONCILIATION: 'ADMIN_RECONCILIATION',
  PHYSICAL_COLLECTION: 'PHYSICAL_COLLECTION',
  BANK_SETTLEMENT: 'BANK_SETTLEMENT',
  OBSERVER_TELEMETRY: 'OBSERVER_TELEMETRY' // Strictly marked unverified
};

/**
 * Base Abstract Payment Provider
 */
class BasePaymentProvider {
  constructor(providerId) {
    if (new.target === BasePaymentProvider) {
      throw new TypeError('Cannot construct BasePaymentProvider instances directly.');
    }
    this.providerId = providerId;
  }

  /**
   * Initializes a payment session for an authoritative order.
   * @param {Object} orderContext
   * @returns {Promise<Object>} session result
   */
  async createSession(orderContext) {
    throw new Error('createSession() must be implemented by subclass');
  }

  /**
   * Verifies payment authenticity.
   * @param {Object} verificationPayload
   * @returns {Promise<Object>} verification result
   */
  async verifyPayment(verificationPayload) {
    throw new Error('verifyPayment() must be implemented by subclass');
  }

  /**
   * Retrieves live status of a payment session.
   * @param {string} paymentId
   * @param {Object} existingData
   * @returns {Promise<Object>} status result
   */
  async checkStatus(paymentId, existingData) {
    throw new Error('checkStatus() must be implemented by subclass');
  }

  /**
   * Cancels a pending payment session.
   * @param {string} paymentId
   * @param {string} reason
   * @returns {Promise<Object>} cancellation result
   */
  async cancelSession(paymentId, reason) {
    throw new Error('cancelSession() must be implemented by subclass');
  }

  /**
   * Initiates a refund.
   * @param {Object} refundPayload
   * @returns {Promise<Object>} refund result
   */
  async processRefund(refundPayload) {
    throw new Error('processRefund() must be implemented by subclass');
  }
}

module.exports = {
  PAYMENT_STATUS,
  PAYMENT_PROVIDER,
  PAYMENT_METHOD,
  VERIFICATION_SOURCE,
  BasePaymentProvider
};
