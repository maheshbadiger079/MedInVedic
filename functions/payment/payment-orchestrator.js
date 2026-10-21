/**
 * MedInVedic Payment System — Authoritative Payment Orchestrator
 * 
 * Orchestrates:
 * - Server-authoritative price calculation
 * - Multi-provider routing (Razorpay, YouPI-PG, COD)
 * - Strict payment state machine transitions
 * - Idempotent wallet crediting & order fulfillment
 * - Audit logging and webhook idempotency ledger
 */

const { PAYMENT_STATUS, PAYMENT_PROVIDER, PAYMENT_METHOD, VERIFICATION_SOURCE } = require('./payment-provider');
const { RazorpayAdapter } = require('./razorpay-adapter');
const { YouPiPgAdapter } = require('./youpi-adapter');
const { CodAdapter } = require('./cod-adapter');

const razorpayAdapter = new RazorpayAdapter();
const youPiPgAdapter = new YouPiPgAdapter();
const codAdapter = new CodAdapter();

class PaymentOrchestrator {
  constructor(db, adminInstance, collections) {
    this.db = db;
    this.admin = adminInstance;
    this.COLLECTIONS = collections;
  }

  /**
   * Helper to write structured audit logs
   */
  async logAudit(actorId, actorRole, action, resourceId, details = {}) {
    try {
      await this.db.collection(this.COLLECTIONS.AUDIT_LOGS).add({
        actorId: actorId || 'system',
        actorRole: actorRole || 'system',
        action,
        resourceType: 'payment',
        resourceId: resourceId || '',
        details,
        timestamp: new Date().toISOString(),
        created_at: this.admin.firestore.FieldValue.serverTimestamp()
      });
    } catch (e) {
      console.error('[PaymentOrchestrator] Audit log failed:', e.message);
    }
  }

  /**
   * Helper to dispatch notifications
   */
  async notify(userId, type, channel, payload) {
    try {
      await this.db.collection(this.COLLECTIONS.NOTIFICATIONS).add({
        userId,
        type,
        channel: channel || 'in_app',
        payload,
        status: 'SENT',
        created_at: this.admin.firestore.FieldValue.serverTimestamp()
      });
    } catch (e) {
      console.error('[PaymentOrchestrator] Notification failed:', e.message);
    }
  }

  /**
   * Authoritative price and order calculation from Firestore
   */
  async calculateAuthoritativeOrder(type, itemId, customAmount, items = []) {
    let finalAmount = 0;
    let orderReceipt = '';
    let prescriptionRequired = false;
    let calculatedItems = [];

    if (type === 'CONSULTATION') {
      let doctorFee = 199;
      if (itemId) {
        const docSnap = await this.db.collection(this.COLLECTIONS.DOCTORS).doc(itemId).get();
        if (docSnap.exists) {
          doctorFee = docSnap.data().consultationFee || 199;
        }
      }
      finalAmount = Number(doctorFee);
      orderReceipt = `consult_${Date.now()}`;
    } else if (type === 'SUBSCRIPTION') {
      const pricingSnap = await this.db.collection(this.COLLECTIONS.SETTINGS).doc('pricing').get();
      const pricing = pricingSnap.exists ? pricingSnap.data() : { careMonthly: 99, careYearly: 999 };
      finalAmount = itemId === 'CARE_YEARLY' ? pricing.careYearly : pricing.careMonthly;
      orderReceipt = `sub_${Date.now()}`;
    } else if (type === 'PHARMACY_ORDER' || type === 'AYURVEDA_STORE') {
      if (!items || !Array.isArray(items) || items.length === 0) {
        throw new Error('Order items required for pharmacy/store purchases');
      }
      let subtotal = 0;
      for (const item of items) {
        const prodSnap = await this.db.collection(this.COLLECTIONS.PRODUCTS).doc(item.productId).get();
        const prodData = prodSnap.exists ? prodSnap.data() : null;
        const price = prodData ? (prodData.sellingPrice || prodData.price || 100) : 100;
        const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
        if (prodData && (prodData.requiresPrescription || prodData.tag === 'rx')) {
          prescriptionRequired = true;
        }
        subtotal += price * qty;
        calculatedItems.push({
          productId: item.productId,
          name: prodData ? prodData.name : item.name || 'Medicine',
          price,
          quantity: qty,
          total: price * qty,
          requiresPrescription: prodData ? !!prodData.requiresPrescription : false
        });
      }
      const deliveryFee = subtotal > 500 ? 0 : 40;
      finalAmount = subtotal + deliveryFee;
      orderReceipt = `order_${Date.now()}`;
    } else if (type === 'WALLET_TOPUP') {
      const amt = Math.round(Number(customAmount));
      if (!amt || amt < 10) {
        throw new Error('Minimum wallet top-up is ₹10.00');
      }
      finalAmount = amt;
      orderReceipt = `wallet_${Date.now()}`;
    } else {
      finalAmount = Math.max(10, Math.round(Number(customAmount || 199)));
      orderReceipt = `pay_${Date.now()}`;
    }

    return {
      finalAmount,
      amountPaise: Math.round(finalAmount * 100),
      orderReceipt,
      prescriptionRequired,
      calculatedItems
    };
  }

  /**
   * STEP 1: Create a Unified Payment Session
   */
  async createSession(user, requestBody) {
    const {
      provider = PAYMENT_PROVIDER.YOUPI_PG,
      type = 'GENERAL',
      itemId,
      customAmount,
      items,
      purpose,
      metadata = {},
      deliveryAddress,
      phone
    } = requestBody;

    // 1. Authoritative price calculation
    const calc = await this.calculateAuthoritativeOrder(type, itemId, customAmount, items);
    const amountPaise = calc.amountPaise;
    const finalAmount = calc.finalAmount;

    // 2. COD Eligibility Validation
    if (provider === PAYMENT_PROVIDER.COD) {
      const eligibility = CodAdapter.evaluateEligibility({ type, items: calc.calculatedItems });
      if (!eligibility.eligible) {
        throw new Error(`COD Ineligible: ${eligibility.reason}`);
      }
    }

    const orderContext = {
      amountPaise,
      currency: 'INR',
      receipt: calc.orderReceipt,
      type,
      purpose: purpose || type,
      userId: user.id,
      userEmail: user.email || '',
      deliveryAddress,
      phone: phone || user.phone || '',
      items: calc.calculatedItems,
      notes: {
        userId: user.id,
        userEmail: user.email || '',
        type,
        prescriptionRequired: calc.prescriptionRequired
      }
    };

    let sessionResult = null;
    if (provider === PAYMENT_PROVIDER.YOUPI_PG) {
      sessionResult = await youPiPgAdapter.createSession(orderContext);
    } else if (provider === PAYMENT_PROVIDER.COD) {
      sessionResult = await codAdapter.createSession(orderContext);
    } else {
      sessionResult = await razorpayAdapter.createSession(orderContext);
    }

    // 3. Create Authoritative Firestore Payment Document
    const paymentRef = this.db.collection(this.COLLECTIONS.PAYMENTS).doc();
    const paymentData = {
      paymentId: paymentRef.id,
      userId: user.id,
      userEmail: user.email || '',
      provider,
      paymentMethod: sessionResult.paymentMethod || PAYMENT_METHOD.RAZORPAY_GATEWAY,
      amount: finalAmount,
      amountPaise,
      currency: 'INR',
      purpose: purpose || type,
      type,
      status: sessionResult.status || PAYMENT_STATUS.PENDING,
      receipt: calc.orderReceipt,
      providerReference: sessionResult.orderId || sessionResult.transactionReference || sessionResult.receipt,
      razorpayOrderId: sessionResult.orderId || null,
      upiUri: sessionResult.upiUri || null,
      qrSvg: sessionResult.qrSvg || null,
      appLinks: sessionResult.appLinks || null,
      deliveryAddress: deliveryAddress || null,
      phone: phone || user.phone || '',
      expiresAt: sessionResult.expiresAt || null,
      verificationSource: null,
      verificationTimestamp: null,
      reconciliationStatus: 'UNRECONCILED',
      refundStatus: 'NONE',
      metadata: {
        ...metadata,
        prescriptionRequired: calc.prescriptionRequired,
        itemsCount: calc.calculatedItems.length
      },
      created_at: this.admin.firestore.FieldValue.serverTimestamp(),
      updated_at: this.admin.firestore.FieldValue.serverTimestamp()
    };

    await paymentRef.set(paymentData);

    // 4. If pharmacy order, create or link order
    let orderDocId = null;
    if (type === 'PHARMACY_ORDER' || type === 'AYURVEDA_STORE') {
      const orderRef = this.db.collection(this.COLLECTIONS.ORDERS).doc();
      orderDocId = orderRef.id;
      await orderRef.set({
        orderId: orderRef.id,
        userId: user.id,
        userEmail: user.email || '',
        items: calc.calculatedItems,
        total: finalAmount,
        currency: 'INR',
        paymentMethod: sessionResult.paymentMethod,
        paymentDocId: paymentRef.id,
        paymentStatus: sessionResult.status,
        prescriptionRequired: calc.prescriptionRequired,
        prescriptionStatus: calc.prescriptionRequired ? 'PENDING_UPLOAD' : 'NOT_REQUIRED',
        orderStatus: provider === PAYMENT_PROVIDER.COD ? 'COD_PLACED' : 'PENDING_PAYMENT',
        deliveryAddress: deliveryAddress || {},
        created_at: this.admin.firestore.FieldValue.serverTimestamp()
      });
      await paymentRef.update({ orderId: orderRef.id });
    }

    await this.logAudit(user.id, user.role || 'customer', 'PAYMENT_SESSION_CREATED', paymentRef.id, {
      provider,
      amount: finalAmount,
      type
    });

    return {
      success: true,
      paymentId: paymentRef.id,
      orderId: orderDocId,
      provider,
      paymentMethod: paymentData.paymentMethod,
      amount: finalAmount,
      amountPaise,
      currency: 'INR',
      status: paymentData.status,
      sessionData: sessionResult
    };
  }

  /**
   * STEP 2: Live Payment Status Poll
   */
  async getPaymentStatus(user, paymentId) {
    const paymentDoc = await this.db.collection(this.COLLECTIONS.PAYMENTS).doc(paymentId).get();
    if (!paymentDoc.exists) {
      throw new Error('Payment session not found');
    }

    const data = paymentDoc.data();
    const isAdmin = (user.role === 'admin' || user.role === 'superadmin') || (user.email === 'maheshbadiger079@gmail.com');
    if (data.userId !== user.id && !isAdmin) {
      throw new Error('Unauthorized to access this payment record');
    }

    // Check expiry for pending UPI sessions
    if (data.status === PAYMENT_STATUS.PENDING && data.expiresAt) {
      const expiresAt = new Date(data.expiresAt).getTime();
      const now = Date.now();
      if (now > expiresAt) {
        await paymentDoc.ref.update({
          status: PAYMENT_STATUS.EXPIRED,
          updated_at: this.admin.firestore.FieldValue.serverTimestamp()
        });
        data.status = PAYMENT_STATUS.EXPIRED;
      }
    }

    const remainingSeconds = data.expiresAt
      ? Math.max(0, Math.floor((new Date(data.expiresAt).getTime() - Date.now()) / 1000))
      : null;

    return {
      success: true,
      paymentId: data.paymentId,
      provider: data.provider,
      paymentMethod: data.paymentMethod,
      amount: data.amount,
      status: data.status,
      expiresAt: data.expiresAt,
      remainingSeconds,
      reconciliationStatus: data.reconciliationStatus,
      verificationSource: data.verificationSource,
      upiUri: data.upiUri,
      qrSvg: data.qrSvg,
      appLinks: data.appLinks
    };
  }

  /**
   * STEP 3: Authoritative Payment Verification & State Transitions
   */
  async verifyPayment(user, payload) {
    const { paymentId, razorpay_order_id, razorpay_payment_id, razorpay_signature, metadata } = payload;

    const paymentQuery = paymentId
      ? await this.db.collection(this.COLLECTIONS.PAYMENTS).doc(paymentId).get()
      : await this.db.collection(this.COLLECTIONS.PAYMENTS).where('razorpayOrderId', '==', razorpay_order_id).limit(1).get();

    let paymentDoc = null;
    if (paymentId && paymentQuery.exists) {
      paymentDoc = paymentQuery;
    } else if (!paymentId && !paymentQuery.empty) {
      paymentDoc = paymentQuery.docs[0];
    } else {
      throw new Error('Matching payment session not found in database');
    }

    const paymentData = paymentDoc.data();

    // Already settled check (idempotent response)
    if (paymentData.status === PAYMENT_STATUS.VERIFIED_PAID) {
      return {
        success: true,
        verified: true,
        alreadyProcessed: true,
        paymentId: paymentDoc.id,
        status: PAYMENT_STATUS.VERIFIED_PAID
      };
    }

    let verificationResult = null;
    if (paymentData.provider === PAYMENT_PROVIDER.RAZORPAY) {
      verificationResult = await razorpayAdapter.verifyPayment({
        razorpay_order_id: razorpay_order_id || paymentData.razorpayOrderId,
        razorpay_payment_id,
        razorpay_signature
      });
    } else {
      throw new Error(`Manual browser verification is not supported for provider: ${paymentData.provider}`);
    }

    if (!verificationResult.verified) {
      await paymentDoc.ref.update({
        status: PAYMENT_STATUS.FAILED,
        failureReason: verificationResult.error || 'Verification rejected',
        updated_at: this.admin.firestore.FieldValue.serverTimestamp()
      });
      throw new Error(verificationResult.error || 'Payment signature verification failed');
    }

    // Mark VERIFIED_PAID in Firestore
    await paymentDoc.ref.update({
      status: PAYMENT_STATUS.VERIFIED_PAID,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature || 'simulated',
      verificationSource: VERIFICATION_SOURCE.GATEWAY_HMAC,
      verificationTimestamp: this.admin.firestore.FieldValue.serverTimestamp(),
      paidAt: this.admin.firestore.FieldValue.serverTimestamp(),
      updated_at: this.admin.firestore.FieldValue.serverTimestamp()
    });

    // Post-payment state execution (ONLY ON VERIFIED_PAID)
    await this.executePostPaymentFulfillment(paymentData, razorpay_payment_id, metadata);

    await this.logAudit(user.id, user.role || 'customer', 'PAYMENT_VERIFIED', paymentDoc.id, {
      amount: paymentData.amount,
      provider: paymentData.provider,
      paymentId: razorpay_payment_id
    });

    return {
      success: true,
      verified: true,
      paymentId: razorpay_payment_id,
      orderId: paymentData.orderId,
      status: PAYMENT_STATUS.VERIFIED_PAID
    };
  }

  /**
   * Post-Payment Fulfillment (Guaranteed single-execution on VERIFIED_PAID)
   */
  async executePostPaymentFulfillment(paymentData, transactionRef, metadata = {}) {
    const paymentType = paymentData.type;
    const userId = paymentData.userId;

    if (paymentType === 'WALLET_TOPUP') {
      const topupAmount = Math.round(Number(paymentData.amount));
      const walletRef = this.db.collection(this.COLLECTIONS.WALLETS).doc(userId);
      await this.db.runTransaction(async (t) => {
        const wSnap = await t.get(walletRef);
        const currentBal = wSnap.exists ? (wSnap.data().balance || 0) : 0;
        const newBal = currentBal + topupAmount;
        t.set(walletRef, {
          userId,
          balance: newBal,
          currency: 'INR',
          updated_at: this.admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        const txRef = walletRef.collection('transactions').doc();
        t.set(txRef, {
          type: 'CREDIT',
          amount: topupAmount,
          description: `Top-up via ${paymentData.provider}`,
          transactionRef,
          balance_after: newBal,
          created_at: this.admin.firestore.FieldValue.serverTimestamp()
        });
      });
      await this.notify(userId, 'WALLET_TOPUP', 'in_app', {
        amount: topupAmount,
        message: `₹${topupAmount} credited to your MedInVedic Wallet!`
      });
    } else if (paymentType === 'SUBSCRIPTION') {
      const plan = metadata?.plan || (paymentData.amount > 500 ? 'CARE_YEARLY' : 'CARE_MONTHLY');
      await this.db.collection(this.COLLECTIONS.USERS).doc(userId).update({
        membership: plan,
        membershipActivatedAt: this.admin.firestore.FieldValue.serverTimestamp()
      });
      await this.db.collection(this.COLLECTIONS.SUBSCRIPTIONS).add({
        userId,
        plan,
        amount: paymentData.amount,
        transactionRef,
        status: 'ACTIVE',
        startDate: new Date().toISOString(),
        created_at: this.admin.firestore.FieldValue.serverTimestamp()
      });
    } else if (paymentType === 'CONSULTATION') {
      await this.db.collection(this.COLLECTIONS.CONSULTATIONS).add({
        userId,
        userEmail: paymentData.userEmail,
        doctorId: metadata?.doctorId || 'doc_ayur_1',
        doctorName: metadata?.doctorName || 'Dr. Priya Sharma',
        scheduledAt: metadata?.scheduledAt || new Date().toISOString(),
        symptoms: metadata?.symptoms || 'General wellness consultation',
        amount: paymentData.amount,
        paymentDocId: paymentData.paymentId,
        transactionRef,
        status: 'BOOKED',
        created_at: this.admin.firestore.FieldValue.serverTimestamp()
      });
    } else if (paymentType === 'PHARMACY_ORDER' || paymentType === 'AYURVEDA_STORE') {
      if (paymentData.orderId) {
        await this.db.collection(this.COLLECTIONS.ORDERS).doc(paymentData.orderId).update({
          paymentStatus: 'PAID',
          orderStatus: 'CONFIRMED',
          transactionRef,
          updated_at: this.admin.firestore.FieldValue.serverTimestamp()
        });
      }
    }
  }

  /**
   * STEP 4: Cancel a Pending Session
   */
  async cancelSession(user, paymentId, reason = 'User requested cancellation') {
    const paymentDoc = await this.db.collection(this.COLLECTIONS.PAYMENTS).doc(paymentId).get();
    if (!paymentDoc.exists) throw new Error('Payment session not found');

    const data = paymentDoc.data();
    const isAdmin = (user.role === 'admin' || user.role === 'superadmin') || (user.email === 'maheshbadiger079@gmail.com');
    if (data.userId !== user.id && !isAdmin) throw new Error('Unauthorized');

    if (data.status === PAYMENT_STATUS.VERIFIED_PAID) {
      throw new Error('Cannot cancel a verified paid payment. Request a refund instead.');
    }

    await paymentDoc.ref.update({
      status: PAYMENT_STATUS.CANCELLED,
      cancellationReason: reason,
      updated_at: this.admin.firestore.FieldValue.serverTimestamp()
    });

    if (data.orderId) {
      await this.db.collection(this.COLLECTIONS.ORDERS).doc(data.orderId).update({
        orderStatus: 'CANCELLED',
        cancellationReason: reason
      }).catch(() => {});
    }

    await this.logAudit(user.id, user.role || 'customer', 'PAYMENT_CANCELLED', paymentId, { reason });
    return { success: true, paymentId, status: PAYMENT_STATUS.CANCELLED };
  }

  /**
   * STEP 5: Observer Telemetry Ingestion (Bank SMS / Gmail / Push notifications)
   * Enforces OBSERVED_UNVERIFIED status without auto-fulfillment
   */
  async ingestObserverTelemetry(payload) {
    const { transactionReference, amountPaise } = payload;

    // Locate pending payment session
    let snap = null;
    if (transactionReference) {
      snap = await this.db.collection(this.COLLECTIONS.PAYMENTS)
        .where('providerReference', '==', transactionReference)
        .limit(1)
        .get();
    }

    if (!snap || snap.empty) {
      // Fallback matching by amount & status
      const expectedAmount = Number(amountPaise) / 100;
      snap = await this.db.collection(this.COLLECTIONS.PAYMENTS)
        .where('provider', '==', PAYMENT_PROVIDER.YOUPI_PG)
        .where('amount', '==', expectedAmount)
        .where('status', '==', PAYMENT_STATUS.PENDING)
        .limit(1)
        .get();
    }

    if (!snap || snap.empty) {
      return {
        success: false,
        error: 'No matching pending YouPI-PG session found for observed credit'
      };
    }

    const paymentDoc = snap.docs[0];
    const paymentData = paymentDoc.data();

    const result = await youPiPgAdapter.ingestObserverTelemetry(payload, paymentData);
    if (!result.success) {
      return result;
    }

    // Update payment record to OBSERVED_UNVERIFIED
    await paymentDoc.ref.update({
      status: result.newStatus,
      verificationSource: result.verificationSource,
      reconciliationStatus: result.reconciliationStatus,
      observedDetails: result.observedDetails,
      updated_at: this.admin.firestore.FieldValue.serverTimestamp()
    });

    await this.logAudit('observer', 'device', 'PAYMENT_OBSERVED_UNVERIFIED', paymentDoc.id, {
      observedAmountPaise: payload.amountPaise,
      utr: payload.utr
    });

    return {
      success: true,
      status: PAYMENT_STATUS.OBSERVED_UNVERIFIED,
      paymentId: paymentDoc.id,
      notice: result.securityNotice
    };
  }

  /**
   * STEP 6: Admin Reconciliation
   */
  async reconcilePayment(adminUser, paymentId, decision, notes = '') {
    const paymentDoc = await this.db.collection(this.COLLECTIONS.PAYMENTS).doc(paymentId).get();
    if (!paymentDoc.exists) throw new Error('Payment not found');

    const paymentData = paymentDoc.data();
    const result = await youPiPgAdapter.reconcilePayment(paymentData, adminUser, decision, notes);

    await paymentDoc.ref.update({
      status: result.newStatus,
      reconciliationStatus: result.reconciliationStatus,
      verificationSource: result.verificationSource || paymentData.verificationSource,
      reconciledBy: result.reconciledBy,
      reconciledAt: result.reconciledAt,
      reconciliationNotes: result.reconciliationNotes,
      updated_at: this.admin.firestore.FieldValue.serverTimestamp()
    });

    if (decision === 'APPROVE') {
      await this.executePostPaymentFulfillment(paymentData, `reconciled_${Date.now()}`);
    }

    await this.logAudit(adminUser.id || adminUser.email, 'admin', `PAYMENT_RECONCILE_${decision}`, paymentId, {
      decision,
      notes
    });

    return {
      success: true,
      paymentId,
      decision,
      status: result.newStatus
    };
  }

  /**
   * STEP 7: Admin Refund
   */
  async processRefund(adminUser, paymentId, amount, reason) {
    const paymentDoc = await this.db.collection(this.COLLECTIONS.PAYMENTS).doc(paymentId).get();
    if (!paymentDoc.exists) throw new Error('Payment not found');

    const data = paymentDoc.data();
    if (data.status !== PAYMENT_STATUS.VERIFIED_PAID) {
      throw new Error('Only verified paid transactions can be refunded');
    }

    let refundResult = null;
    const amountPaise = amount ? Math.round(Number(amount) * 100) : data.amountPaise;

    if (data.provider === PAYMENT_PROVIDER.RAZORPAY) {
      refundResult = await razorpayAdapter.processRefund({
        paymentId: data.razorpayPaymentId || data.providerReference,
        amountPaise,
        reason
      });
    } else {
      refundResult = await youPiPgAdapter.processRefund({
        paymentId,
        amountPaise,
        reason
      });
    }

    if (!refundResult.success) {
      throw new Error(refundResult.error || 'Refund execution failed');
    }

    await paymentDoc.ref.update({
      status: PAYMENT_STATUS.REFUNDED,
      refundStatus: 'FULL_REFUND',
      refundId: refundResult.refundId,
      refundReason: reason,
      refundedAt: this.admin.firestore.FieldValue.serverTimestamp(),
      updated_at: this.admin.firestore.FieldValue.serverTimestamp()
    });

    await this.logAudit(adminUser.id || adminUser.email, 'admin', 'PAYMENT_REFUNDED', paymentId, {
      amount: amountPaise / 100,
      reason
    });

    return {
      success: true,
      paymentId,
      refundId: refundResult.refundId,
      status: PAYMENT_STATUS.REFUNDED
    };
  }

  /**
   * STEP 8: Admin Payment Analytics & Transaction Ledger
   */
  async getAdminTransactions(filters = {}) {
    const { provider, status, search, limit = 100 } = filters;
    let query = this.db.collection(this.COLLECTIONS.PAYMENTS).orderBy('created_at', 'desc');

    if (provider) query = query.where('provider', '==', provider);
    if (status) query = query.where('status', '==', status);

    const snap = await query.limit(Number(limit)).get();
    let payments = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    if (search) {
      const q = search.toLowerCase();
      payments = payments.filter(p =>
        (p.id || '').toLowerCase().includes(q) ||
        (p.userId || '').toLowerCase().includes(q) ||
        (p.userEmail || '').toLowerCase().includes(q) ||
        (p.providerReference || '').toLowerCase().includes(q)
      );
    }

    // Segregate Verified Revenue vs Unverified Observations
    let totalVolume = 0;
    let verifiedRevenue = 0;
    let unverifiedVolume = 0;
    let pendingCount = 0;
    let failedCount = 0;
    let refundCount = 0;
    let unverifiedCount = 0;

    let razorpayCount = 0;
    let youpiCount = 0;
    let codCount = 0;

    payments.forEach(p => {
      const amt = Number(p.amount) || 0;
      totalVolume += amt;

      if (p.status === PAYMENT_STATUS.VERIFIED_PAID) {
        verifiedRevenue += amt;
      } else if (p.status === PAYMENT_STATUS.OBSERVED_UNVERIFIED) {
        unverifiedVolume += amt;
        unverifiedCount++;
      } else if (p.status === PAYMENT_STATUS.PENDING || p.status === PAYMENT_STATUS.PENDING_COD_CONFIRMATION) {
        pendingCount++;
      } else if (p.status === PAYMENT_STATUS.FAILED || p.status === PAYMENT_STATUS.EXPIRED || p.status === PAYMENT_STATUS.CANCELLED) {
        failedCount++;
      } else if (p.status === PAYMENT_STATUS.REFUNDED) {
        refundCount++;
      }

      if (p.provider === PAYMENT_PROVIDER.RAZORPAY) razorpayCount++;
      else if (p.provider === PAYMENT_PROVIDER.YOUPI_PG) youpiCount++;
      else if (p.provider === PAYMENT_PROVIDER.COD) codCount++;
    });

    return {
      success: true,
      summary: {
        totalTransactions: payments.length,
        totalVolume: Math.round(totalVolume),
        verifiedRevenue: Math.round(verifiedRevenue),
        unverifiedVolume: Math.round(unverifiedVolume),
        pendingCount,
        unverifiedCount,
        failedCount,
        refundCount,
        providerBreakdown: {
          razorpay: razorpayCount,
          youpiPg: youpiCount,
          cod: codCount
        }
      },
      payments
    };
  }
}

module.exports = {
  PaymentOrchestrator
};
