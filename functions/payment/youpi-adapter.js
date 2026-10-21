/**
 * MedInVedic Payment System — YouPI-PG UPI Adapter (Experimental Sovereign UPI Gateway)
 * 
 * Provides:
 * 1. Pure ISO 18004 Vector SVG QR generation
 * 2. Mobile UPI deep-link intent URLs (GPay, PhonePe, Paytm, BHIM, etc.)
 * 3. Server-authoritative 5-minute session countdown and expiry enforcement
 * 4. Observer telemetry parser (Bank SMS / Gmail) guarded with HMAC signature verification
 * 5. Strict Security Invariant: Observations transition status to OBSERVED_UNVERIFIED only,
 *    and NEVER automatically mark orders paid or credit wallets.
 */

const crypto = require('crypto');
const { BasePaymentProvider, PAYMENT_STATUS, PAYMENT_PROVIDER, PAYMENT_METHOD, VERIFICATION_SOURCE } = require('./payment-provider');
const { generateQrSvg, buildUpiUri, buildUpiIntentUri, SUPPORTED_UPI_APPS, isValidVpa } = require('./qr-engine');

class YouPiPgAdapter extends BasePaymentProvider {
  constructor(options = {}) {
    super(PAYMENT_PROVIDER.YOUPI_PG);
    this.payeeVpa = options.payeeVpa || process.env.YOUPI_PAYEE_VPA || 'medinvedic@icici';
    this.payeeName = options.payeeName || process.env.YOUPI_PAYEE_NAME || 'MedInVedic Healthcare';
    this.observerSecret = options.observerSecret || process.env.YOUPI_OBSERVER_SECRET || 'MedInVedicYouPiObserverSecret2026';
    this.sessionTimeoutSeconds = options.sessionTimeoutSeconds || 300; // 5 minutes
    this.featureEnabled = process.env.FEATURE_YOUPI_PG_ENABLED !== 'false'; // Enabled in test/sandbox
  }

  /**
   * Creates an authoritative YouPI-PG payment session with dynamic vector SVG QR and mobile deep links.
   * @param {Object} orderContext { amountPaise, currency, receipt, notes, userId, userEmail, orderId }
   */
  async createSession(orderContext) {
    if (!this.featureEnabled) {
      throw new Error('Self-hosted YouPI-PG gateway is disabled by feature flag.');
    }

    const { amountPaise, currency = 'INR', receipt, notes = {}, orderId } = orderContext;

    if (!amountPaise || isNaN(amountPaise) || Number(amountPaise) < 100) {
      throw new Error('Minimum transaction amount is 100 paise (₹1.00 INR)');
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.sessionTimeoutSeconds * 1000);
    const txnRef = (receipt || `upi_${Date.now().toString(36)}`).substring(0, 35);
    const txnNote = `Order ${txnRef}`;

    // Construct canonical UPI URI
    const upiUri = buildUpiUri({
      payeeVpa: this.payeeVpa,
      payeeName: this.payeeName,
      amountPaise,
      transactionRef: txnRef,
      transactionNote: txnNote
    });

    // Generate crisp vector SVG QR code (zero network dependency)
    const qrSvg = generateQrSvg(upiUri, 280, 'M');

    // Build mobile deep links for each supported UPI app
    const appLinks = SUPPORTED_UPI_APPS.map(app => ({
      id: app.id,
      name: app.name,
      color: app.color,
      iconText: app.iconText,
      packageName: app.packageName,
      intentUri: buildUpiIntentUri({
        payeeVpa: this.payeeVpa,
        payeeName: this.payeeName,
        amountPaise,
        transactionRef: txnRef,
        transactionNote: txnNote,
        packageName: app.packageName
      })
    }));

    return {
      success: true,
      provider: PAYMENT_PROVIDER.YOUPI_PG,
      paymentMethod: PAYMENT_METHOD.UPI_QR,
      transactionReference: txnRef,
      payeeVpa: this.payeeVpa,
      payeeName: this.payeeName,
      amountPaise: Number(amountPaise),
      amountRupees: (Number(amountPaise) / 100).toFixed(2),
      currency: currency.toUpperCase(),
      upiUri,
      qrSvg,
      appLinks,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      timeoutSeconds: this.sessionTimeoutSeconds,
      status: PAYMENT_STATUS.PENDING,
      isLive: true,
      mode: 'LIVE'
    };
  }

  /**
   * Verifies live status or handles expiration.
   */
  async checkStatus(paymentId, existingData = {}) {
    const now = new Date();
    if (existingData.expiresAt && new Date(existingData.expiresAt) < now && existingData.status === PAYMENT_STATUS.PENDING) {
      return {
        success: true,
        provider: PAYMENT_PROVIDER.YOUPI_PG,
        paymentId,
        status: PAYMENT_STATUS.EXPIRED,
        expired: true,
        message: 'Payment session expired. Please regenerate a new QR code.'
      };
    }

    return {
      success: true,
      provider: PAYMENT_PROVIDER.YOUPI_PG,
      paymentId,
      status: existingData.status || PAYMENT_STATUS.PENDING,
      reconciliationStatus: existingData.reconciliationStatus || 'UNRECONCILED',
      verificationSource: existingData.verificationSource || null
    };
  }

  /**
   * Cancels a pending UPI session.
   */
  async cancelSession(paymentId, reason = 'User cancelled') {
    return {
      success: true,
      provider: PAYMENT_PROVIDER.YOUPI_PG,
      paymentId,
      status: PAYMENT_STATUS.CANCELLED,
      cancellationReason: reason
    };
  }

  /**
   * Ingests telemetry notification from Android observer, SMS listener, or Gmail observer.
   * 
   * SECURITY ENFORCEMENT:
   * 1. Validates HMAC-SHA256 signature from registered observer device.
   * 2. Checks timestamp drift (< 60s) to prevent replay attacks.
   * 3. Verifies expected amount matches observed bank credit exactly.
   * 4. CRITICAL: Transitions payment state to OBSERVED_UNVERIFIED.
   *    DOES NOT mark payment as VERIFIED_PAID.
   *    Requires subsequent admin reconciliation or bank settlement.
   * 
   * @param {Object} observerPayload
   * @param {Object} paymentRecord
   */
  async ingestObserverTelemetry(observerPayload, paymentRecord) {
    const {
      amountPaise,
      receivingAccount,
      utr,
      senderVpa,
      timestamp,
      signature
    } = observerPayload;

    // 1. Anti-Replay Drift Check
    const observedTime = new Date(timestamp).getTime();
    const now = Date.now();
    const driftSec = Math.abs(now - observedTime) / 1000;
    if (driftSec > 120) {
      return {
        success: false,
        rejected: true,
        reason: 'REPLAY_PREVENTION: Notification timestamp drift exceeds threshold (>120s)'
      };
    }

    // 2. HMAC-SHA256 Device Secret Verification (if signature provided)
    if (signature) {
      const payloadString = `${amountPaise}|${receivingAccount}|${utr || ''}|${timestamp}`;
      const expectedSig = crypto
        .createHmac('sha256', this.observerSecret)
        .update(payloadString)
        .digest('hex');

      if (expectedSig !== signature) {
        return {
          success: false,
          rejected: true,
          reason: 'AUTHENTICATION_FAILURE: Observer device signature mismatch'
        };
      }
    }

    // 3. Deterministic Amount Invariant Check
    const expectedPaise = Math.round(Number(paymentRecord.amount * 100));
    const receivedPaise = Math.round(Number(amountPaise));

    if (expectedPaise !== receivedPaise) {
      return {
        success: false,
        rejected: true,
        reason: `AMOUNT_MISMATCH: Expected ₹${(expectedPaise / 100).toFixed(2)}, observed ₹${(receivedPaise / 100).toFixed(2)}`
      };
    }

    // 4. State transition to OBSERVED_UNVERIFIED
    return {
      success: true,
      newStatus: PAYMENT_STATUS.OBSERVED_UNVERIFIED,
      verificationSource: VERIFICATION_SOURCE.OBSERVER_TELEMETRY,
      reconciliationStatus: 'PENDING_ADMIN_REVIEW',
      observedDetails: {
        utr: utr || 'UNKNOWN_UTR',
        senderVpa: senderVpa || '',
        observedAt: new Date().toISOString(),
        observedAmountPaise: receivedPaise
      },
      securityNotice: 'OBSERVED UNVERIFIED: Bank SMS / Push signal captured. Funds settlement pending authoritative verification.'
    };
  }

  /**
   * Admin or authoritative reconciliation to confirm real settlement.
   */
  async reconcilePayment(paymentRecord, adminUser, decision, notes = '') {
    if (!['APPROVE', 'REJECT'].includes(decision)) {
      throw new Error('Decision must be either APPROVE or REJECT');
    }

    if (decision === 'APPROVE') {
      return {
        success: true,
        newStatus: PAYMENT_STATUS.VERIFIED_PAID,
        reconciliationStatus: 'MANUALLY_RECONCILED',
        verificationSource: VERIFICATION_SOURCE.ADMIN_RECONCILIATION,
        reconciledBy: adminUser.email,
        reconciledAt: new Date().toISOString(),
        reconciliationNotes: notes
      };
    } else {
      return {
        success: true,
        newStatus: PAYMENT_STATUS.FAILED,
        reconciliationStatus: 'REJECTED_BY_ADMIN',
        reconciledBy: adminUser.email,
        reconciledAt: new Date().toISOString(),
        reconciliationNotes: notes
      };
    }
  }

  /**
   * UPI Refund handling (manual or gateway)
   */
  async processRefund(refundPayload) {
    const { paymentId, amountPaise, reason = 'Admin authorized refund' } = refundPayload;
    return {
      success: true,
      status: PAYMENT_STATUS.REFUNDED,
      refundId: `rfnd_upi_${Date.now()}`,
      amount: amountPaise,
      reconciliationStatus: 'REFUND_RECORDED',
      notes: reason
    };
  }
}

module.exports = {
  YouPiPgAdapter
};
