/**
 * Razorpay Standard Web Checkout — MedInVedic Frontend Client
 * Handles:
 * 1. Calling /api/create-order
 * 2. Opening Razorpay modal with order_id
 * 3. Calling /api/verify-payment with razorpay_payment_id, razorpay_order_id, razorpay_signature
 */

(function (window) {
  const RazorpayCheckout = {
    // API endpoint base URL
    apiBase: window.location.origin.includes('localhost') ? 'http://localhost:3001/api' : '/api',

    /**
     * Start standard payment flow
     * @param {Object} config - { amount (in rupees or paise), isPaise, currency, name, description, prefill, onSuccess, onError, onDismiss }
     */
    async pay(config = {}) {
      const {
        amount,
        isPaise = false,
        currency = 'INR',
        name = 'MedInVedic Healthcare',
        description = 'Healthcare Consultation & Medicine Order',
        image = '../images/assets/logo.png',
        notes = {},
        prefill = {},
        theme = { color: '#166534' },
        onSuccess,
        onError,
        onDismiss
      } = config;

      if (!amount || isNaN(amount)) {
        const err = new Error('Valid payment amount is required.');
        if (onError) onError(err);
        else alert('Error: ' + err.message);
        return;
      }

      // Convert to paise if passed in rupees
      const amountInPaise = isPaise ? Math.round(Number(amount)) : Math.round(Number(amount) * 100);

      if (amountInPaise < 100) {
        const err = new Error('Amount must be at least ₹1.00 (100 paise).');
        if (onError) onError(err);
        else alert('Error: ' + err.message);
        return;
      }

      try {
        // STEP 1: BACKEND - Create Order
        const orderResponse = await fetch(`${this.apiBase}/create-order`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: amountInPaise,
            currency,
            receipt: `rcpt_${Date.now().toString(36)}`,
            notes
          })
        });

        if (!orderResponse.ok) {
          const errData = await orderResponse.json().catch(() => ({}));
          throw new Error(errData.error || 'Failed to initialize payment order on server.');
        }

        const orderData = await orderResponse.json();
        const order_id = orderData.order_id || orderData.id;
        const key = orderData.key_id || 'rzp_test_TWeYnZSNVtPrKQ';

        if (!order_id) {
          throw new Error('Server returned invalid order_id.');
        }

        // STEP 2: FRONTEND - Open Razorpay Modal
        if (typeof Razorpay === 'undefined') {
          throw new Error('Razorpay SDK not loaded. Ensure checkout.js is included.');
        }

        const self = this;

        const options = {
          key: key,
          amount: orderData.amount || amountInPaise,
          currency: orderData.currency || currency,
          name: name,
          description: description,
          image: image,
          order_id: order_id,
          handler: async function (response) {
            try {
              // STEP 3: BACKEND - Verify Signature
              const verifyResponse = await fetch(`${self.apiBase}/verify-payment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature
                })
              });

              const verifyData = await verifyResponse.json();

              if (verifyResponse.ok && (verifyData.success || verifyData.verified)) {
                if (onSuccess) {
                  onSuccess({
                    verified: true,
                    payment_id: response.razorpay_payment_id,
                    order_id: response.razorpay_order_id,
                    signature: response.razorpay_signature,
                    amount: amountInPaise / 100,
                    data: verifyData
                  });
                } else {
                  alert(`✅ Payment of ₹${(amountInPaise / 100).toFixed(2)} Successful!\nPayment ID: ${response.razorpay_payment_id}`);
                }
              } else {
                const verErr = new Error(verifyData.error || 'Payment signature verification failed.');
                if (onError) onError(verErr, response);
                else alert('⚠️ Verification Error: ' + verErr.message);
              }
            } catch (verErr) {
              if (onError) onError(verErr, response);
              else alert('Payment verification network error: ' + verErr.message);
            }
          },
          prefill: {
            name: prefill.name || 'MedInVedic Patient',
            email: prefill.email || 'patient@medinvedic.com',
            contact: prefill.contact || '9876543210'
          },
          modal: {
            ondismiss: function () {
              if (onDismiss) onDismiss();
              else console.log('Payment modal dismissed');
            }
          },
          theme: theme
        };

        const rzp = new Razorpay(options);
        rzp.on('payment.failed', function (resp) {
          const failErr = new Error(resp.error?.description || 'Payment failed or declined');
          failErr.details = resp.error;
          if (onError) onError(failErr);
          else alert(`❌ Payment failed: ${failErr.message}`);
        });

        rzp.open();
      } catch (err) {
        console.error('Razorpay checkout error:', err);
        if (onError) onError(err);
        else alert('Error: ' + err.message);
      }
    }
  };

  window.RazorpayCheckout = RazorpayCheckout;
})(typeof window !== 'undefined' ? window : this);
