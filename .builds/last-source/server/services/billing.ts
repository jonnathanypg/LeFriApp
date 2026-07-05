/**
 * Migration Path: How this SQL/Logic moves to a decentralized P2P state.
 * Currently, SaaS billing relies on centralized payment gateways (dLocal Go / PayPal) 
 * and central subscription states.
 * To migrate to a decentralized P2P state:
 * 1. Payments will be executed peer-to-peer using cryptocurrencies (USDC/USDT or BTC Lightning Network) 
 *    directly between firms and the network pool.
 * 2. Subscription plans and quotas will be tokenized via dynamic smart contract access tokens (NFTs).
 * 3. Access validation will occur client-side by checking signed ledger records without a central authority database.
 */

import axios from 'axios';
import { LawFirm } from '../../shared/schema';

export class BillingService {
  private dlocalApiKey = process.env.DLOCAL_API_KEY || '';
  private dlocalApiSecret = process.env.DLOCAL_API_SECRET || '';
  private dlocalEnv = (process.env.DLOCAL_ENVIRONMENT || 'sandbox').toLowerCase();
  
  private paypalClientId = process.env.PAYPAL_CLIENT_ID || '';
  private paypalClientSecret = process.env.PAYPAL_CLIENT_SECRET || '';
  private paypalMode = (process.env.PAYPAL_MODE || 'sandbox').toLowerCase();

  // Get dLocal Go URL
  private getDLocalBaseUrl() {
    return this.dlocalEnv === 'production' 
      ? 'https://api.dlocalgo.com/v1' 
      : 'https://api-sbx.dlocalgo.com/v1';
  }

  private getDLocalCheckoutUrl() {
    return this.dlocalEnv === 'production' 
      ? 'https://checkout.dlocalgo.com/validate/subscription' 
      : 'https://checkout-sbx.dlocalgo.com/validate/subscription';
  }

  // Get PayPal Base URL
  private getPayPalBaseUrl() {
    return this.paypalMode === 'production'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';
  }

  // Create dLocal Go Checkout Session
  async createDLocalCheckout(firmId: string, plan: 'pro' | 'enterprise', email: string): Promise<string> {
    const amount = plan === 'pro' ? 49.00 : 149.00;
    const planName = `LeFriApp ${plan.toUpperCase()} Plan`;
    const planDescription = `Suscripción mensual al plan ${plan} de LeFriApp.`;
    
    // Fallback if credentials are not configured
    if (!this.dlocalApiKey || !this.dlocalApiSecret) {
      console.warn("dLocal Go credentials not set. Returning simulator sandbox checkout link.");
      const appUrl = process.env.APP_URL || 'http://localhost:8080';
      return `${appUrl}/api/billing/mock-checkout?provider=dlocal&firmId=${firmId}&plan=${plan}&email=${email}`;
    }

    try {
      const appUrl = process.env.APP_URL || 'http://localhost:8080';
      const notificationUrl = `${appUrl}/api/webhooks/dlocal`;
      const successUrl = `${appUrl}/lawyer-dashboard?payment=success`;
      const backUrl = `${appUrl}/lawyer-dashboard?payment=cancel`;

      // 1. Create a Subscription Plan dynamically
      const headers = {
        'Authorization': `Bearer ${this.dlocalApiKey}:${this.dlocalApiSecret}`,
        'Content-Type': 'application/json'
      };

      const payload = {
        name: planName,
        description: planDescription,
        amount: amount,
        currency: 'USD',
        frequency_type: 'MONTHLY',
        frequency_value: 1,
        notification_url: notificationUrl,
        success_url: successUrl,
        back_url: backUrl,
        error_url: backUrl
      };

      const response = await axios.post(`${this.getDLocalBaseUrl()}/subscription/plan`, payload, { headers });
      const planToken = response.data?.plan_token;
      
      if (!planToken) {
        throw new Error("Failed to retrieve plan token from dLocal Go API response");
      }

      // 2. Generate checkout URL
      return `${this.getDLocalCheckoutUrl()}/${planToken}?external_id=${firmId}&email=${encodeURIComponent(email)}`;
    } catch (error: any) {
      console.error("dLocal Go error:", error.response?.data || error.message);
      // Fallback to simulator in sandbox environments
      const appUrl = process.env.APP_URL || 'http://localhost:8080';
      return `${appUrl}/api/billing/mock-checkout?provider=dlocal&firmId=${firmId}&plan=${plan}&email=${email}`;
    }
  }

  // Fetch PayPal Access Token
  private async getPayPalAccessToken(): Promise<string> {
    const auth = Buffer.from(`${this.paypalClientId}:${this.paypalClientSecret}`).toString('base64');
    const response = await axios.post(`${this.getPayPalBaseUrl()}/v1/oauth2/token`, 'grant_type=client_credentials', {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    return response.data.access_token;
  }

  // Create PayPal Checkout Session
  async createPayPalCheckout(firmId: string, plan: 'pro' | 'enterprise'): Promise<string> {
    const amount = plan === 'pro' ? 49.00 : 149.00;
    
    // Fallback if credentials are not configured
    if (!this.paypalClientId || !this.paypalClientSecret) {
      console.warn("PayPal credentials not set. Returning simulator sandbox checkout link.");
      const appUrl = process.env.APP_URL || 'http://localhost:8080';
      return `${appUrl}/api/billing/mock-checkout?provider=paypal&firmId=${firmId}&plan=${plan}`;
    }

    try {
      const accessToken = await this.getPayPalAccessToken();
      const appUrl = process.env.APP_URL || 'http://localhost:8080';

      const response = await axios.post(`${this.getPayPalBaseUrl()}/v2/checkout/orders`, {
        intent: 'CAPTURE',
        purchase_units: [{
          reference_id: firmId,
          amount: {
            currency_code: 'USD',
            value: amount.toFixed(2)
          },
          description: `Suscripción LeFriApp ${plan.toUpperCase()}`
        }],
        application_context: {
          brand_name: 'LeFriApp',
          landing_page: 'NO_PREFERENCE',
          user_action: 'PAY_NOW',
          return_url: `${appUrl}/api/billing/paypal/success?firmId=${firmId}&plan=${plan}`,
          cancel_url: `${appUrl}/lawyer-dashboard?payment=cancel`
        }
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      const approveLink = response.data?.links?.find((l: any) => l.rel === 'approve')?.href;
      if (!approveLink) {
        throw new Error("PayPal approve link not found in response");
      }
      return approveLink;
    } catch (error: any) {
      console.error("PayPal error:", error.response?.data || error.message);
      const appUrl = process.env.APP_URL || 'http://localhost:8080';
      return `${appUrl}/api/billing/mock-checkout?provider=paypal&firmId=${firmId}&plan=${plan}`;
    }
  }

  // Capture PayPal Order after checkout success
  async capturePayPalOrder(orderId: string): Promise<any> {
    try {
      const accessToken = await this.getPayPalAccessToken();
      const response = await axios.post(`${this.getPayPalBaseUrl()}/v2/checkout/orders/${orderId}/capture`, {}, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error: any) {
      console.error("PayPal capture error:", error.response?.data || error.message);
      throw error;
    }
  }

  // Handle successful payments and upgrade the firm
  async upgradeFirm(firmId: string, plan: 'free' | 'pro' | 'enterprise') {
    const firm = await LawFirm.findById(firmId);
    if (!firm) {
      throw new Error(`Firm not found: ${firmId}`);
    }

    firm.subscriptionPlan = plan;
    firm.updatedAt = new Date();
    // ProBono limits: pro: 10, enterprise: unlimited (999)
    if (plan === 'pro') {
      firm.proBonoLimit = 10;
    } else if (plan === 'enterprise') {
      firm.proBonoLimit = 999;
    } else {
      firm.proBonoLimit = 3;
    }

    await firm.save();
    console.log(`Firm ${firm.name} upgraded successfully to ${plan} plan.`);
  }
}

export const billingService = new BillingService();
export default billingService;
