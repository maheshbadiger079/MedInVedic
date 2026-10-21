/**
 * MedInVedic Payment System — Cash on Delivery (COD) Adapter
 * 
 * Enforces strict healthcare business rules:
 * - COD is ONLY eligible for physical pharmacy and Ayurveda wellness products.
 * - STRICTLY FORBIDDEN for doctor consultations, digital twin/AI subscriptions,
 *   and wallet top-ups.
 * - Manages lifecycle: PENDING_COD_CONFIRMATION -> OUT_FOR_DELIVERY -> VERIFIED_PAID (upon delivery)
 */

const { BasePaymentProvider, PAYMENT_STATUS, PAYMENT_PROVIDER, PAYMENT_METHOD, VERIFICATION_SOURCE } = require('./payment-provider');

class CodAdapter extends BasePaymentProvider {
  constructor() {
    super(PAYMENT_PROVIDER.COD);
  }

  /**
   * Checks whether an order is eligible for Cash on Delivery.
   * @param {Object} orderContext
   * @returns {{ eligible: boolean, reason?: string }}
   */
  static evaluateEligibility(orderContext) {
    const { type, items } = orderContext;

    // 1. Digital Services & Top-ups are strictly ineligible
    if (type === 'CONSULTATION') {
      return { eligible: false, reason: 'Doctor consultations are digital appointments and require advance payment.' };
    }
    if (type === 'SUBSCRIPTION') {
      return { eligible: false, reason: 'Health memberships and subscriptions cannot be purchased via Cash on Delivery.' };
    }
    if (type === 'WALLET_TOPUP') {
      return { eligible: false, reason: 'Wallet balances cannot be loaded with Cash on Delivery.' };
    }

    // 2. Must be physical pharmacy or ayurveda products
    if (type !== 'PHARMACY_ORDER' && type !== 'AYURVEDA_STORE' && type !== 'PHYSICAL_PRODUCT') {
      return { eligible: false, reason: 'Cash on Delivery is only permitted for eligible physical healthcare goods.' };
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return { eligible: false, reason: 'Order items required to determine COD eligibility.' };
    }

    return { eligible: true };
  }

  /**
   * Creates a COD payment record and order reservation.
   * @param {Object} orderContext
   */
  async createSession(orderContext) {
    const eligibility = CodAdapter.evaluateEligibility(orderContext);
    if (!eligibility.eligible) {
      throw new Error(`COD Ineligible: ${eligibility.reason}`);
    }

    const { amountPaise, currency = 'INR', receipt, deliveryAddress, phone } = orderContext;

    if (!deliveryAddress || !deliveryAddress.address || !deliveryAddress.pincode) {
      throw new Error('Valid physical delivery address and pincode are required for Cash on Delivery.');
    }

    if (!phone) {
      throw new Error('Contact phone number is required to confirm Cash on Delivery dispatch.');
    }

    return {
      success: true,
      provider: PAYMENT_PROVIDER.COD,
      paymentMethod: PAYMENT_METHOD.CASH_ON_DELIVERY,
      amountPaise: Number(amountPaise),
      amountRupees: (Number(amountPaise) / 100).toFixed(2),
      currency: currency.toUpperCase(),
      receipt: receipt || `cod_${Date.now().toString(36)}`,
      status: PAYMENT_STATUS.PENDING_COD_CONFIRMATION,
      deliveryAddress,
      phone,
      instructions: 'Please keep the exact cash amount ready at the time of delivery.'
    };
  }

  /**
   * Confirms payment collection upon physical delivery
   */
  async recordDeliveryCollection(paymentRecord, deliveryAgentInfo = {}) {
    return {
      success: true,
      newStatus: PAYMENT_STATUS.VERIFIED_PAID,
      verificationSource: VERIFICATION_SOURCE.PHYSICAL_COLLECTION,
      reconciliationStatus: 'SETTLED_CASH',
      collectedAt: new Date().toISOString(),
      collectedBy: deliveryAgentInfo.agentId || 'DELIVERY_PARTNER',
      notes: 'Cash collected and verified at customer doorstep upon item handover.'
    };
  }

  /**
   * Cancels a COD order before dispatch
   */
  async cancelSession(paymentId, reason = 'Customer cancelled COD order') {
    return {
      success: true,
      provider: PAYMENT_PROVIDER.COD,
      paymentId,
      status: PAYMENT_STATUS.CANCELLED,
      cancellationReason: reason
    };
  }

  async processRefund(refundPayload) {
    return {
      success: true,
      status: PAYMENT_STATUS.REFUNDED,
      refundId: `cod_refund_${Date.now()}`,
      notes: 'COD refund returned via original cash/bank reversal.'
    };
  }
}

module.exports = {
  CodAdapter
};
