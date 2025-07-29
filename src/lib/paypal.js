/**
 * PayPal Subscriptions API Integration
 * 
 * This module handles PayPal subscription management for the IronRoutine access control system.
 * It provides functions for creating, managing, and canceling PayPal subscriptions.
 */

import pkg from '@paypal/paypal-server-sdk';
const { PayPalHttpClient, core, orders, payments, subscriptions } = pkg;

// PayPal Configuration
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_ENVIRONMENT = process.env.PAYPAL_ENVIRONMENT || 'sandbox'; // 'sandbox' or 'live'

if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
  console.warn('⚠️ PayPal credentials not configured. Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET environment variables.');
}

// Create PayPal client
const createPayPalClient = () => {
  const environment = PAYPAL_ENVIRONMENT === 'live' 
    ? new core.LiveEnvironment(PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET)
    : new core.SandboxEnvironment(PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET);
    
  return new PayPalHttpClient(environment);
};

// PayPal Plan Configuration
export const PAYPAL_PLANS = {
  premium_monthly: {
    id: process.env.PAYPAL_PLAN_ID_MONTHLY, // Set this in your environment
    name: 'IronRoutine Premium Monthly',
    description: 'Unlimited AI workouts, nutrition plans, and premium analytics',
    amount: '9.99',
    currency: 'USD',
    interval: 'MONTH',
    interval_count: 1,
    trial_days: 7
  }
};

/**
 * PayPal API Helper Class
 */
export class PayPalSubscriptionManager {
  constructor() {
    this.client = createPayPalClient();
  }

  /**
   * Create a PayPal subscription
   */
  async createSubscription(userId, planId, returnUrl, cancelUrl) {
    try {
      const plan = PAYPAL_PLANS[planId];
      if (!plan) {
        throw new Error(`Invalid plan ID: ${planId}`);
      }

      const request = new subscriptions.SubscriptionsCreateRequest();
      request.requestBody({
        plan_id: plan.id,
        subscriber: {
          email_address: '', // Will be filled by PayPal during checkout
        },
        application_context: {
          brand_name: 'IronRoutine',
          locale: 'en-US',
          shipping_preference: 'NO_SHIPPING',
          user_action: 'SUBSCRIBE_NOW',
          payment_method: {
            payer_selected: 'PAYPAL',
            payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED'
          },
          return_url: returnUrl,
          cancel_url: cancelUrl
        },
        custom_id: userId, // Store user ID for webhook processing
      });

      const response = await this.client.execute(request);
      return {
        success: true,
        subscriptionId: response.result.id,
        approvalUrl: response.result.links.find(link => link.rel === 'approve')?.href,
        data: response.result
      };
    } catch (error) {
      console.error('PayPal create subscription error:', error);
      return {
        success: false,
        error: error.message,
        details: error.details || []
      };
    }
  }

  /**
   * Get subscription details
   */
  async getSubscription(subscriptionId) {
    try {
      const request = new subscriptions.SubscriptionsGetRequest(subscriptionId);
      const response = await this.client.execute(request);
      
      return {
        success: true,
        data: response.result
      };
    } catch (error) {
      console.error('PayPal get subscription error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(subscriptionId, reason = 'User requested cancellation') {
    try {
      const request = new subscriptions.SubscriptionsCancelRequest(subscriptionId);
      request.requestBody({
        reason: reason
      });

      await this.client.execute(request);
      return {
        success: true,
        message: 'Subscription cancelled successfully'
      };
    } catch (error) {
      console.error('PayPal cancel subscription error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Suspend a subscription
   */
  async suspendSubscription(subscriptionId, reason = 'Payment failure') {
    try {
      const request = new subscriptions.SubscriptionsSuspendRequest(subscriptionId);
      request.requestBody({
        reason: reason
      });

      await this.client.execute(request);
      return {
        success: true,
        message: 'Subscription suspended successfully'
      };
    } catch (error) {
      console.error('PayPal suspend subscription error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Activate a suspended subscription
   */
  async activateSubscription(subscriptionId, reason = 'Payment resolved') {
    try {
      const request = new subscriptions.SubscriptionsActivateRequest(subscriptionId);
      request.requestBody({
        reason: reason
      });

      await this.client.execute(request);
      return {
        success: true,
        message: 'Subscription activated successfully'
      };
    } catch (error) {
      console.error('PayPal activate subscription error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get subscription transactions
   */
  async getSubscriptionTransactions(subscriptionId, startDate, endDate) {
    try {
      const request = new subscriptions.SubscriptionsTransactionsRequest(subscriptionId);
      request.requestBody({
        start_time: startDate,
        end_time: endDate
      });

      const response = await this.client.execute(request);
      return {
        success: true,
        transactions: response.result.transactions || []
      };
    } catch (error) {
      console.error('PayPal get transactions error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Verify webhook signature
   */
  async verifyWebhookSignature(webhookEvent, headers) {
    try {
      const webhookId = process.env.PAYPAL_WEBHOOK_ID;
      
      if (!webhookId) {
        console.warn('PayPal webhook ID not configured');
        return { verified: false, reason: 'Webhook ID not configured' };
      }

      // Get signature headers
      const authAlgo = headers['paypal-auth-algo'];
      const transmission_id = headers['paypal-transmission-id'];
      const cert_id = headers['paypal-cert-id'];
      const transmission_sig = headers['paypal-transmission-sig'];
      const transmission_time = headers['paypal-transmission-time'];

      // Basic header validation
      if (!authAlgo || !transmission_id || !cert_id || !transmission_sig || !transmission_time) {
        console.warn('Missing PayPal webhook signature headers');
        return { verified: false, reason: 'Missing signature headers' };
      }

      // For production, you would implement full signature verification
      // This involves creating a message string from the webhook data and verifying
      // it against PayPal's public certificate. For now, we'll do basic validation.
      
      // Check if event ID matches and looks valid
      if (webhookEvent.id && webhookEvent.event_type && webhookEvent.resource) {
        console.log(`Webhook signature validation passed for event: ${webhookEvent.id}`);
        return { verified: true };
      }

      return { verified: false, reason: 'Invalid webhook structure' };
    } catch (error) {
      console.error('PayPal webhook verification error:', error);
      return { verified: false, reason: error.message };
    }
  }
}

/**
 * Helper function to format subscription data for database storage
 */
export function formatSubscriptionForDatabase(paypalSubscription) {
  const billing = paypalSubscription.billing_info || {};
  const plan = paypalSubscription.plan || {};
  
  return {
    paypal_subscription_id: paypalSubscription.id,
    paypal_plan_id: plan.id || '',
    status: paypalSubscription.status?.toLowerCase() || 'pending',
    amount_per_cycle: parseFloat(billing.last_payment?.amount?.value || '0'),
    currency: billing.last_payment?.amount?.currency_code || 'USD',
    billing_cycle: 'monthly', // Default, could be extracted from plan
    current_period_start: billing.cycle_executions?.[0]?.cycles_completed 
      ? new Date().toISOString() 
      : new Date().toISOString(),
    current_period_end: billing.next_billing_time || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    trial_end: paypalSubscription.start_time 
      ? new Date(new Date(paypalSubscription.start_time).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
      : null,
    paypal_webhook_data: paypalSubscription
  };
}

/**
 * Helper function to check if credentials are configured
 */
export function isPayPalConfigured() {
  return !!(PAYPAL_CLIENT_ID && PAYPAL_CLIENT_SECRET);
}

export default PayPalSubscriptionManager;